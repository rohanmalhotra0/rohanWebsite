import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Check, Search, X } from 'lucide-react';
import { Kbd } from '@/components/primitives/Tag';
import { focusChat } from '@/lib/events';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { useFocusTrap, useModalFocus, useScrollLock, useVisualViewportHeight } from './hooks';
import { centerOf, copyText, downloadFile, openExternal } from './navigation';
import { getPaletteItems, searchPalette } from './paletteItems';

const EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;
const COPIED_MS = 1800;

/**
 * ⌘K command palette: a modal combobox over every section, project, paper,
 * and site action, with fuzzy search and full keyboard control.
 * `onNavigate(id)` scrolls to a section and keeps the navbar marker in step.
 */
export default function CommandPalette({ open, onClose, onNavigate }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const afterExit = useRef(null);

  useScrollLock(open);
  useFocusTrap(dialogRef, open);
  const restoreFocus = useModalFocus(open, { initialRef: inputRef, containerRef: dialogRef });

  /** Close; optionally skip giving focus back, or run `after` once the exit animation ends. */
  const requestClose = ({ restore = true, after } = {}) => {
    restoreFocus.current = restore;
    afterExit.current = after ?? null;
    onClose();
  };

  return (
    <AnimatePresence
      onExitComplete={() => {
        const run = afterExit.current;
        afterExit.current = null;
        run?.();
      }}
    >
      {open ? (
        <Palette
          key="palette"
          dialogRef={dialogRef}
          inputRef={inputRef}
          requestClose={requestClose}
          onNavigate={onNavigate}
        />
      ) : null}
    </AnimatePresence>
  );
}

