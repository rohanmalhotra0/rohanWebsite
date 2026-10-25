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
      const distance = scroller.scrollHeight - top - scroller.clientHeight;
      if (distance <= NEAR_BOTTOM_PX) stickRef.current = true;
      else if (top < lastTop) stickRef.current = false;
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
   * Show a new reply: all of it when it fits; otherwise from its top (with
   * the question above it, if that is short), so it reads from the start.
   */
  const revealReply = useCallback(
    (reply) => {
      const scroller = scrollRef.current;
      if (!scroller || !reply || !stickRef.current) return;

      const viewTop = scroller.getBoundingClientRect().top - scroller.scrollTop;
      const topOf = (element) => element.getBoundingClientRect().top - viewTop;
      const question = reply.previousElementSibling;
      let target = topOf(reply) - EDGE_PX;
      if (question && target - topOf(question) < scroller.clientHeight / 3) {
        target = topOf(question) - EDGE_PX;
      }

      const bottom = scroller.scrollHeight - scroller.clientHeight;
      if (target >= bottom) {
        scroller.scrollTop = bottom;
      } else {
        scroller.scrollTop = Math.max(0, target);
        stickRef.current = false;
      }
    },
    [scrollRef]
  );

  return { scrollToBottom, revealReply };
}
