import { useCallback, useEffect, useRef, useState } from 'react';
import {
  education,
  profile,
  projects,
  research,
  skillGroups,
  workExperience,
} from '@/data/portfolioData';

/*
 * RohanGPT
 *
 * 1. Common questions are answered on the spot from QUICK_ANSWERS, which are
 *    generated from portfolioData so they never drift from the rest of the site.
 * 2. Anything else is POSTed to VITE_ROHANGPT_API_URL when it is set. The
 *    endpoint holds the model key; no API key ever ships to the browser.
 *    Contract: body {messages, message, name, systemPrompt},
 *    response {response | content | message}.
 * 3. Without an endpoint, RohanGPT says plainly that it doesn't know.
 */

const API_URL = readEnv('VITE_ROHANGPT_API_URL');

/** 'live' when a model endpoint is configured, otherwise 'local'. */
export const CHAT_MODE = API_URL ? 'live' : 'local';

const REQUEST_TIMEOUT_MS = 20000;
const HISTORY_LIMIT = 8;
const MAX_CONTENT_CHARS = 2000;
export const MAX_INPUT_CHARS = 1000;
/** A short beat before local answers so the reply doesn't land mid-keystroke. */
const LOCAL_REPLY_DELAY_MS = 320;

function readEnv(name) {
  try {
    return import.meta.env?.[name] || '';
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ */
/* Facts                                                               */
/* ------------------------------------------------------------------ */

const featuredProjects = projects.filter((project) => project.featured);
const findRole = (pattern) =>
  workExperience.find((job) => pattern.test(job.role));
const findProject = (slug) => projects.find((project) => project.slug === slug);
const hasRealDate = (date) => /\d{4}/.test(date || '');
const list = (items) => items.map((item) => `- ${item}`).join('\n');

/** Markdown link with characters that would break `[label](url)` escaped. */
function mdLink(label, url) {
  const safeLabel = String(label).replace(/[[\]]/g, '');
  const safeUrl = String(url).replace(/\(/g, '%28').replace(/\)/g, '%29');
  return `[${safeLabel}](${safeUrl})`;
}

/** "Casen: Consulting Casebook" -> "Casen". */
const shortTitle = (title) => title.split(':')[0].trim();

function projectLinks(project) {
  const links = [];
  if (project.liveUrl) links.push(mdLink('Live site', project.liveUrl));
  if (project.repoUrl) {
    const isProfile = project.repoUrl.replace(/\/$/, '') === profile.github;
    links.push(mdLink(isProfile ? 'My GitHub' : 'Source', project.repoUrl));
  }
  return links.join(' · ');
}

function describeProject(project) {
  const meta = [project.category, project.year].filter(Boolean).join(' · ');
  const lines = [
    `**${project.title}**${meta ? ` · ${meta}` : ''}`,
    project.description,
  ];
  if (project.tags?.length) {
    lines.push('', `Tags: ${project.tags.map((tag) => `\`${tag}\``).join(', ')}`);
  }
  const links = projectLinks(project);
  if (links) lines.push(links);
  return lines.join('\n');
}

function roleLine(job, company) {
  // Some entries use placeholders like "Earlier experience" instead of a place or date.
  const meta = [job.location, job.date].filter((part) => part && !/experience/i.test(part));
  return `**${job.role}**${company ? ` at ${company}` : ''}${meta.length ? ` · ${meta.join(' · ')}` : ''}`;
}

/** Company follow-ups that point to the deeper topic answers. */
const COMPANY_FOLLOW_UPS = {
  IBM: 'Ask about the EPM work or the Spot robot for the details.',
};

function describeCompany(company, jobs) {
  if (jobs.length === 1) {
    const [job] = jobs;
    return [
      roleLine(job, company),
      job.summary,
      list(job.highlights.slice(0, 4)),
    ].join('\n\n');
  }
  const roles = jobs.map((job) => {
    const metric = job.metric ? ` Key number: **${job.metric.value}** ${job.metric.label}.` : '';
    return `${roleLine(job)}\n${job.summary}${metric}`;
  });
  return [
    `I had ${jobs.length} roles at ${company}:`,
    ...roles,
    COMPANY_FOLLOW_UPS[company],
  ]
    .filter(Boolean)
    .join('\n\n');
}

const appDev = findRole(/applications developer/i);
const robotics = findRole(/robotics/i);
const kalshi = workExperience.find((job) => job.company === 'Kalshi');
const hedgingPaper = research.find((paper) => /income risk/i.test(paper.title));
const epmProjects = projects.filter((project) => /epm/i.test(project.title));

const ANSWERS = {
  greeting: () => {
    const examples = featuredProjects
      .map((project) => shortTitle(project.title))
      .filter((title) => !/\s/.test(title))
      .slice(0, 2);
    return [
      'Hey, I’m RohanGPT. I answer from Rohan’s verified profile, so ask about my work at IBM or Kalshi, my research, school, or a project by name',
      examples.length ? ` (try ${examples.join(' or ')})` : '',
      '.',
    ].join('');
  },

  thanks: () =>
    `Anytime. If you want to keep talking, email me at ${mdLink(profile.email, `mailto:${profile.email}`)}.`,

  intro: () =>
    [
      `${profile.summary} I’m based in ${profile.location} and graduate in ${profile.graduation}.`,
      'This chat is a small assistant built on my verified profile. If something isn’t in it, it will tell you instead of guessing.',
    ].join('\n\n'),

  robotics: () =>
    [
      `As a ${robotics?.role ?? 'robotics intern'} at IBM${robotics?.date ? ` (${robotics.date})` : ''}, I trained the vision system for a Boston Dynamics Spot demo.`,
      list(robotics?.highlights ?? []),
    ].join('\n\n'),

  epm: () =>
    [
      `As an ${appDev?.role ?? 'applications developer intern'} at IBM${appDev?.date ? ` (${appDev.date})` : ''}, I worked on Oracle EPM for finance teams.`,
      list(appDev?.highlights ?? []),
      epmProjects.length
        ? `Related projects on this site: ${epmProjects.map((project) => `**${project.title}**`).join(' and ')}.`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n'),

  kalshi: () =>
    [
      `I was a ${kalshi?.role ?? 'quantitative developer'} at Kalshi${kalshi?.date ? ` (${kalshi.date})` : ''}. ${kalshi?.summary ?? ''}`.trim(),
      list(kalshi?.highlights ?? []),
      hedgingPaper ? `The write-up: ${mdLink(hedgingPaper.title, hedgingPaper.liveUrl)}.` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),

  research: () =>
    [
      'My research so far:',
      list(
        research.map((paper) => {
          const extra = paper.externalUrl ? ` (${mdLink('handle', paper.externalUrl)})` : '';
          return `${mdLink(paper.title, paper.liveUrl)}: ${paper.eyebrow.toLowerCase()}${extra}`;
        })
      ),
      'At the Virginia Tech Hume Center I also wrote C imaging and signal-processing tests for ContentCube, a CubeSat that reached low Earth orbit.',
    ].join('\n\n'),

  education: () =>
    [
      `I’m doing a ${education.degree} with a ${education.minor} at ${profile.school} (${education.dates}). ${education.accelerated} GPA: ${education.gpa}/${education.gpaScale}.`,
      `Coursework includes ${education.coursework.slice(0, 6).join(', ')}, plus the graduate course *${education.graduateCourse.title}*.`,
    ].join('\n\n'),

  skills: () =>
    [
      'What I work with most:',
      list(skillGroups.map((group) => `**${group.label}:** ${group.items.join(', ')}`)),
    ].join('\n\n'),

  contact: () =>
    [
      `Email is best: ${mdLink(profile.email, `mailto:${profile.email}`)}.`,
      `I’m also on ${mdLink('LinkedIn', profile.linkedin)} and ${mdLink('GitHub', profile.github)}. My résumé is ${mdLink('here', '#/resume')}, or grab the ${mdLink('PDF', profile.resumeUrl)}.`,
    ].join('\n\n'),

  bestProject: () => {
    const picks = [
      ['epm-wizard', 'if you care about applied AI in enterprise software'],
      ['spot-vision', 'for robotics and computer vision'],
      ['income-risk-hedging', 'for quantitative work'],
      ['refrax', 'for interactive research tools'],
    ]
      .map(([slug, reason]) => {
        const project = findProject(slug);
        return project ? `**${project.title}** ${reason}` : null;
      })
      .filter(Boolean);
    return [
      'I’d start with:',
      list(picks),
      `All ${projects.length} are in the Projects section. Ask about any of them by name.`,
    ].join('\n\n');
  },

  experience: () =>
    [
      'Where I’ve worked:',
      list(
        workExperience.map(
          (job) =>
            `**${job.company}**, ${job.role}${hasRealDate(job.date) ? ` (${job.date})` : ''}`
        )
      ),
      'Ask about any of them by name.',
    ].join('\n\n'),
};

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

/**
 * Lowercase, strip accents and punctuation, and collapse whitespace so
 * "Résumé?" -> "resume" and "C++" -> "cpp".
 */
export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/c\+\+/g, ' cpp ')
    .replace(/c#/g, ' csharp ')
    .replace(/\.js\b/g, 'js')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Compile a keyword. Matching is whole-word on normalized text; a trailing
 * `*` makes it a prefix ("robot*" matches "robots", "robotics").
 */
function compileTerm(raw, base) {
  const prefix = raw.endsWith('*');
  const text = normalize(prefix ? raw.slice(0, -1) : raw);
  const words = text.split(' ').length;
  // Longer phrases are more specific, so they count for more.
  return { text, prefix, weight: base + (words - 1) * 2 };
}

const termMatches = (padded, term) =>
  padded.includes(term.prefix ? ` ${term.text}` : ` ${term.text} `);

const TOPIC_WEIGHT = 3;
const WEAK_WEIGHT = 1;
const NAME_BONUS = 2;

/**
 * Entry fields:
 *   terms  topic keywords (weight 3, summed)
 *   weak   tie-breakers (weight 1, summed)
 *   names  names of a thing (best single match counts, plus a bonus)
 *   maxWords  only match short messages (greetings)
 * Ties go to the entry listed first.
 */
function entry({ id, terms = [], weak = [], names = [], nameBonus = 0, maxWords, answer }) {
  return {
    id,
    terms: terms.map((term) => compileTerm(term, TOPIC_WEIGHT)),
    weak: weak.map((term) => compileTerm(term, WEAK_WEIGHT)),
    names: names.map((name) => compileTerm(name, TOPIC_WEIGHT)),
    nameBonus,
    maxWords,
    answer: answer(),
  };
}

const TOPICS = [
  entry({
    id: 'robotics',
    terms: ['spot', 'robot*', 'yolo*', 'boston dynamics', 'computer vision', 'devcon', 'dog toy', 'perception', 'map 50', 'robotics engineer'],
    weak: ['ibm', 'vision', 'internship*'],
    answer: ANSWERS.robotics,
  }),
  entry({
    id: 'epm',
    terms: ['epm', 'oracle', 'qwen*', 'fine tun*', 'finetun*', 'oic', 'integration cloud', 'cash forecast*', 'xgboost', 'applications developer', 'on prem', 'rag', 'mcp'],
    weak: ['ibm', 'llm*', 'finance', 'internship*'],
    answer: ANSWERS.epm,
  }),
  entry({
    id: 'kalshi',
    terms: ['kalshi', 'hedg*', 'monte carlo', 'prediction market*', 'income risk', 'job loss', 'poisson', 'quantitative developer'],
    weak: ['research', 'quant'],
    answer: ANSWERS.kalshi,
  }),
  entry({
    id: 'research',
    terms: ['research', 'paper*', 'publication*', 'published', 'publish', 'reddit', 'wallstreetbets', 'sentiment', 'kelly', 'capital allocation', 'cubesat'],
    answer: ANSWERS.research,
  }),
  entry({
    id: 'education',
    terms: ['nyu', 'courant', 'new york university', 'education', 'school', 'college', 'university', 'course*', 'class*', 'gpa', 'grades', 'graduat*', 'degree', 'major', 'minor', 'student'],
    answer: ANSWERS.education,
  }),
  entry({
    id: 'skills',
    terms: [
      'skill*', 'stack', 'tech stack', 'technolog*', 'tools', 'languages', 'programming', 'framework*', 'proficien*', 'good at', 'code in',
      // Every listed skill, so "do you know PyTorch?" lands here. Single letters (C, R) are too ambiguous.
      ...skillGroups.flatMap((group) => group.items).filter((item) => normalize(item).length > 1),
    ],
    answer: ANSWERS.skills,
  }),
  entry({
    id: 'contact',
    terms: ['contact', 'email', 'e mail', 'reach you', 'reach out', 'get in touch', 'hire', 'hiring', 'resume', 'cv', 'linkedin', 'github', 'phone', 'talk to you'],
    answer: ANSWERS.contact,
  }),
  entry({
    id: 'intro',
    terms: ['who are you', 'yourself', 'about you', 'who is rohan', 'introduce', 'background', 'rohangpt', 'are you real', 'are you an ai', 'are you ai', 'are you a bot', 'how does this work', 'where are you', 'located', 'location', 'nyc', 'new york'],
    answer: ANSWERS.intro,
  }),
];

/** Group roles by company so "what did you do at IBM" covers both internships. */
const COMPANY_ALIASES = {
  IBM: ['international business machines'],
  'Hume Center': ['hume', 'virginia tech', 'contentcube', 'satellite', 'aerospace', 'low earth orbit'],
  'Y-Axis': ['yaxis'],
};
const STOP_WORDS = new Set(['the', 'and', 'of', 'center', 'software', 'inc']);

const companyEntries = [...new Set(workExperience.map((job) => job.company))].map(
  (company) => {
    const jobs = workExperience.filter((job) => job.company === company);
    const normalizedName = normalize(company);
    const [firstWord] = normalizedName.split(' ');
    const names = [
      normalizedName,
      firstWord.length >= 3 && !STOP_WORDS.has(firstWord) ? firstWord : null,
      ...(COMPANY_ALIASES[company] ?? []),
    ].filter(Boolean);
    return entry({
      id: `company:${normalizedName}`,
      names,
      answer: () => describeCompany(company, jobs),
    });
  }
);

/** Extra names people might use, keyed by project slug. */
const PROJECT_ALIASES = {
  'epm-wizard': ['wizard'],
  'epm-interactive-guide': ['epm guide', 'interactive guide', 'capstone'],
  casen: ['casebook', 'case interview*'],
  nightshift: ['night shift'],
  'spot-vision': ['vision pipeline'],
  'income-risk-hedging': ['hedging engine', 'hedging simulator'],
  greensticker: ['green sticker', 'hands free mouse'],
  'autism-research': ['autism'],
  pivot: ['pivot'],
  'american-options-pricing': ['options pricing', 'binomial'],
  'oscillating-stock-model': ['oscillating'],
  'rsi-predictor': ['rsi'],
  'ai-quiz-maker': ['quiz maker', 'quiz generator'],
  'kalshi-live-kelly': ['kalshi dashboard', 'kelly dashboard'],
  'ibm-internship-tracker': ['internship tracker', 'progress tracker'],
  'love-island-roi': ['love island'],
  'spy-gradient-boosting': ['spy predictor', 'gradient boosting'],
  'rohan-lab': ['study notebooks'],
  'german-study-lab': ['german'],
  'democracies-survive': ['democracies', 'south korea'],
  'indytrack-api': ['indytrack'],
  'algorithms-practice': ['leetcode', 'neetcode'],
};

const projectEntries = projects.map((project) => {
  const short = shortTitle(project.title);
  const names = [
    project.title,
    short,
    project.slug.replace(/-/g, ' '),
    ...(PROJECT_ALIASES[project.slug] ?? []),
  ];
  return entry({
    id: `project:${project.slug}`,
    names: [...new Set(names.map((name) => name.trim()))],
    nameBonus: NAME_BONUS,
    answer: () => describeProject(project),
  });
});

const OVERVIEWS = [
  entry({
    id: 'best-project',
    terms: ['best project*', 'which project*', 'favorite project*', 'favourite project*', 'top project*', 'featured', 'look at first', 'start with', 'proudest', 'coolest', 'projects', 'side project*', 'portfolio'],
    answer: ANSWERS.bestProject,
  }),
  entry({
    id: 'experience',
    terms: ['experience', 'work history', 'worked', 'jobs', 'internships', 'employers', 'companies', 'roles'],
    answer: ANSWERS.experience,
  }),
  entry({
    id: 'greeting',
    weak: ['hi', 'hello', 'hey', 'heya', 'hiya', 'yo', 'sup', 'howdy', 'whats up', 'good morning', 'good afternoon', 'good evening'],
    maxWords: 5,
    answer: ANSWERS.greeting,
  }),
  entry({
    id: 'thanks',
    weak: ['thanks', 'thank you', 'thx', 'ty', 'cheers', 'appreciate it'],
    maxWords: 6,
    answer: ANSWERS.thanks,
  }),
];

const QUICK_ANSWERS = [...TOPICS, ...companyEntries, ...projectEntries, ...OVERVIEWS];

function scoreEntry(item, padded, wordCount) {
  if (item.maxWords && wordCount > item.maxWords) return 0;
  let score = 0;
  for (const term of item.terms) if (termMatches(padded, term)) score += term.weight;
  for (const term of item.weak) if (termMatches(padded, term)) score += term.weight;
  let bestName = 0;
  for (const name of item.names) {
    if (termMatches(padded, name)) bestName = Math.max(bestName, name.weight + item.nameBonus);
  }
  return score + bestName;
}

/** Best local answer for `input`, or null when nothing in the profile fits. */
export function findQuickAnswer(input) {
  const text = normalize(input);
  if (!text) return null;
  const padded = ` ${text} `;
  const wordCount = text.split(' ').length;

  let best = null;
  let bestScore = 0;
  for (const item of QUICK_ANSWERS) {
    const score = scoreEntry(item, padded, wordCount);
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return best ? { id: best.id, answer: best.answer } : null;
}

const OFFLINE_REPLY = [
  'I don’t have a verified answer for that, and I’d rather not guess.',
  `I can tell you about my work at IBM and Kalshi, my projects, research, school, or skills. For anything else, email me at ${mdLink(profile.email, `mailto:${profile.email}`)}.`,
].join('\n\n');

/* ------------------------------------------------------------------ */
/* Live endpoint                                                       */
/* ------------------------------------------------------------------ */

const currentMonth = new Date().toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
});

const SYSTEM_PROMPT = `You are RohanGPT, the assistant on Rohan Malhotra's portfolio site (rohanm.org). Answer as Rohan, in a plain, specific, first-person voice. Keep answers short: two to five sentences, or a few bullets. Markdown is fine (bold, inline code, links, bullet lists).

Avoid résumé-speak and hype ("passionate", "cutting-edge", "at the intersection of", "leveraging", "shipped").

It is ${currentMonth}. The IBM internships ran May–Aug 2026 and are finished; describe them in the past tense.

Verified profile:
- ${profile.summary} Based in ${profile.location}.
- Education: ${education.degree}, ${education.minor}, ${profile.school} (${education.dates}). ${education.accelerated} GPA ${education.gpa}/${education.gpaScale}.
- Experience:
${workExperience
  .map(
    (job) =>
      `  - ${job.company}, ${job.role}${hasRealDate(job.date) ? ` (${job.date})` : ''}: ${job.highlights.join(' ')}`
  )
  .join('\n')}
- Research:
${research.map((paper) => `  - ${paper.title}: ${paper.description}`).join('\n')}
- Featured projects:
${featuredProjects.map((project) => `  - ${project.title}: ${project.description}`).join('\n')}
- Other projects: ${projects
  .filter((project) => !project.featured)
  .map((project) => project.title)
  .join(', ')}.
- Skills: ${skillGroups.map((group) => `${group.label}: ${group.items.join(', ')}`).join('; ')}.
- Contact: ${profile.email}, ${profile.linkedin}, ${profile.github}.

Do not invent employers, metrics, dates, publications, awards, or job-search status. If a fact is not listed here, say you don't know and point to the résumé or GitHub.`;

async function requestLiveReply({ history, input, name, signal }) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: input },
  ];

  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        messages,
        message: input,
        name: name || 'Visitor',
        systemPrompt: SYSTEM_PROMPT,
      }),
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new Error('I couldn’t reach the chat service. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(`RohanGPT is temporarily unavailable (${response.status}).`);
  }

  const data = await response.json().catch(() => {
    throw new Error('RohanGPT returned an invalid response.');
  });
  const content = data?.response ?? data?.content ?? data?.message;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('RohanGPT returned an empty response.');
  }
  return content.trim();
}

