/** Keep one-letter words ("I", "a") from dangling at the end of a line. */
export const tie = (text) => text.replace(/\b([aI]) /g, '$1 ');
