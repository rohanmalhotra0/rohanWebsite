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
 * 1. Common questions are answered on the spot from local answers that are
 *    built from portfolioData, so they never drift from the rest of the site.
 * 2. Anything else is POSTed to VITE_ROHANGPT_API_URL when it is set. The
 *    endpoint holds the model key; no API key ever ships to the browser.
 *    Request {messages, message, name, systemPrompt};
 *    response {response | content | message}.
 * 3. Without an endpoint, it says plainly that it doesn't know.
 */

const API_URL = resolveEndpoint(import.meta.env.VITE_ROHANGPT_API_URL);

const REQUEST_TIMEOUT_MS = 20000;
const HISTORY_LIMIT = 8;
const MAX_CONTENT_CHARS = 2000;
export const MAX_INPUT_CHARS = 1000;
/** A short beat before local answers so a reply never lands mid-keystroke. */
const LOCAL_REPLY_DELAY_MS = 360;

/** Absolute http(s) URLs or same-origin paths; anything else is a typo. */
function resolveEndpoint(value) {
  const url = String(value ?? '').trim();
  return /^(https?:\/\/|\/(?!\/))/i.test(url) ? url : '';
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const bullets = (items) => items.map((item) => `- ${item}`).join('\n');
const paragraphs = (...parts) => parts.flat().filter(Boolean).join('\n\n');
const article = (word) => (/^[aeiou]/i.test(word) ? 'an' : 'a');
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
/** Lowercase the first letter, but leave "I" and acronyms alone. */
const lowerFirst = (text) =>
  /^(I\b|[A-Z]{2})/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);
const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const countWord = (n) => NUMBER_WORDS[n] ?? String(n);
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** "Casen: Consulting Casebook" -> "Casen". */
const shortTitle = (title) => title.split(':')[0].trim();

