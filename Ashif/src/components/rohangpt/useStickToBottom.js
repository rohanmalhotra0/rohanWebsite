import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const NEAR_BOTTOM_PX = 48;
const EDGE_PX = 16;

/**
 * Keeps the conversation pinned to its newest message unless the reader has
 * scrolled up. Only a scroll that moves up counts as the reader leaving, so
 * programmatic scrolls (which always move down) never unstick it, and
 * scrolling back to the bottom sticks it again. Nothing is pinned while
 * `active` is false (the empty state reads from the top).
 */
export default function useStickToBottom(scrollRef, contentRef, active) {
  const stickRef = useRef(true);
  const activeRef = useRef(active);
  // Where revealReply put the view; its own scroll event must not re-stick.
  const placedAtRef = useRef(null);

  // Updated before ResizeObserver callbacks run for the same commit.
  useLayoutEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return undefined;

    let lastTop = scroller.scrollTop;
    const onScroll = () => {
      const top = scroller.scrollTop;
      const placedAt = placedAtRef.current;
      placedAtRef.current = null;
      if (placedAt === null || Math.abs(top - placedAt) > 1) {
        const distance = scroller.scrollHeight - top - scroller.clientHeight;
        if (distance <= NEAR_BOTTOM_PX) stickRef.current = true;
        else if (top < lastTop) stickRef.current = false;
      }
      lastTop = top;
    };

    // The content grows with new messages; the scroller shrinks when the
    // input grows. Either way, stay at the bottom if we were there.
    const observer = new ResizeObserver(() => {
      if (activeRef.current && stickRef.current) scroller.scrollTop = scroller.scrollHeight;
    });
    observer.observe(content);
    observer.observe(scroller);
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener('scroll', onScroll);
    };
  }, [scrollRef, contentRef]);

  /** Jump to the newest message and stick there. */
  const scrollToBottom = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    stickRef.current = true;
    scroller.scrollTop = scroller.scrollHeight;
  }, [scrollRef]);

  /**
   * Show a new reply: all of it when it fits. A reply taller than the view is
   * shown from its top instead (with the question above it, if that is
   * short), so it reads from the start rather than the end.
   */
  const revealReply = useCallback(
    (reply) => {
      const scroller = scrollRef.current;
      if (!scroller || !reply || !stickRef.current) return;

      const viewTop = scroller.getBoundingClientRect().top - scroller.scrollTop;
      const topOf = (element) => element.getBoundingClientRect().top - viewTop;
      const bottom = scroller.scrollHeight - scroller.clientHeight;
      const replyTop = topOf(reply);
      if (replyTop - EDGE_PX >= bottom) {
        scroller.scrollTop = bottom;
        return;
      }

      const question = reply.previousElementSibling;
      const withQuestion = question && replyTop - topOf(question) < scroller.clientHeight / 3;
      scroller.scrollTop = Math.max(0, (withQuestion ? topOf(question) : replyTop) - EDGE_PX);
      placedAtRef.current = scroller.scrollTop;
      stickRef.current = false;
    },
    [scrollRef]
  );

  return { scrollToBottom, revealReply };
}