function Palette({ dialogRef, inputRef, requestClose, onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const keyboardMove = useRef(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const uid = useId().replace(/[^\w-]/g, '');
  const listboxId = `${uid}-listbox`;
  const optionId = (index) => `${uid}-option-${index}`;

  useVisualViewportHeight(rootRef);

  const items = useMemo(() => getPaletteItems(theme), [theme]);
  const { groups, flat, count } = useMemo(() => searchPalette(query, items), [query, items]);
  const activeEntry = flat[activeIndex] ?? flat[0];
  const hasQuery = query.trim().length > 0;

  // Keep the keyboard-selected option in view (pointer hover never scrolls).
  useLayoutEffect(() => {
    if (!keyboardMove.current) return;
    keyboardMove.current = false;
    const list = listRef.current;
    const option = document.getElementById(`${uid}-option-${activeIndex}`);
    if (!list || !option) return;
    if (activeIndex === 0) {
      list.scrollTop = 0;
      return;
    }
    // For the first option in a group, bring the group heading along too.
    const group = option.closest('[role="group"]');
    const isFirst = group?.querySelector('[role="option"]') === option;
    const top = (isFirst ? group.offsetTop : option.offsetTop) - 6;
    const bottom = option.offsetTop + option.offsetHeight + 6;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [activeIndex, uid]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(null), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const move = (index) => {
    keyboardMove.current = true;
    setActiveIndex(index);
  };

  // Hand focus to the page before navigating, so the browser's next Tab
  // starts from the section we scroll to rather than from the palette.
  const leaveFor = (go) => {
    requestClose({ restore: false });
    inputRef.current?.blur();
    // A frame later the scroll lock is gone and the palette is on its way out.
    requestAnimationFrame(go);
  };

  const run = ({ item }) => {
    const { action } = item;
    switch (action.type) {
      case 'section':
        leaveFor(() => onNavigate(action.id));
        break;
      case 'ask':
        leaveFor(() => focusChat(action.prompt));
        break;
      case 'url':
        // Open synchronously, inside the key/click gesture, so it isn't blocked.
        openExternal(action.href);
        requestClose();
        break;
      case 'download':
        downloadFile(action.href);
        requestClose();
        break;
      case 'mailto':
        requestClose();
        window.location.href = action.href;
        break;
      case 'hash':
        requestClose({ restore: false });
        window.location.hash = action.hash;
        break;
      case 'copy':
        copyText(action.text).then((ok) => {
          setCopied({ id: item.id, ok });
          setAnnouncement(ok ? 'Email copied' : 'Could not copy the email');
        });
        break;
      case 'theme':
        // Switch once the palette is gone, so the circular reveal grows from
        // the navbar toggle over a clean page instead of a fading dialog.
        requestClose({
          after: () => toggleTheme(centerOf(document.querySelector('[data-theme-toggle]'))),
        });
        break;
      default:
        break;
    }
  };

  const onKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      requestClose();
      return;
    }
    // List keys only apply while typing; Enter on the close button must still click it.
    if (event.target !== inputRef.current || !flat.length) return;
    const last = flat.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(activeIndex >= last ? 0 : activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(activeIndex <= 0 ? last : activeIndex - 1);
        break;
      case 'Home':
      case 'End':
        // Shift+Home/End still selects text in the field.
        if (event.shiftKey) break;
        event.preventDefault();
        move(event.key === 'Home' ? 0 : last);
        break;
      case 'Enter':
        event.preventDefault();
        if (activeEntry) run(activeEntry);
        break;
      default:
        break;
    }
  };

  const panel = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        initial: { opacity: 0, y: -6, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -4, scale: 0.99, transition: { duration: 0.12, ease: EASE } },
      };

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] [--palette-top:calc(env(safe-area-inset-top)+0.5rem)] sm:[--palette-top:12vh]"
    >
      <MotionDiv
        aria-hidden="true"
        className="absolute inset-0 bg-fg/[0.14] dark:bg-bg/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.12 } }}
        transition={{ duration: 0.15, ease: EASE }}
        onClick={() => requestClose()}
      />

      <div className="pointer-events-none relative flex justify-center px-2 pt-[var(--palette-top)] sm:px-6">
        <MotionDiv
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          data-nav-dialog=""
          onKeyDown={onKeyDown}
          // Clicks on non-interactive parts must not pull focus out of the field.
          onMouseDown={(event) => {
            if (!event.target.closest('input, button')) event.preventDefault();
          }}
          {...panel}
          transition={{ duration: reduceMotion ? 0.12 : 0.18, ease: EASE }}
          style={{ transformOrigin: '50% 0%' }}
          className="pointer-events-auto flex max-h-[calc(var(--vvh,100dvh)-var(--palette-top)-0.5rem)] w-full max-w-[40rem] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl dark:border-line-strong"
        >
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line pl-4 pr-1.5 sm:pr-3">
            <Search className="size-[18px] shrink-0 text-subtle" strokeWidth={1.75} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-activedescendant={activeEntry ? optionId(activeEntry.index) : undefined}
              aria-autocomplete="list"
              aria-label="Search or ask about my work"
              placeholder="Search or ask about my work"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="go"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
                setAnnouncement('');
                if (listRef.current) listRef.current.scrollTop = 0;
              }}
              className="h-full min-w-0 flex-1 bg-transparent text-base text-fg placeholder:text-subtle focus-visible:outline-hidden sm:text-[15px]"
            />
            <button
              type="button"
              onClick={() => requestClose()}
              aria-label="Close"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-subtle transition-colors hover:text-fg sm:size-auto sm:p-1 pointer-coarse:size-11"
            >
              <Kbd className="hidden sm:inline-flex pointer-coarse:hidden">Esc</Kbd>
              <X className="size-5 sm:hidden pointer-coarse:block" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          {hasQuery && count === 0 ? (
            <p className="shrink-0 px-4 pt-3 text-[13px] text-muted">
              Nothing matches “{query.trim()}”.
            </p>
          ) : null}

          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Results"
            className="relative max-h-[26rem] min-h-0 overflow-y-auto overscroll-contain p-1.5"
          >
            {groups.map((group) => {
              const headingId = `${uid}-group-${group.id}`;
              return (
                <div
                  key={group.id}
                  role="group"
                  aria-labelledby={group.hideLabel ? undefined : headingId}
                  aria-label={group.hideLabel ? group.label : undefined}
                  className={cn(group.hideLabel && 'mt-1.5 border-t border-line pt-1.5')}
                >
                  {group.hideLabel ? null : (
                    <div id={headingId} className="px-2.5 pb-1 pt-2.5 text-xs font-medium text-subtle">
                      {group.label}
                    </div>
                  )}
                  {group.results.map((entry) => (
                    <Option
                      key={entry.item.id}
                      id={optionId(entry.index)}
                      entry={entry}
                      active={entry === activeEntry}
                      copied={copied?.id === entry.item.id ? copied : null}
                      onHover={() => {
                        if (entry.index !== activeIndex) setActiveIndex(entry.index);
                      }}
                      onSelect={() => run(entry)}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          <div
            aria-hidden="true"
            className="hidden h-10 shrink-0 items-center justify-between gap-4 border-t border-line px-4 text-xs text-subtle sm:flex pointer-coarse:hidden"
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>Esc</Kbd>
                Close
              </span>
            </div>
            {activeEntry ? (
              <span className="flex items-center gap-1.5">
                {activeEntry.item.verb}
                <Kbd>↵</Kbd>
              </span>
            ) : null}
          </div>

          <p role="status" className="sr-only">
            {announcement || (hasQuery ? `${count} ${count === 1 ? 'result' : 'results'}` : '')}
          </p>
        </MotionDiv>
      </div>
    </div>
  );
}

function Option({ id, entry, active, copied, onHover, onSelect }) {
  const { item, indices } = entry;
  const Icon = copied?.ok ? Check : item.icon;
  const meta = copied ? (copied.ok ? 'Copied' : 'Couldn’t copy') : item.meta;

  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      onPointerMove={(event) => {
        // Touch scrolling shouldn't drag the selection around.
        if (event.pointerType !== 'touch') onHover();
      }}
      onClick={onSelect}
      className={cn(
        'flex h-11 cursor-pointer select-none items-center gap-3 rounded-md px-2.5 text-sm sm:h-10 pointer-coarse:h-11',
        active && 'bg-surface-2'
      )}
    >
      <Icon
        className={cn(
          'size-4 shrink-0 transition-colors duration-150',
          copied?.ok ? 'text-accent-strong' : active ? 'text-fg' : 'text-subtle'
        )}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate text-fg">
        {item.quote === undefined ? (
          <Highlight text={item.title} indices={indices} />
        ) : (
          <>
            {item.title}: <span className="text-muted">“{item.quote}”</span>
          </>
        )}
      </span>
      {meta ? (
        <span className={cn('shrink-0 text-xs tabular-nums', copied ? 'text-fg' : 'text-subtle')}>
          {meta}
        </span>
      ) : null}
      {item.external ? (
        <ArrowUpRight className="size-3.5 shrink-0 text-subtle" strokeWidth={1.75} aria-hidden="true" />
      ) : null}
    </div>
  );
}

/** Title with the fuzzy-matched characters set in a heavier weight. */
function Highlight({ text, indices }) {
  if (!indices.length) return text;
  const marks = new Set(indices);
  const parts = [];
  let start = 0;
  for (let i = 1; i <= text.length; i += 1) {
    if (i === text.length || marks.has(i) !== marks.has(start)) {
      parts.push({ text: text.slice(start, i), match: marks.has(start) });
      start = i;
    }
  }
  return parts.map((part, i) =>
    part.match ? (
      <mark key={i} className="bg-transparent font-semibold text-fg">
        {part.text}
      </mark>
    ) : (
      <span key={i}>{part.text}</span>
    )
  );
}