function joinAnd(items) {
  if (items.length < 3) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/** Markdown link with characters that would break `[label](url)` escaped. */
function mdLink(label, url) {
  const safeLabel = String(label).replace(/[[\]]/g, '');
  const safeUrl = String(url).replace(/\(/g, '%28').replace(/\)/g, '%29');
  return `[${safeLabel}](${safeUrl})`;
}

const EMAIL_LINK = mdLink(profile.email, `mailto:${profile.email}`);
/** Rohan's own line from the Contact section. */
const INTERESTS = 'I’m interested in applied AI, robotics, quantitative systems, and developer tools.';

/** "May 2026" -> {month: 4, year: 2026}, or null. */
function parseMonth(text) {
  const match = /([A-Za-z]{3,})\.?\s+(\d{4})/.exec(text || '');
  if (!match) return null;
  const prefix = match[1].slice(0, 3).toLowerCase();
  const month = MONTHS.findIndex((name) => name.slice(0, 3).toLowerCase() === prefix);
  return month < 0 ? null : { month, year: Number(match[2]) };
}

/** "May 2026 – Aug 2026" -> {start, end, ongoing}. */
function parseRange(range) {
  const [from = '', to = ''] = String(range || '').split(/\s+[–—-]\s+/);
  const ongoing = /\b(present|now)\b/i.test(to);
  return { start: parseMonth(from), end: ongoing ? null : parseMonth(to), ongoing };
}

const hasRealDate = (text) => /\d{4}/.test(text || '');

function hasEnded(range) {
  const { end, ongoing } = parseRange(range);
  if (ongoing) return false;
  if (!end) return true;
  return new Date(end.year, end.month + 1, 1) <= new Date();
}

/** " from May to August 2026" across a set of roles, or ''. */
function spanOf(jobs) {
  const ranges = jobs.map((job) => parseRange(job.date));
  const starts = ranges.map((range) => range.start).filter(Boolean);
  const ends = ranges.map((range) => range.end).filter(Boolean);
  if (!starts.length || !ends.length) return '';
  const key = ({ year, month }) => year * 12 + month;
  const start = starts.reduce((a, b) => (key(b) < key(a) ? b : a));
  const end = ends.reduce((a, b) => (key(b) > key(a) ? b : a));
  const startYear = start.year === end.year ? '' : ` ${start.year}`;
  return ` from ${MONTHS[start.month]}${startYear} to ${MONTHS[end.month]} ${end.year}`;
}

/* ------------------------------------------------------------------ */
/* Facts                                                               */
/* ------------------------------------------------------------------ */

const featuredProjects = projects.filter((project) => project.featured);
const findProject = (slug) => projects.find((project) => project.slug === slug);
const findRole = (company, pattern) =>
  workExperience.find((job) => job.company === company && pattern.test(job.role));

/** Fuller names for prose where the short data label reads oddly. */
const FULL_NAMES = { 'Hume Center': 'Virginia Tech Hume Center' };
const fullName = (company) => FULL_NAMES[company] ?? company;
const inProse = (company) => {
  const name = fullName(company);
  return /\b(center|institute|university|lab)$/i.test(name) ? `the ${name}` : name;
};

/** "At IBM, I worked on…" -> "I worked on…" when the company is already named. */
const withoutLead = (summary, company) =>
  capitalize(summary.replace(new RegExp(`^At ${escapeRegExp(company)},\\s*`, 'i'), ''));

/** "I was a Quantitative Developer at Kalshi (Jan 2026 – May 2026)." */
function roleSentence(job) {
  const verb = hasEnded(job.date) ? 'was' : 'am';
  const when = hasRealDate(job.date) ? ` (${job.date})` : '';
  return `I ${verb} ${article(job.role)} ${job.role} at ${inProse(job.company)}${when}.`;
}

function describeRole(job) {
  return paragraphs(
    `${roleSentence(job)} ${withoutLead(job.summary, job.company)}`,
    bullets(job.highlights)
  );
}

function describeCompany(company, jobs) {
  if (jobs.length === 1) return describeRole(jobs[0]);
  return paragraphs(
    `I had ${countWord(jobs.length)} roles at ${inProse(company)}.`,
    jobs.map((job) => `**${job.role}**\n${withoutLead(job.summary, company)}`)
  );
}

/** {value: '36.7% → 95.0%', label: 'X after Y'} -> "Y raised X from 36.7% to 95.0%." */
function improvementSentence(metric) {
  const values = /^(\S+)\s*→\s*(\S+)$/.exec(metric?.value || '');
  const label = /^(.+?) after (.+)$/.exec(metric?.label || '');
  if (!values || !label) return '';
  return `${capitalize(label[2])} raised ${label[1]} from ${values[1]} to ${values[2]}.`;
}

function projectLinks(project) {
  const links = [];
  if (project.liveUrl) links.push(mdLink('Open site', project.liveUrl));
  if (project.repoUrl) {
    const isProfile = project.repoUrl.replace(/\/$/, '') === profile.github;
    links.push(mdLink(isProfile ? 'GitHub' : 'Source', project.repoUrl));
  }
  return links.join(' · ');
}

function describeProject(project) {
  const meta = [project.category, project.year].filter(Boolean).join(' · ');
  return paragraphs(
    `**${project.title}**${meta ? ` · ${meta}` : ''}\n${project.description}`,
    [project.tags?.join(' · '), projectLinks(project)].filter(Boolean).join('\n')
  );
}

const appDev = findRole('IBM', /applications developer/i);
const robotics = findRole('IBM', /robotics/i);
const ibmJobs = workExperience.filter((job) => job.company === 'IBM');
const kalshi = workExperience.find((job) => job.company === 'Kalshi');
const hume = workExperience.find((job) => job.company === 'Hume Center');
const hedgingPaper = research.find((paper) => /income risk/i.test(paper.title));
const hedgingEngine = findProject('income-risk-hedging');
const epmProjects = projects.filter((project) => /\bepm\b/i.test(project.title));

const ANSWERS = {
  ibm: () => {
    if (!appDev || !robotics || ibmJobs.length !== 2) return describeCompany('IBM', ibmJobs);
    const sameCity = ibmJobs.every((job) => job.location === appDev.location);
    const span = spanOf(ibmJobs);
    const modelResult = robotics.metric
      ? `The model reached ${robotics.metric.value} ${robotics.metric.label}.`
      : '';
    return paragraphs(
      `I did two internships at IBM${sameCity ? ` in ${appDev.location}${span ? ',' : ''}` : ''}${span}.`,
      `**${appDev.role}**\n${withoutLead(appDev.summary, 'IBM')} ${improvementSentence(appDev.metric)}`.trim(),
      `**${robotics.role}**\n${withoutLead(robotics.summary, 'IBM')} ${modelResult}`.trim(),
      'Ask about the EPM work or the Spot robot for more.'
    );
  },

  robotics: () => (robotics ? describeRole(robotics) : ''),

  epm: () =>
    appDev
      ? paragraphs(
          describeRole(appDev),
          epmProjects.length
            ? `Related projects: ${joinAnd(epmProjects.map((project) => `**${project.title}**`))}.`
            : ''
        )
      : '',

  kalshi: () =>
    kalshi
      ? paragraphs(
          describeRole(kalshi),
          hedgingPaper
            ? `You can read the paper here: ${mdLink(hedgingPaper.title, hedgingPaper.liveUrl)}.`
            : '',
          hedgingEngine
            ? `I also turned the model into a simulator, **${hedgingEngine.title}**.`
            : ''
        )
      : '',

  research: () =>
    paragraphs(
      'My research so far:',
      bullets(
        research.map((paper) => {
          const links = [
            mdLink('PDF', paper.liveUrl),
            paper.externalUrl ? mdLink('Handle', paper.externalUrl) : '',
          ].filter(Boolean);
          return `**${paper.title}.** ${paper.description} ${links.join(' · ')}`;
        })
      ),
      hume ? `At ${inProse(hume.company)}, ${lowerFirst(withoutLead(hume.summary, hume.company))}` : ''
    ),

  education: () =>
    paragraphs(
      `I’m studying for ${article(education.degree)} ${education.degree.replace(/^(B\.[AS]\.)\s+/, '$1 in ')} as a double major at ${profile.school}. I’m ${lowerFirst(education.accelerated)} My GPA is ${education.gpa}/${education.gpaScale}.`,
      `Coursework includes ${joinAnd(education.coursework.slice(0, 6))}, plus the graduate course ${education.graduateCourse.title}.`
    ),

  skills: () =>
    paragraphs(
      'The languages and tools I work with:',
      bullets(skillGroups.map((group) => `**${group.label}:** ${group.items.join(', ')}`))
    ),

  contact: () =>
    paragraphs(
      `You can email me at ${EMAIL_LINK}.`,
      `I’m also on ${mdLink('LinkedIn', profile.linkedin)} and ${mdLink('GitHub', profile.github)}. You can read my résumé ${mdLink('here', '#/resume')} or download the ${mdLink('PDF', profile.resumeUrl)}.`
    ),

  resume: () =>
    `You can read my résumé ${mdLink('here', '#/resume')} or download it as a ${mdLink('PDF', profile.resumeUrl)}.`,

  // Recruiting answers say only what the data says: no start dates, role
  // types, availability, or job-search status beyond graduation.
  availability: () =>
    `I graduate from ${profile.school} in ${profile.graduation}. If you have a role in mind, email me at ${EMAIL_LINK} and we can talk about timing.`,

  interests: () => `${INTERESTS} Send me a note at ${EMAIL_LINK} if the work overlaps.`,

  location: () =>
    `I’m based in ${profile.location}${education.location === profile.location ? `, where I study at ${profile.school}` : ''}.`,

  /** What he does now: a student; past roles stay in the past tense. */
  current: () => {
    const student = `I’m a math and computer science double major at ${profile.school}, graduating in ${profile.graduation}.`;
    const ongoing = workExperience.filter((job) => hasRealDate(job.date) && !hasEnded(job.date));
    if (ongoing.length) return paragraphs(student, ongoing.map(roleSentence).join(' '));

    const endKey = (job) => {
      const { end } = parseRange(job.date);
      return end ? end.year * 12 + end.month : -1;
    };
    const latestKey = Math.max(...workExperience.map(endKey));
    if (latestKey < 0) return student;
    const latest = workExperience.filter((job) => endKey(job) === latestKey);
    const { end } = parseRange(latest[0].date);
    const what =
      latest.length === 1
        ? `role was ${article(latest[0].role)} ${latest[0].role}`
        : latest.every((job) => /intern/i.test(job.role))
          ? `roles were ${countWord(latest.length)} internships`
          : `roles were ${joinAnd(latest.map((job) => job.role))}`;
    const companies = joinAnd([...new Set(latest.map((job) => inProse(job.company)))]);
    return paragraphs(
      student,
      `My most recent ${what} at ${companies}, which ended in ${MONTHS[end.month]} ${end.year}.`
    );
  },

  bestProject: () => {
    const picks = [
      ['epm-wizard', 'for applied AI in enterprise software'],
      ['spot-vision', 'for robotics and computer vision'],
      ['income-risk-hedging', 'for quantitative work'],
      ['refrax', 'for interactive research tools'],
    ]
      .map(([slug, reason]) => {
        const project = findProject(slug);
        return project ? `**${project.title}** ${reason}` : null;
      })
      .filter(Boolean);
    return paragraphs(
      'I’d start with these:',
      bullets(picks),
      `All ${projects.length} are in the ${mdLink('Projects', '#projects')} section. Ask about any of them by name.`
    );
  },

  projectCount: () =>
    `There are ${projects.length} projects on this site, and ${countWord(featuredProjects.length)} are featured: ${joinAnd(featuredProjects.map((project) => `**${shortTitle(project.title)}**`))}. They’re all in the ${mdLink('Projects', '#projects')} section.`,

  experience: () =>
    paragraphs(
      'These are the roles on my résumé:',
      bullets(
        workExperience.map(
          (job) =>
            `**${fullName(job.company)}**, ${job.role}${hasRealDate(job.date) ? ` (${job.date})` : ''}`
        )
      ),
      'Ask about any of them by name.'
    ),

  intro: () =>
    paragraphs(
      profile.summary.replace(/^I’m an? /, `I’m ${profile.name}, a `),
      `I’m based in ${profile.location}, and I graduate in ${profile.graduation}.`
    ),

  meta: () =>
    paragraphs(
      'This chat answers from my résumé and project notes, so it isn’t me typing.',
      API_URL
        ? 'Questions those notes don’t cover go to a language model that is told to stick to them. If it doesn’t know, it says so.'
        : 'If something isn’t in those notes, it says so instead of guessing.',
      `To reach me directly, email ${EMAIL_LINK}.`
    ),

  greeting: () => {
    const examples = featuredProjects
      .map((project) => shortTitle(project.title))
      .filter((title) => !/\s/.test(title))
      .slice(0, 2);
    const like = examples.length ? `, like ${examples.join(' or ')}` : '';
    return `Hi. You can ask about my internships at IBM, my Kalshi research, school, or any project by name${like}.`;
  },

  thanks: () => `Anytime. If you want to talk more, email me at ${EMAIL_LINK}.`,
};

/** Work authorization, visas, sponsorship, pay, offers: never answered from data. */
const DIRECT_REPLY = `I’d rather discuss that directly. You can email me at ${EMAIL_LINK}.`;

const UNKNOWN_REPLY = paragraphs(
  'I don’t have anything about that in my résumé or project notes, so I won’t guess.',
  `I can tell you about my internships at IBM, my Kalshi research, my projects, school, or skills. For anything else, email me at ${EMAIL_LINK}.`
);

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
 * `*` makes it a prefix ("robot*" matches "robots" and "robotics").
 */
function compileTerm(raw, base) {
  const prefix = raw.endsWith('*');
  const text = normalize(prefix ? raw.slice(0, -1) : raw);
  // Longer phrases are more specific, so they count for more.
  return { text, prefix, weight: base + (text.split(' ').length - 1) * 2 };
}

const termMatches = (padded, term) =>
  padded.includes(term.prefix ? ` ${term.text}` : ` ${term.text} `);

const TOPIC_WEIGHT = 3;
const WEAK_WEIGHT = 1;
const NAME_BONUS = 2;

/**
 * terms     topic keywords (weight 3, summed)
 * weak      tie-breakers (weight 1, summed)
 * names     names of one thing (only the best match counts, plus nameBonus)
 * maxWords  only match short messages (greetings, thanks)
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
    terms: ['research', 'paper', 'papers', 'publication*', 'published', 'publish', 'reddit', 'wallstreetbets', 'sentiment', 'kelly', 'capital allocation'],
    answer: ANSWERS.research,
  }),
  entry({
    id: 'education',
    terms: ['nyu', 'courant', 'new york university', 'education', 'school', 'college', 'university', 'courses', 'coursework', 'class', 'classes', 'gpa', 'grades', 'graduat*', 'degree', 'major', 'minor', 'student', 'study', 'studying'],
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
    terms: ['contact', 'email', 'e mail', 'reach you', 'reach out', 'get in touch', 'hire', 'hiring', 'linkedin', 'github', 'phone', 'talk to you'],
    answer: ANSWERS.contact,
  }),
];

/** Group roles by company so "what did you do at IBM" covers both internships. */
const COMPANY_ANSWERS = { IBM: ANSWERS.ibm };
const COMPANY_ALIASES = {
  IBM: ['international business machines'],
  'Hume Center': ['hume', 'virginia tech', 'contentcube', 'cubesat', 'satellite', 'aerospace', 'low earth orbit'],
  'Y-Axis': ['yaxis'],
};
const STOP_WORDS = new Set(['the', 'and', 'of', 'center', 'software', 'inc']);

const companyEntries = [...new Set(workExperience.map((job) => job.company))].map(
  (company) => {
    const jobs = workExperience.filter((job) => job.company === company);
    const normalizedName = normalize(company);
    const [firstWord] = normalizedName.split(' ');
    return entry({
      id: `company:${normalizedName}`,
      names: [
        normalizedName,
        firstWord.length >= 3 && !STOP_WORDS.has(firstWord) ? firstWord : null,
        ...(COMPANY_ALIASES[company] ?? []),
      ].filter(Boolean),
      answer: COMPANY_ANSWERS[company] ?? (() => describeCompany(company, jobs)),
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

const projectEntries = projects.map((project) =>
  entry({
    id: `project:${project.slug}`,
    names: [
      ...new Set([
        project.title,
        shortTitle(project.title),
        project.slug.replace(/-/g, ' '),
        ...(PROJECT_ALIASES[project.slug] ?? []),
      ]),
    ],
    nameBonus: NAME_BONUS,
    answer: () => describeProject(project),
  })
);

/** "Quant projects", "AI projects", …: the matching projects in Rohan's words. */
const PROJECT_GROUPS = [
  {
    id: 'quant',
    intro: 'My quant projects:',
    terms: ['quant project*', 'quantitative project*', 'finance project*', 'trading project*', 'market project*'],
    test: (project) => project.category === 'Quant',
  },
  {
    id: 'ai',
    intro: 'My AI projects:',
    terms: ['ai project*', 'machine learning project*', 'ml project*', 'llm project*'],
    test: (project) => /\bAI\b/.test(project.category),
  },
  {
    id: 'robotics',
    intro: 'My robotics, vision, and hardware projects:',
    terms: ['robotics project*', 'robot project*', 'vision project*', 'hardware project*'],
    test: (project) =>
      /robot|vision|opencv|spot|hardware|embedded/i.test([project.title, ...project.tags].join(' ')),
  },
  {
    id: 'web',
    intro: 'My web projects:',
    terms: ['web project*', 'web app*', 'website*', 'full stack'],
    test: (project) => project.category === 'Web',
  },
  {
    id: 'study',
    intro: 'Projects I made for school and studying:',
    terms: ['study tool*', 'education project*', 'school project*', 'learning tool*'],
    test: (project) => project.category === 'Education',
  },
];

const groupEntries = PROJECT_GROUPS.map((group) =>
  entry({
    id: `projects:${group.id}`,
    terms: group.terms,
    answer: () =>
      paragraphs(
        group.intro,
        bullets(
          projects.filter(group.test).map((project) => `**${project.title}.** ${project.description}`)
        ),
        'Ask about any of them for links and details.'
      ),
  })
);

const RECRUITING = [
  entry({
    id: 'availability',
    terms: [
      'are you available', 'you available', 'your availability', 'availability', 'available for', 'available to start',
      'when can you start', 'can you start', 'start date', 'how soon',
      'when do you graduate', 'when will you graduate', 'when are you graduating', 'are you graduating', 'graduation date', 'graduation year', 'expected graduation', 'year do you graduate', 'class of',
      'finish school', 'finish your degree', 'after graduation', 'after you graduate', 'new grad',
      'internship or full time', 'internships or full time', 'full time', 'fulltime', 'part time',
      'open to work', 'open to opportunities', 'open to new', 'open to roles', 'open to internships',
      'looking for a job', 'looking for work', 'looking for an internship', 'looking for internships', 'job search', 'job hunting', 'seeking',
    ],
    answer: ANSWERS.availability,
  }),
  entry({
    id: 'interests',
    terms: [
      'what are you looking for', 'looking for', 'what roles', 'what role', 'kind of role*', 'type of role*', 'kind of work', 'type of work', 'kind of job*', 'kind of company',
      'interested in', 'your interests', 'what interests you', 'career', 'dream job', 'ideal role', 'ideal job', 'what do you want to do', 'what field', 'which field', 'goals',
    ],
    answer: ANSWERS.interests,
  }),
  entry({
    id: 'location',
    terms: ['where are you based', 'based in', 'based out of', 'where are you located', 'you located', 'location', 'where do you live', 'where are you from', 'where are you', 'which city', 'what city', 'nyc', 'new york'],
    answer: ANSWERS.location,
  }),
  entry({
    id: 'resume',
    terms: ['resume', 'cv', 'curriculum vitae'],
    answer: ANSWERS.resume,
  }),
  entry({
    id: 'current',
    terms: [
      'right now', 'currently', 'currently at', 'at the moment', 'are you working on', 'are you doing now', 'what do you do now',
      'current job', 'current role', 'current position', 'current employer', 'where do you work', 'where are you working', 'do you work at',
      'still work*', 'still at', 'still with', 'employed',
    ],
    weak: ['working on', 'now'],
    answer: ANSWERS.current,
  }),
];

/**
 * Checked before everything else, so a question that touches work
 * authorization, visas, sponsorship, pay, offers, or where he'll work never
 * gets a factual answer, however else it is phrased.
 */
const DIRECT = [
  entry({
    id: 'direct',
    terms: [
      'visa', 'visas', 'need sponsorship', 'require sponsorship', 'requires sponsorship', 'sponsorship for', 'sponsor you', 'sponsor your', 'sponsor a visa',
      'work authorization', 'work authorisation', 'authorized to work', 'authorised to work', 'eligible to work', 'work permit', 'right to work', 'legally',
      'citizen*', 'green card', 'h1b', 'h 1b', 'opt', 'cpt', 'immigration', 'international student',
      'salary', 'salaries', 'compensation', 'expected comp*', 'pay', 'paid', 'pay rate', 'hourly rate', 'your rate', 'stipend',
      'how much do you charge', 'how much do you expect', 'how much do you want', 'how much are you asking',
      'relocat*', 'remote', 'remotely', 'hybrid role', 'hybrid work', 'work hybrid', 'onsite', 'on site', 'in office', 'in person',
      'job offer', 'return offer', 'full time offer', 'an offer', 'any offers', 'other offers',
      'go back to', 'going back to', 'return to', 'rejoin', 'there again', 'ibm again',
    ],
    answer: () => DIRECT_REPLY,
  }),
  // Single words that are only safe in short questions ("Sponsorship?").
  entry({ id: 'direct', terms: ['sponsorship', 'sponsor'], maxWords: 4, answer: () => DIRECT_REPLY }),
];

const OVERVIEWS = [
  ...groupEntries,
  entry({
    id: 'best-project',
    terms: ['best project*', 'which project*', 'favorite project*', 'favourite project*', 'top project*', 'featured', 'look at first', 'start with', 'proudest', 'coolest', 'projects', 'side project*', 'portfolio'],
    answer: ANSWERS.bestProject,
  }),
  entry({
    id: 'project-count',
    terms: ['how many project*', 'number of projects', 'how many things'],
    answer: ANSWERS.projectCount,
  }),
  entry({
    id: 'experience',
    terms: ['experience', 'work history', 'worked', 'jobs', 'internships', 'employers', 'companies', 'roles'],
    answer: ANSWERS.experience,
  }),
  // Below topics, companies, and projects so "what are you working on at IBM" stays about IBM.
  entry({
    id: 'intro',
    terms: ['who are you', 'yourself', 'about you', 'who is rohan', 'your name', 'introduce', 'background'],
    weak: ['lately', 'these days'],
    answer: ANSWERS.intro,
  }),
  entry({
    id: 'meta',
    terms: ['rohangpt', 'are you real', 'are you an ai', 'are you ai', 'are you a bot', 'are you human', 'is this ai', 'how does this work', 'how do you work', 'chatbot', 'language model'],
    answer: ANSWERS.meta,
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

const QUICK_ANSWERS = [...TOPICS, ...companyEntries, ...projectEntries, ...RECRUITING, ...OVERVIEWS].filter(
  (item) => item.answer
);

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

/** Best local answer for `input` as {id, answer}, or null when nothing in the notes fits. */
export function findQuickAnswer(input) {
  const text = normalize(input);
  if (!text) return null;
  const padded = ` ${text} `;
  const wordCount = text.split(' ').length;

  const direct = DIRECT.find((item) => scoreEntry(item, padded, wordCount) > 0);
  if (direct) return { id: direct.id, answer: direct.answer };

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

const FOLLOW_UP =
  /^(?:(?:ok|okay|cool|nice|and|so|sure|yes|yeah)\s+)?(?:(?:can|could) you\s+)?(?:tell me more|more|say more|go on|keep going|continue|elaborate|expand(?: on that)?|more details?|any more details?|what else|anything else|details)(?:\s+(?:please|about (?:that|it)|on (?:that|it)))?$/;

/** "Tell me more" after a local answer, or null. `lastId` is that answer's id. */
export function findFollowUp(input, lastId) {
  if (!lastId || !FOLLOW_UP.test(normalize(input))) return null;

  if (lastId === 'company:ibm') {
    return { id: 'follow-up', answer: 'Which part: the EPM work or the Spot robot?' };
  }
  const project = lastId.startsWith('project:') && findProject(lastId.slice('project:'.length));
  if (project?.longDescription) {
    return { id: `${lastId}:more`, answer: paragraphs(project.longDescription, projectLinks(project)) };
  }
  return {
    id: 'follow-up',
    answer: `That’s everything my notes have on it. You can ask about something else, or email me at ${EMAIL_LINK}.`,
  };
}

/* ------------------------------------------------------------------ */
/* Live endpoint                                                       */
/* ------------------------------------------------------------------ */

const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const SYSTEM_PROMPT = `You are the assistant on Rohan Malhotra's portfolio site (rohanm.org). Answer as Rohan, in a plain, specific, first-person voice. Keep answers short: two to five sentences, or a few bullets. Markdown is fine (bold, inline code, links, bullet lists).

It is ${currentMonth}. Roles that have ended are finished: describe them in the past tense. Never say or imply that Rohan currently works at IBM or will work there again.

On availability, start dates, or the kind of role he wants, say only that he graduates from ${profile.school} in ${profile.graduation} and that ${INTERESTS.replace(/^I’m/, 'he’s')} Then suggest emailing ${profile.email}. Never discuss work authorization, visas, sponsorship, salary, or offers: say he'd rather discuss that directly and give his email.

Facts:
- ${profile.summary} Based in ${profile.location}.
- Education: ${education.degree}, ${education.minor}, ${profile.school} (${education.dates}). ${education.accelerated} GPA ${education.gpa}/${education.gpaScale}.
- Experience:
${workExperience
  .map(
    (job) =>
      `  - ${fullName(job.company)}, ${job.role}${hasRealDate(job.date) ? ` (${job.date})` : ''}: ${job.highlights.join(' ')}`
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

Use only these facts. Do not invent employers, metrics, dates, publications, awards, opinions, or job-search status. If something is not listed, say you don't know and suggest emailing ${profile.email}. No hype or résumé-speak ("passionate", "cutting-edge", "leveraging").`;

async function requestLiveReply({ history, input, signal }) {
  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: input },
        ],
        message: input,
        name: 'Visitor',
        systemPrompt: SYSTEM_PROMPT,
      }),
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new Error('Couldn’t reach the chat service. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error('The chat service isn’t responding right now. Try again in a moment.');
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new Error('The chat service sent back something unreadable. Try again.');
  }
  const content = data?.response ?? data?.content ?? data?.message;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('The chat service sent back an empty answer. Try again.');
  }
  return content.trim();
}

/** The last few user/assistant turns, trimmed, for the model's context. */
const toHistory = (messages) =>
  messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .slice(-HISTORY_LIMIT)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, MAX_CONTENT_CHARS),
    }));