/** Last few user/assistant turns, trimmed, for the model's context. */
const toHistory = (messages) =>
  messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .slice(-HISTORY_LIMIT)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, MAX_CONTENT_CHARS),
    }));

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

let idCounter = 0;
const createMessage = (role, content, source) => ({
  id: `rgpt-${Date.now().toString(36)}-${(idCounter += 1)}`,
  role,
  content,
  source,
});

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * Chat state for RohanGPT.
 * Messages look like {id, role: 'user'|'assistant', content, source}, where
 * source is 'profile' (local answer), 'live' (model), or 'offline'.
 */
export function useRohanGPTChat({ visitorName } = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesRef = useRef(messages);
  const loadingRef = useRef(false);
  const abortRef = useRef(null);
  // Bumped on every request and on reset so late replies can be ignored.
  const generationRef = useRef(0);
  const visitorNameRef = useRef(visitorName || '');

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    visitorNameRef.current = visitorName || '';
  }, [visitorName]);

  useEffect(
    () => () => {
      generationRef.current += 1;
      abortRef.current?.abort();
    },
    []
  );

  const respond = useCallback(async (input, priorMessages) => {
    const generation = (generationRef.current += 1);
    const isStale = () => generation !== generationRef.current;
    const append = (content, source) =>
      setMessages((previous) => [...previous, createMessage('assistant', content, source)]);

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    let timedOut = false;
    try {
      const quick = findQuickAnswer(input);
      if (quick || !API_URL) {
        await wait(LOCAL_REPLY_DELAY_MS);
        if (!isStale()) append(quick ? quick.answer : OFFLINE_REPLY, quick ? 'profile' : 'offline');
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const timeout = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, REQUEST_TIMEOUT_MS);

      try {
        const safeName = visitorNameRef.current.trim().replace(/\s+/g, ' ').slice(0, 64);
        const reply = await requestLiveReply({
          history: toHistory(priorMessages),
          input,
          name: safeName,
          signal: controller.signal,
        });
        if (!isStale()) append(reply, 'live');
      } finally {
        window.clearTimeout(timeout);
        if (abortRef.current === controller) abortRef.current = null;
      }
    } catch (caught) {
      if (isStale()) return;
      if (caught?.name === 'AbortError' && !timedOut) return;
      setError(
        timedOut
          ? 'That took too long. Try again in a moment.'
          : caught instanceof Error
            ? caught.message
            : 'RohanGPT couldn’t answer that.'
      );
    } finally {
      if (!isStale()) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  /** Send a question. Returns false when it was empty or a reply is pending. */
  const sendMessage = useCallback(
    (text) => {
      const input = String(text ?? '').trim().slice(0, MAX_INPUT_CHARS);
      if (!input || loadingRef.current) return false;
      const prior = messagesRef.current;
      setMessages((previous) => [...previous, createMessage('user', input)]);
      respond(input, prior);
      return true;
    },
    [respond]
  );

  /** Re-ask the last question after an error. */
  const retry = useCallback(() => {
    if (loadingRef.current) return;
    const current = messagesRef.current;
    let lastIndex = current.length - 1;
    while (lastIndex >= 0 && current[lastIndex].role !== 'user') lastIndex -= 1;
    if (lastIndex < 0) return;
    respond(current[lastIndex].content, current.slice(0, lastIndex));
  }, [respond]);

  const reset = useCallback(() => {
    generationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    loadingRef.current = false;
    setLoading(false);
    setError(null);
    setMessages([]);
  }, []);

  return { messages, loading, error, sendMessage, retry, reset };
}
