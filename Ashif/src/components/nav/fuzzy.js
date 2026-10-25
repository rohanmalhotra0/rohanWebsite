// Small fuzzy matcher for the command palette, in the spirit of fzf.
//
// A query matches when its characters appear in order in the text. Among all
// such alignments we keep the best-scoring one, which rewards characters that
// start words ("gh" -> GitHub) and runs of consecutive characters, and
// penalizes gaps. A run that starts in the middle of a word costs extra, so
// letters scattered through a long title ("spot" in "SPY Gradient Boosting")
// fall below the cut, while a plain substring ("board" in "Dashboard") still
// matches. The matched indices drive the highlight in the UI.

const SCORE_MATCH = 16;
const BONUS_BOUNDARY = 10;
const BONUS_FIRST_CHAR = 6;
const BONUS_CONSECUTIVE = 8;
const PENALTY_GAP_START = 3;
const PENALTY_GAP_EXTEND = 1;
const PENALTY_LEADING_MAX = 3;
const PENALTY_MIDWORD_START = 12;
// Below this average per character the alignment is mostly noise
// (scattered letters across a long title), so we drop it.
const MIN_SCORE_PER_CHAR = 13;
// Matches on tags/keywords count, but rank below matches on the title.
const KEYWORD_WEIGHT = 0.6;

const SEPARATOR = /[\s\-_/.:&(),'"’]/;

/** Lowercase and strip accents per UTF-16 unit so indices still line up. */
function fold(text) {
  let out = '';
  for (let i = 0; i < text.length; i += 1) {
    out += text[i].normalize('NFD').charAt(0).toLowerCase().charAt(0);
  }
  return out;
}

function isWordStart(text, i) {
  if (i === 0) return true;
  const prev = text[i - 1];
  if (SEPARATOR.test(prev)) return true;
  // camelCase / PascalCase humps: "RohanGPT" -> G, "NightShift" -> S.
  return /[a-z]/.test(prev) && /[A-Z]/.test(text[i]);
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
  if (m > n) return null;

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

    if (i === 0) {
      for (let j = 0; j < n; j += 1) {
        if (t[j] !== q[0]) continue;
        row[j] = SCORE_MATCH + bonus[j] - Math.min(j * 0.25, PENALTY_LEADING_MAX);
      }
    } else {
      const prev = score[i - 1];
      // The gap penalty is linear in the distance, so the best gapped
      // predecessor is a running max of prev[p] + p * EXTEND over p <= j - 2.
      // That keeps the whole match O(m * n).
      let gapBest = -Infinity;
      let gapFrom = -1;
      for (let j = i; j < n; j += 1) {
        const p = j - 2;
        if (p >= 0 && prev[p] !== -Infinity) {
          const value = prev[p] + p * PENALTY_GAP_EXTEND;
          if (value > gapBest) {
            gapBest = value;
            gapFrom = p;
          }
        }
        if (t[j] !== q[i]) continue;

        let best = -Infinity;
        let arg = -1;
        if (gapFrom !== -1) {
          best = gapBest - PENALTY_GAP_START - (j - 2) * PENALTY_GAP_EXTEND;
          arg = gapFrom;
        }
        if (prev[j - 1] !== -Infinity && prev[j - 1] + BONUS_CONSECUTIVE > best) {
          best = prev[j - 1] + BONUS_CONSECUTIVE;
          arg = j - 1;
        }
        if (arg === -1) continue;
        row[j] = best + SCORE_MATCH + bonus[j];
        back[j] = arg;
      }
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
  Boolean(match) && match.score >= token.length * MIN_SCORE_PER_CHAR;

/**
 * Score a palette item against a (possibly multi-word) query. Every word must
 * match the title or one of the keywords. Returns { score, indices } where
 * `indices` are title characters to highlight, or null for no match.
 */
export function scoreItem(query, title, keywords = []) {
  const phrase = query.trim().replace(/\s+/g, ' ');
  if (!phrase) return { score: 0, indices: [] };

  let total = 0;
  const highlight = new Set();

  for (const token of phrase.split(' ')) {
    const onTitle = fuzzyMatch(token, title);
    const titleHit = goodEnough(onTitle, token);
    let best = titleHit ? onTitle.score : -Infinity;

    for (const keyword of keywords) {
      const onKeyword = fuzzyMatch(token, keyword);
      if (goodEnough(onKeyword, token)) {
        best = Math.max(best, onKeyword.score * KEYWORD_WEIGHT);
      }
    }

    if (best === -Infinity) return null;
    total += best;
    if (titleHit) onTitle.indices.forEach((i) => highlight.add(i));
  }

  // The whole query typed as the start of a word in the title ("hedg",
  // "live kelly") is the strongest signal; mid-word substrings get nothing.
  const haystack = fold(title);
  const needle = fold(phrase);
  for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, at + 1)) {
    if (isWordStart(title, at)) {
      total += at === 0 ? 40 : 25;
      break;
    }
  }

  return { score: total, indices: [...highlight].sort((a, b) => a - b) };
}
