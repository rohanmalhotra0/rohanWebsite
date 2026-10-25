import '@/index.css';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { notFoundRoute, ogCard, routes } from '@/routes';
import Card from './Card';

const root = createRoot(document.getElementById('card'));

// Shrink each [data-fit] line until it fits its box.
function fit() {
  for (const el of document.querySelectorAll('[data-fit]')) {
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth && size > 48) {
      size -= 2;
      el.style.fontSize = `${size}px`;
    }
  }
}

/** The cards to render: one per page that has its own (routes.js ogCard). */
window.cardIds = () => [...new Set([...routes, notFoundRoute].map((route) => ogCard(route).id))];

/** Render one card and wait until its fonts and images are in. */
window.renderCard = async (id) => {
  // A fresh tree per card: fit() sets sizes inline, and React would keep them.
  flushSync(() => root.render(<Card key={id} id={id} />));
  await document.fonts.ready;
  await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
  fit();
};

window.cardsReady = true;
