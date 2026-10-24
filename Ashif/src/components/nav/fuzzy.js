// Tiny fuzzy matcher for the command palette (fzf-style, minus the size).
//
// A query matches when its characters appear in order in the text. Among all
// such alignments we keep the best-scoring one, which rewards characters that
// start words ("gh" -> GitHub) and runs of consecutive characters, and lightly
// penalizes gaps. The matched indices drive the highlight in the UI.

const SCORE_MATCH = 16;
const BONUS_BOUNDARY = 10;
const BONUS_FIRST_CHAR = 6;
const BONUS_CONSECUTIVE = 8;
const PENALTY_GAP_START = 3;
const PENALTY_GAP_EXTEND = 1;
const PENALTY_LEADING_MAX = 3;
// Below this average per character the alignment is mostly noise
// (scattered letters across a long title), so we drop it.
const MIN_SCORE_PER_CHAR = 13;
// Matches on tags/keywords count, but rank below matches on the title.
const KEYWORD_WEIGHT = 0.6;

const SEPARATOR = /[\s\-_/.:&(),'"’]/;

/** Lowercase and strip accents one character at a time so indices still line up. */
function fold(text) {
  let out = '';
  for (const char of text) {
    out += char.normalize('NFD').charAt(0).toLowerCase();
  }
  return out;
}

function isWordStart(text, i) {
  if (i === 0) return true;
  const prev = text[i - 1];
  if (SEPARATOR.test(prev)) return true;
  // camelCase / PascalCase humps: "RohanGPT" -> G, "NightShift" -> S.
  const cur = text[i];
  return /[a-z]/.test(prev) && /[A-Z]/.test(cur);
}

/**
 * Best fuzzy alignment of `query` inside `text`.
 * Returns { score, indices } or null when `query` is not a subsequence.
 */
export function fuzzyMatch(query, text) {
  const q = fold(query);
  const t = fold(text);
  const m = q.length;
  const n = t.length;
  if (!m) return { score: 0, indices: [] };
  if (m > n || q.length !== query.length || t.length !== text.length) {
    if (m > n) return null;
  }

  // Cheap subsequence check before doing any real work.
  let k = 0;
  for (let j = 0; j < n && k < m; j += 1) if (t[j] === q[k]) k += 1;
  if (k < m) return null;

  const bonus = new Array(n);
  for (let j = 0; j < n; j += 1) {
    bonus[j] = isWordStart(text, j)
      ? BONUS_BOUNDARY + (j === 0 ? BONUS_FIRST_CHAR : 0)
      : 0;
  }

  // score[i][j]: best score for q[0..i] with q[i] matched at t[j].
  // from[i][j]: where q[i - 1] was matched on that best path.
  const score = [];
  const from = [];
  for (let i = 0; i < m; i += 1) {
    const row = new Array(n).fill(-Infinity);
    const back = new Array(n).fill(-1);
    for (let j = i; j < n; j += 1) {
      if (t[j] !== q[i]) continue;
      const gain = SCORE_MATCH + bonus[j];
      if (i === 0) {
        row[j] = gain - Math.min(j * 0.25, PENALTY_LEADING_MAX);
        continue;
      }
      const prev = score[i - 1];
      let best = -Infinity;
      let arg = -1;
      for (let p = i - 1; p < j; p += 1) {
        if (prev[p] === -Infinity) continue;
        const gap = j - p - 1;
        const s =
          prev[p] +
          (gap === 0
            ? BONUS_CONSECUTIVE
            : -(PENALTY_GAP_START + (gap - 1) * PENALTY_GAP_EXTEND));
        if (s > best) {
          best = s;
          arg = p;
        }
      }
      if (arg === -1) continue;
      row[j] = best + gain;
      back[j] = arg;
    }
    score.push(row);
    from.push(back);
  }

  let end = -1;
  let total = -Infinity;
  const last = score[m - 1];
  for (let j = 0; j < n; j += 1) {
    if (last[j] > total) {
      total = last[j];
      end = j;
    }
  }
  if (end === -1) return null;

  const indices = new Array(m);
  for (let i = m - 1, j = end; i >= 0; i -= 1) {
    indices[i] = j;
    j = from[i][j];
  }
  return { score: total, indices };
}

const goodEnough = (match, token) =>
  match && match.score >= token.length * MIN_SCORE_PER_CHAR;

/**
 * Score a palette item against a (possibly multi-word) query. Every word must
 * match the title or one of the keywords. Returns { score, indices } where
 * `indices` are title characters to highlight, or null for no match.
 */
export function scoreItem(query, title, keywords = []) {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return { score: 0, indices: [] };

  let total = 0;
  const highlight = new Set();

  for (const token of tokens) {
    const onTitle = fuzzyMatch(token, title);
    let best = goodEnough(onTitle, token) ? onTitle.score : -Infinity;

    for (const keyword of keywords) {
      const onKeyword = fuzzyMatch(token, keyword);
      if (goodEnough(onKeyword, token)) {
        best = Math.max(best, onKeyword.score * KEYWORD_WEIGHT);
      }
    }

    if (best === -Infinity) return null;
    total += best;
    if (goodEnough(onTitle, token)) onTitle.indices.forEach((i) => highlight.add(i));
  }

  // The whole query appearing verbatim in the title is the strongest signal.
  const at = fold(title).indexOf(fold(query.trim()));
  if (at === 0) total += 40;
  else if (at > 0) total += 20;

  return { score: total, indices: [...highlight].sort((a, b) => a - b) };
}
