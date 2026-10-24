import { cn } from '@/lib/utils';

/*
 * Renders the node tree from markdown.js as React elements. `limit` caps how
 * many characters are shown, which is how the typewriter reveals a reply
 * without ever flashing half-parsed markdown like a lone "**".
 */

const isExternal = (href) => !href.startsWith('#') && !href.startsWith('mailto:');

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="ml-0.5 inline-block h-[1.05em] w-[0.5ch] translate-y-[0.15em] animate-blink rounded-[1px] bg-accent-strong"
    />
  );
}

function renderInline(nodes, ctx, keyPrefix) {
  const out = [];
  nodes.forEach((node, index) => {
    if (ctx.left <= 0) return;
    const key = `${keyPrefix}-${index}`;

    if (node.type === 'text' || node.type === 'code') {
      const visible = node.text.slice(0, ctx.left);
      ctx.left -= node.text.length;
      out.push(
        node.type === 'code' ? (
          <code
            key={key}
            className="rounded-md border border-line bg-surface-2 px-1.5 py-px font-mono text-[0.84em] text-fg"
          >
            {visible}
          </code>
        ) : (
          visible
        )
      );
      return;
    }

    const children = renderInline(node.children, ctx, key);
    if (node.type === 'strong') {
      out.push(
        <strong key={key} className="font-semibold text-fg">
          {children}
        </strong>
      );
    } else if (node.type === 'em') {
      out.push(<em key={key}>{children}</em>);
    } else if (node.type === 'link') {
      const external = isExternal(node.href);
      out.push(
        <a
          key={key}
          href={node.href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          // Links are not reachable by keyboard until the reply has finished typing.
          tabIndex={ctx.typing ? -1 : undefined}
          className="font-medium text-fg underline decoration-line-strong decoration-1 underline-offset-[3px] transition-colors hover:decoration-accent-strong"
        >
          {children}
          {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
        </a>
      );
    }
  });
  return out;
}

/** Appends the caret to the block where the visible text currently ends. */
function withCaret(content, ctx) {
  if (!ctx.typing || ctx.caretPlaced || ctx.left > 0) return content;
  ctx.caretPlaced = true;
  return (
    <>
      {content}
      <Caret />
    </>
  );
}

export default function Markdown({ blocks, limit = Infinity, typing = false, className }) {
  const ctx = { left: limit, typing, caretPlaced: false };
  const rendered = [];

  blocks.forEach((block, index) => {
    if (ctx.left <= 0) return;
    const key = `b${index}`;

    if (block.type === 'p') {
      const lines = [];
      block.lines.forEach((line, lineIndex) => {
        if (ctx.left <= 0) return;
        if (lineIndex > 0) lines.push(<br key={`br${lineIndex}`} />);
        lines.push(...renderInline(line, ctx, `${key}-${lineIndex}`));
      });
      rendered.push(<p key={key}>{withCaret(lines, ctx)}</p>);
    } else if (block.type === 'h') {
      rendered.push(
        <p key={key} className="font-semibold text-fg">
          {withCaret(renderInline(block.children, ctx, key), ctx)}
        </p>
      );
    } else {
      const items = [];
      block.items.forEach((item, itemIndex) => {
        if (ctx.left <= 0) return;
        items.push(
          <li key={itemIndex} className="pl-1">
            {withCaret(renderInline(item, ctx, `${key}-${itemIndex}`), ctx)}
          </li>
        );
      });
      const List = block.type === 'ol' ? 'ol' : 'ul';
      rendered.push(
        <List
          key={key}
          className={cn(
            'space-y-1.5 pl-5 marker:text-subtle',
            List === 'ol' ? 'list-decimal' : 'list-disc'
          )}
        >
          {items}
        </List>
      );
    }
  });

  // Typing has started but nothing is visible yet: show the caret alone.
  if (typing && !rendered.length) rendered.push(<Caret key="caret" />);

  return <div className={cn('space-y-3', className)}>{rendered}</div>;
}
