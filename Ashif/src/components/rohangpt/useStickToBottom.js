import { useCallback, useEffect, useRef, useState } from 'react';

const NEAR_BOTTOM_PX = 56;

/**
 * Keeps a scroll container pinned to the bottom while its content grows
 * (new messages, the typewriter), unless the reader has scrolled up.
 * Returns {atBottom, scrollToBottom}.
 */
export default function useStickToBottom(scrollRef, contentRef) {
  const stickRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return undefined;

    const onScroll = () => {
      const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      stickRef.current = distance < NEAR_BOTTOM_PX;
      setAtBottom(stickRef.current);
    };

    // Content height changes on every new message and typewriter frame.
    const observer = new ResizeObserver(() => {
      if (stickRef.current) scroller.scrollTop = scroller.scrollHeight;
      else onScroll();
    });

    scroller.addEventListener('scroll', onScroll, { passive: true });
    observer.observe(content);
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [scrollRef, contentRef]);

  const scrollToBottom = useCallback(
    (behavior = 'auto') => {
      const scroller = scrollRef.current;
      if (!scroller) return;
      stickRef.current = true;
      setAtBottom(true);
      scroller.scrollTo({ top: scroller.scrollHeight, behavior });
    },
    [scrollRef]
  );

  return { atBottom, scrollToBottom };
}
