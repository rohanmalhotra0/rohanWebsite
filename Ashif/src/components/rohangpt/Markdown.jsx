import { Fragment } from 'react';
import { cn } from '@/lib/utils';

/* Renders the node tree from markdown.js as React elements. */

const isExternal = (href) => !href.startsWith('#') && !href.startsWith('mailto:');

function Inline({ nodes }) {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return node.text;
      case 'code':
        return (
          <code
            key={index}
            className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.85em] text-fg"
          >
            {node.text}
          </code>
        );
      case 'strong':
        return (
          <strong key={index} className="font-semibold text-fg">
            <Inline nodes={node.children} />
          </strong>
        );
      case 'em':
        return (
          <em key={index}>
            <Inline nodes={node.children} />
          </em>
        );
      case 'link': {
        const external = isExternal(node.href);
        return (
          <a
            key={index}
            href={node.href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="link font-medium text-fg"
          >
            <Inline nodes={node.children} />
            {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
          </a>
        );
      }
      default:
        return null;
    }
  });
}

function Block({ block }) {
  switch (block.type) {
    case 'p':
      return (
        <p>
          {block.lines.map((line, index) => (
            <Fragment key={index}>
              {index > 0 ? <br /> : null}
              <Inline nodes={line} />
            </Fragment>
          ))}
        </p>
      );
    case 'h':
      return (
        <p className="font-semibold text-fg">
          <Inline nodes={block.children} />
        </p>
      );
    case 'pre':
      return (
        <pre className="overflow-x-auto rounded-lg border border-line bg-bg p-3 font-mono text-[13px] leading-6 text-fg">
          <code>{block.text}</code>
        </pre>
      );
    default: {
      const List = block.type === 'ol' ? 'ol' : 'ul';
      return (
        <List
          start={block.start > 1 ? block.start : undefined}
          className={cn(
            'space-y-1.5 pl-5 marker:text-subtle',
            List === 'ol' ? 'list-decimal' : 'list-disc'
          )}
        >
          {block.items.map((item, index) => (
            <li key={index} className="pl-1">
              <Inline nodes={item} />
            </li>
          ))}
        </List>
      );
    }
  }
}

export default function Markdown({ blocks, className, ref }) {
  return (
    <div ref={ref} className={cn('space-y-3', className)}>
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}