/** A local reply ({id, answer, source}) or null when the question should go to the model. */
function answerLocally(input, prior) {
  const quick = findQuickAnswer(input);
  if (quick) return { ...quick, source: 'profile' };
  if (API_URL) return null;
  const lastReply = [...prior].reverse().find((message) => message.role === 'assistant');
  const followUp = findFollowUp(input, lastReply?.topic);
  if (followUp) return { ...followUp, source: 'profile' };
  return { id: 'unknown', answer: UNKNOWN_REPLY, source: 'unknown' };
}

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

let idCounter = 0;
const createMessage = (role, content, extra) => ({
  id: `rgpt-${Date.now().toString(36)}-${(idCounter += 1)}`,
  role,
  content,
  ...extra,
});

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * Chat state. Messages look like {id, role: 'user'|'assistant', content},
 * and assistant messages also carry `source` ('profile', 'live', or
 * 'unknown') and `topic` (the local answer's id, for follow-ups).
 */
export function useRohanGPTChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // The source of truth for callbacks, updated in step with every change so a
  // send that lands right after a reply still sees that reply.
  const messagesRef = useRef(messages);
  const busyRef = useRef(false);
  const abortRef = useRef(null);
  // Bumped on every request and on reset so late replies are ignored.
  const generationRef = useRef(0);

  const update = useCallback((change) => {
    messagesRef.current = change(messagesRef.current);
    setMessages(messagesRef.current);
  }, []);

  useEffect(
    () => () => {
      generationRef.current += 1;
      abortRef.current?.abort();
    },
    []
  );

  const respond = useCallback(
    async (input, prior) => {
      const generation = (generationRef.current += 1);
      const isStale = () => generation !== generationRef.current;
      const append = (content, extra) =>
        update((list) => [...list, createMessage('assistant', content, extra)]);

      busyRef.current = true;
      setLoading(true);
      setError(null);

      let timedOut = false;
      try {
        const local = answerLocally(input, prior);
        if (local) {
          await wait(LOCAL_REPLY_DELAY_MS);
          if (!isStale()) append(local.answer, { source: local.source, topic: local.id });
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
          const reply = await requestLiveReply({
            history: toHistory(prior),
            input,
            signal: controller.signal,
          });
          if (!isStale()) append(reply, { source: 'live' });
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
              : 'Something went wrong. Try again.'
        );
      } finally {
        if (!isStale()) {
          busyRef.current = false;
          setLoading(false);
        }
      }
    },
    [update]
  );

  /** Ask a question. Returns false when it was empty or a reply is pending. */
  const sendMessage = useCallback(
    (text) => {
      const input = String(text ?? '').trim().slice(0, MAX_INPUT_CHARS);
      if (!input || busyRef.current) return false;
      const prior = messagesRef.current;
      update((list) => [...list, createMessage('user', input)]);
      respond(input, prior);
      return true;
    },
    [respond, update]
  );

  /** Ask the last question again after an error. */
  const retry = useCallback(() => {
    if (busyRef.current) return;
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
    busyRef.current = false;
    setLoading(false);
    setError(null);
    update(() => []);
  }, [update]);

  return { messages, loading, error, sendMessage, retry, reset };
}
