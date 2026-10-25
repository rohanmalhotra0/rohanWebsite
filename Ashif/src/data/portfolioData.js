// The prerendered HTML has to match the client build, whose base is './'
// (Vite always reports '/' while rendering on the server).
const BASE = import.meta.env.SSR ? './' : import.meta.env.BASE_URL || '/';

export const assetUrl = (path) =>
  `${BASE}${String(path || '').replace(/^\/+/, '')}`;

export const profile = {
  name: 'Rohan Malhotra',
  location: 'New York, NY',
  email: 'rohanm8974@gmail.com',
  website: 'https://rohanm.org',
  github: 'https://github.com/rohanmalhotra0',
  linkedin: 'https://www.linkedin.com/in/rohanamal',
  /** This site's source (public). */
  siteRepo: 'https://github.com/rohanmalhotra0/rohanWebsite',
  resumeUrl: assetUrl('Rohan_Malhotra_Resume.pdf'),
  headline: 'Applied AI, quantitative systems, and robotics.',
  /** Hero line: leads with the IBM robotics and Kalshi work, in past tense. */
  intro:
    'I’m a math and computer science double major at NYU Courant. At IBM I trained the vision system for a Boston Dynamics Spot demo, and at Kalshi I turned research on income risk into a prediction-market hedging tool.',
  school: 'NYU Courant',
  graduation: 'May 2027',
};


export const photos = [
  {
    id: 'portrait',
    src: assetUrl('img/me/portrait.webp'),
    width: 800,
    height: 1200,
    alt: 'Professional headshot of Rohan Malhotra',
    label: 'Me',
    caption: 'Computer science, math, robots, markets, and too many side projects.',
  },
  {
    id: 'switzerland',
    src: assetUrl('img/me/switzerland.webp'),
    width: 702,
    height: 942,
    alt: 'Rohan Malhotra with another person in front of the Swiss Alps',
    label: 'Switzerland',
    caption: 'One of those views that makes you stop and stare.',
  },
  {
    id: 'paragliding',
    src: assetUrl('img/me/paragliding.webp'),
    width: 1200,
    height: 900,
    alt: 'Rohan Malhotra tandem paragliding over a mountain valley and lake',
    label: 'Paragliding',
    caption: 'Probably the best way I have ever seen the mountains.',
  },
  {
    id: 'kayaking',
    src: assetUrl('img/me/kayaking.webp'),
    width: 704,
    height: 938,
    alt: 'Rohan Malhotra kayaking on an alpine lake',
    label: 'Kayaking',
    caption: 'A little quieter than most of my side projects.',
  },
  {
    id: 'basketball',
    src: assetUrl('img/me/basketball.webp'),
    width: 800,
    height: 1200,
    alt: 'Rohan Malhotra dribbling a basketball outdoors',
    label: 'Basketball',
  },
  {
    id: 'giraffe',
    src: assetUrl('img/me/giraffe.webp'),
    width: 712,
    height: 950,
    alt: 'Rohan Malhotra standing next to a giraffe at an outdoor enclosure',
    label: 'Giraffe',
  },
];

/** Cut-out headshot on pure black; blends into the dark theme. */
export const portraitCutout = {
  src: assetUrl('img/me/portrait-cutout.webp'),
  width: 800,
  height: 1200,
  alt: 'Professional headshot of Rohan Malhotra',
};

export const workExperience = [
  {
    company: 'IBM',
    role: 'Applications Developer Intern',
    metric: { value: '36.7% → 95.0%', label: 'EPM artifact accuracy after fine-tuning Qwen-Coder-32B' },
    location: 'Dallas, TX',
    date: 'May 2026 – Aug 2026',
    imageUrl: assetUrl('website-photos/work/ibm_logo.webp'),
    imageAlt: 'IBM logo',
    imageLabel: 'IBM Consulting',
    logoClassName: 'h-[68px] w-auto max-w-[72%]',
    summary:
      'At IBM, I worked on Oracle EPM forecasting, cloud integrations, and an on-prem assistant for finance teams.',
    highlights: [
      'Built rolling 13-day cash forecasts, SOFR loan calculations, interest accrual models, close reports, and an XGBoost cash-flow model in Oracle EPM Planning.',
      'Integrated banking APIs through Oracle Integration Cloud, creating JSON pipelines into ERP Financials and EPM while migrating Excel workflows to Oracle Cloud.',
      'Fine-tuned Qwen-Coder-32B on Oracle EPM implementation assets, raising form, business-rule, and report creation accuracy from 36.7% to 95.0%.',
      'Built an on-prem assistant that turns plain-language requests into reviewable EPM JSON, using RAG, MCP tools, confidence scoring, EPM Automate, and Oracle EPM APIs.',
    ],
    tags: ['Oracle EPM', 'OIC', 'XGBoost', 'RAG', 'MCP', 'Qwen'],
  },
  {
    company: 'IBM',
    role: 'Robotics Engineer Intern',
    metric: { value: '99.5%', label: 'mAP@50 on 898 hand-labeled images' },
    location: 'Dallas, TX',
    date: 'Jun 2026 – Aug 2026',
    imageUrl: assetUrl('website-photos/work/ibm_logo.webp'),
    imageAlt: 'IBM logo',
    imageLabel: 'IBM Robotics',
    logoClassName: 'h-[68px] w-auto max-w-[72%]',
    summary:
      'I trained the vision system for a Boston Dynamics Spot demo and connected real-time detection to the robot.',
    video: { id: 'ba-QHNwbSI4', title: 'Spot dog-toy detection', source: 'Dev Club IBM' },
    highlights: [
      'Trained YOLO11 models on 898 manually labeled images, reaching about 99.4% precision, 99.4% recall, and 99.5% mAP@50.',
      'Connected real-time inference to the Spot SDK with Python, OpenCV, gRPC, multithreading, and lock-free inference queues.',
      'Implemented an autonomous dog-toy finder and presented live retrieval demos at IBM DevCon.',
      'Open-sourced model weights, training pipelines, and deployment documentation; the demo was adopted by IBM sales and client-success teams.',
    ],
    tags: ['YOLO11', 'Boston Dynamics Spot', 'OpenCV', 'gRPC', 'Robotics'],
  },
  {
    company: 'Kalshi',
    role: 'Quantitative Developer',
    location: 'New York, NY',
    date: 'Jan 2026 – May 2026',
    imageUrl: assetUrl('website-photos/work/kalshi_logo.jpeg'),
    imageAlt: 'Kalshi logo',
    imageLabel: 'Kalshi',
    logoClassName:
      'size-[84px] rounded-lg border border-black/5 shadow-sm',
    summary:
      'I turned research on income risk into a working prediction-market hedging tool.',
    highlights: [
      'Co-authored research modeling job-loss risk as a macro-sensitive Poisson hazard process with jump-diffusion income dynamics.',
      'Applied minimum-variance hedge ratios and Monte Carlo simulation to measure tail-risk reduction from Kalshi contracts.',
      'Built a Next.js/React and Python recommendation engine for contract sizing, upfront cost, and tail-risk comparisons.',
      'Integrated FRED and BLS data, wrote C++ risk tools, containerized the runtime with Docker, and deployed it to Render.',
    ],
    tags: ['C++', 'Next.js', 'Monte Carlo', 'FRED', 'BLS', 'Docker'],
  },
  {
    company: 'Aress Software',
    role: 'Machine Learning Intern',
    metric: { value: '500K+', label: 'multimodal records used for training' },
    location: 'New York, NY',
    date: 'Jun 2025 – Aug 2025',
    imageUrl: assetUrl('website-photos/work/aress-logo.png'),
    imageAlt: 'Aress Software logo',
    imageLabel: 'Aress Software',
    logoClassName: 'h-[58px] w-auto max-w-[74%]',
    summary:
      'I trained PyTorch models on multimodal data and brought several reporting sources into one analytics workflow.',
    highlights: [
      'Trained PyTorch models on more than 500,000 multimodal records.',
      'Combined data from more than 10 sources into dashboards the team used for reporting.',
    ],
    tags: ['PyTorch', 'Data Engineering', 'Analytics'],
  },
  {
    company: 'Virginia Tech Hume Center',
    role: 'Aerospace Researcher',
    location: 'Blacksburg, VA',
    date: 'Nov 2024 – May 2025',
    imageUrl: assetUrl('website-photos/work/hume-center-logo.jpg'),
    imageAlt: 'Hume Center for National Security and Technology logo',
    imageLabel: 'Virginia Tech Hume Center',
    logoClassName: 'h-[76px] w-auto max-w-[82%]',
    summary:
      'I worked on embedded imaging and signal-processing tests for a CubeSat that reached low Earth orbit.',
    highlights: [
      'Supported the design, build, and testing of ContentCube before launch to the International Space Station.',
      'Programmed imaging and signal-processing tests in C for autonomous in-orbit photography.',
      'Tested the imaging code alongside the CubeSat hardware before launch.',
    ],
    tags: ['C', 'CubeSat', 'Embedded Systems', 'Signal Processing'],
  },
  {
    company: 'Y-Axis',
    role: 'Data Engineering Intern',
    location: 'Chatham, NJ',
    date: 'May 2024 – Aug 2024',
    imageUrl: assetUrl('website-photos/work/y-axis-logo.webp'),
    imageAlt: 'Y-Axis Overseas Careers logo',
    imageLabel: 'Y-Axis',
    logoClassName: 'h-[52px] w-auto max-w-[72%]',
    summary:
      'I cleaned SQL data, built predictive features, and automated recurring Excel reporting.',
    highlights: [
      'Cleaned and normalized SQL datasets for downstream analysis.',
      'Built predictive features and automated Excel dashboards for business teams.',
    ],
    tags: ['SQL', 'Excel', 'Feature Engineering', 'Automation'],
  },
];

export const research = [
  {
    title: 'Hedging Personal Income Risk Using Prediction Markets',
    authors: 'Rahul Jayachandran, Ethan Lin, Rohan Malhotra',
    year: '2026',
    keywords: ['Kalshi'],
    description:
      'A macro-sensitive Poisson hazard model with jump-diffusion income dynamics, minimum-variance hedge ratios, and Monte Carlo simulation for measuring tail-risk reduction.',
    imageUrl: assetUrl('img/research/income-hedging.webp'),
    imageAlt: 'First page of the paper',
    liveUrl: assetUrl('papers/hedging-income-risk-prediction-markets.pdf'),
    tags: ['Prediction Markets', 'Poisson Process', 'Monte Carlo'],
  },
  {
    title: 'Reddit Data in Quantitative Financial Models',
    subtitle: 'Evolution and Implications Post GameStop and AMC Short Squeeze',
    authors: 'Rohan Malhotra, Colin Jones',
    year: '2025',
    venue: 'VTechWorks',
    description:
      'NLP and regression models in Python measuring how r/wallstreetbets sentiment relates to equity returns and volatility.',
    imageUrl: assetUrl('img/research/reddit-sentiment.webp'),
    imageAlt: 'First page of the paper',
    liveUrl: assetUrl('papers/reddit-sentiment-financial-models.pdf'),
    externalUrl: 'https://hdl.handle.net/10919/124730',
    tags: ['NLP', 'Regression', 'Market Data'],
  },
  {
    title: 'An Economic Approach to Optimize Capital Allocation',
    authors: 'Rohan Malhotra',
    year: '2024',
    venue: 'VTechWorks',
    description:
      'Monte Carlo backtesting of fractional and full Kelly strategies with emphasis on drawdowns, path dependence, and risk-adjusted growth.',
    imageUrl: assetUrl('img/research/capital-allocation.webp'),
    imageAlt: 'First page of the paper',
    liveUrl: assetUrl('papers/kelly-capital-allocation.pdf'),
    externalUrl: 'https://hdl.handle.net/10919/124871',
    tags: ['Kelly Criterion', 'Optimization', 'Risk'],
  },
];

export const projects = [
  {
    title: 'EPM Wizard',
    slug: 'epm-wizard',
    category: 'AI & systems',
    year: '2026',
    description:
      'I built EPM Wizard so I could describe an Oracle EPM form or rule in plain English, inspect the generated artifact, and approve it before deployment.',
    longDescription:
      'I can describe what I need, preview the forms and rules it creates, approve the changes, and deploy them with checks in place.',
    imageUrl: assetUrl('img/projects/epm-wizard.webp'),
    imageAlt: 'EPM Wizard product interface',
    repoUrl: 'https://github.com/rohanmalhotra0/epm',
    tags: ['FastAPI', 'React', 'IBM Carbon', 'Groovy', 'Playwright'],
    featured: true,
  },
  {
    title: 'Oracle EPM Interactive Guide',
    slug: 'epm-interactive-guide',
    category: 'Education',
    year: '2026',
    description:
      'I made this while learning Oracle EPM because I wanted something easier to explore than a normal textbook.',
    longDescription:
      'It includes visual workflows, an approval-state simulator, a glossary, quick navigation, and a built-in study assistant.',
    imageUrl: assetUrl('img/projects/epm-interactive-guide.webp'),
    imageAlt: 'Oracle EPM interactive learning guide homepage',
    liveUrl: 'https://capstone-snowy-sigma.vercel.app',
    repoUrl: 'https://github.com/rohanmalhotra0/capstone',
    tags: ['Next.js', 'React Flow', 'Mermaid', 'OpenAI'],
    featured: true,
  },
  {
    title: 'Casen: Consulting Casebook',
    slug: 'casen',
    category: 'AI & systems',
    year: '2026',
    description:
      'I built Casen to make case-interview prep feel less scattered by keeping cases, drills, voice practice, and job tracking in one place.',
    longDescription:
      'I use it for frameworks, vocabulary drills, behavioral stories, M&A news, and realistic voice-based mock interviews.',
    imageUrl: assetUrl('img/projects/casen.webp'),
    imageAlt: 'Casen consulting casebook landing page',
    liveUrl: 'https://getcasen.com',
    repoUrl: 'https://github.com/rohanmalhotra0/lab',
    tags: ['JavaScript', 'OpenAI', 'Supabase', 'Voice AI'],
    featured: true,
  },
  {
    title: 'NightShift',
    slug: 'nightshift',
    category: 'AI & systems',
    year: '2026',
    description:
      'I built NightShift to handle the repetitive parts of applying to jobs: finding roles, filling forms, checking confirmation emails, and keeping an application log.',
    longDescription:
      'It combines browser automation, scheduling, email checks, subscriptions, and a dashboard where I can see what is happening.',
    imageUrl: assetUrl('img/projects/nightshift.webp'),
    imageAlt: 'NightShift automated job platform landing page',
    liveUrl: 'https://night-shift-two.vercel.app',
    repoUrl: 'https://github.com/rohanmalhotra0/NightShift',
    tags: ['FastAPI', 'Playwright', 'Next.js', 'Stripe'],
    featured: true,
  },
  {
    title: 'Refrax',
    slug: 'refrax',
    category: 'Quant',
    year: '2025',
    description:
      'I built Refrax to explore market data, run models, and see the results in 2D and 3D without jumping between tools.',
    longDescription:
      'I wanted one workspace where I could pull live market data, run a numerical experiment, and inspect the result in 2D or 3D.',
    imageUrl: assetUrl('img/projects/refrax.webp'),
    imageAlt: 'Refrax quantitative visualization interface',
    liveUrl: 'https://refrax.io',
    repoUrl: 'https://github.com/rohanmalhotra0/prism-frontend',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Visualization'],
    featured: true,
  },
  {
    title: 'Spot Vision Pipeline',
    slug: 'spot-vision',
    category: 'AI & robotics',
    year: '2026',
    description:
      'At IBM, I trained the vision system that helps a Boston Dynamics Spot robot find and retrieve objects in real time.',
    longDescription:
      'I labeled the data, trained and tested the model, connected it to the robot, and helped turn it into a live retrieval demo.',
    imageUrl: assetUrl('img/projects/spot-vision.webp'),
    imageAlt: 'Render of a Spot-style quadruped robot with an arm, from the 3D demo on this site',
    repoUrl: 'https://github.com/rohanmalhotra0',
    tags: ['YOLO11', 'OpenCV', 'Spot SDK', 'gRPC'],
    featured: true,
  },
  {
    title: 'Income Risk Hedging Engine',
    slug: 'income-risk-hedging',
    category: 'Quant',
    year: '2026',
    description:
      'I turned my Kalshi research into a simulator that shows how prediction-market contracts could hedge job-loss risk.',
    longDescription:
      'You enter a few assumptions and it compares contract sizes, upfront cost, and tail risk before and after the hedge.',
    repoUrl: 'https://github.com/rohanmalhotra0/kalshiQR',
    tags: ['Next.js', 'Python', 'C++', 'Monte Carlo'],
  },
  {
    title: 'GreenSticker',
    slug: 'greensticker',
    category: 'AI & robotics',
    year: '2025',
    description:
      'I built a hands-free mouse that follows a colored sticker through a webcam, making basic computer control more accessible.',
    imageUrl: assetUrl('img/projects/greensticker.webp'),
    imageAlt: 'GreenSticker computer-vision accessibility interface',
    liveUrl: 'https://greensticker.us',
    repoUrl: 'https://github.com/rohanmalhotra0/greenSticker2',
    tags: ['Python', 'Computer Vision', 'Accessibility'],
  },
  {
    title: 'Autism Research Tool',
    slug: 'autism-research',
    category: 'Web',
    description:
      'I built a research prototype for collecting screening responses in a structured, easier-to-follow flow. It does not diagnose autism.',
    imageUrl: assetUrl('img/projects/autism-research.webp'),
    imageAlt: 'Autism research tool interface',
    liveUrl: 'https://autismtester.com',
    repoUrl: 'https://github.com/rohanmalhotra0/AutismResearch',
    tags: ['Research Tooling', 'Data Collection', 'UX'],
  },
  {
    title: 'PIVOT Platform',
    slug: 'pivot',
    category: 'Web',
    year: '2024',
    description:
      'I worked on PIVOT, a site where students at different universities can post STEM projects and find collaborators.',
    liveUrl: 'https://vtpivot.org',
    tags: ['React', 'Collaboration', 'Infrastructure'],
  },
  {
    title: 'Gavindle',
    slug: 'gavindle',
    category: 'Web',
    description:
      'I made a daily word game with streaks, stats, and a shared leaderboard because I wanted my own spin on Wordle.',
    imageUrl: assetUrl('img/projects/gavindle.webp'),
    imageAlt: 'Gavindle word game interface',
    liveUrl: 'https://gavindle.com',
    repoUrl: 'https://github.com/rohanmalhotra0/gavindle',
    tags: ['React', 'PostgreSQL', 'Full Stack'],
  },
  {
    title: 'American Options Pricing System',
    slug: 'american-options-pricing',
    category: 'Quant',
    description:
      'I built a scheduled Python pipeline that pulls option data, prices American contracts with a binomial tree, and saves each run for review.',
    repoUrl: 'https://github.com/rohanmalhotra0/Discrete-Options-System',
    tags: ['Python', 'NumPy', 'Alpaca', 'Options'],
  },
  {
    title: 'Quantum Oscillating Stock Model',
    slug: 'oscillating-stock-model',
    category: 'Quant',
    description:
      'I experimented with wave-like cycles in market data to see whether they could help identify changing regimes and recurring signals.',
    tags: ['Time Series', 'Signals', 'Regime Detection'],
  },
  {
    title: 'RSI Predictor',
    slug: 'rsi-predictor',
    category: 'Quant',
    description:
      'I compared linear regression and random forests to see which one handled RSI prediction better from simple market features.',
    repoUrl: 'https://github.com/rohanmalhotra0/rsi-random-forest',
    tags: ['Random Forest', 'Moving Averages', 'Holdout MAE'],
  },
  {
    title: 'Wearable Linear Generator',
    slug: 'linear-generator',
    category: 'Systems',
    description:
      'I built a small hardware prototype that uses Faraday’s law to turn body motion into electrical power.',
    imageUrl: assetUrl('img/projects/linear-generator.webp'),
    imageAlt: 'Wearable linear-generator engineering prototype',
    tags: ['Embedded Systems', 'Energy Harvesting', 'Hardware'],
  },
  {
    title: 'AI Quiz Maker',
    slug: 'ai-quiz-maker',
    category: 'AI & systems',
    year: '2026',
    description:
      'I made this so I could drop in a PDF or notes and get a usable set of quizzes, flashcards, and recall prompts.',
    repoUrl: 'https://github.com/rohanmalhotra0/ai-quiz-generator',
    tags: ['Next.js', 'FastAPI', 'OpenAI', 'PDF Extraction'],
  },
  {
    title: 'Kalshi Live Kelly Dashboard',
    slug: 'kalshi-live-kelly',
    category: 'Quant',
    year: '2026',
    description:
      'I built a live dashboard that streams Kalshi prices and lets me test position sizes with the Kelly criterion.',
    repoUrl: 'https://github.com/rohanmalhotra0/KalshiHedgingDashboard',
    tags: ['FastAPI', 'WebSocket', 'Plotly', 'Kelly Criterion'],
  },
  {
    title: 'IBM Internship Progress Tracker',
    slug: 'ibm-internship-tracker',
    category: 'Web',
    year: '2026',
    description:
      'I kept this nine-week tracker during my IBM internship to show what I was working on, what I learned, and what shipped each week.',
    liveUrl: 'https://rohanmalhotra0.github.io/blogs/',
    repoUrl: 'https://github.com/rohanmalhotra0/blogs',
    tags: ['JavaScript', 'Dashboard', 'Documentation'],
  },
  {
    title: 'Love Island ROI Analysis',
    slug: 'love-island-roi',
    category: 'Data',
    year: '2025',
    description:
      'I compared sponsorship cost, audience size, and engagement across Love Island partnerships, then built an interactive page to show the trade-offs.',
    liveUrl: 'https://rohanmalhotra0.github.io/BAC/',
    repoUrl: 'https://github.com/rohanmalhotra0/BAC',
    tags: ['PyTorch', 'Pandas', 'Plotly', 'Jupyter'],
  },
  {
    title: 'SPY Gradient Boosting Predictor',
    slug: 'spy-gradient-boosting',
    category: 'Quant',
    year: '2025',
    description:
      'I trained a gradient-boosting model to estimate the next SPY close from EMA, RSI, MACD, and PCA-reduced features.',
    repoUrl: 'https://github.com/rohanmalhotra0/GBM-Model-Python',
    tags: ['scikit-learn', 'PCA', 'Gradient Boosting', 'yfinance'],
  },
  {
    title: 'rohan.lab Study Notebooks',
    slug: 'rohan-lab',
    category: 'Education',
    year: '2026',
    description:
      'I pulled my study tools into one place: notes, quizzes, flashcards, voice practice, and source material for everything from operating systems to German.',
    repoUrl: 'https://github.com/rohanmalhotra0/schoolwork',
    tags: ['JavaScript', 'Study Tools', 'Voice Chat'],
  },
  {
    title: 'German II Study Lab',
    slug: 'german-study-lab',
    category: 'Education',
    year: '2026',
    description:
      'I made this for German II, with flashcards, quizzes, grammar references, and practice that focuses on my weak spots.',
    repoUrl: 'https://github.com/rohanmalhotra0/german',
    tags: ['JavaScript', 'Adaptive Practice', 'Education'],
  },
  {
    title: 'Why Do Democracies Survive?',
    slug: 'democracies-survive',
    category: 'Education',
    year: '2026',
    description:
      'I turned a political-science paper into a multimedia explainer, using South Korea as the main case study.',
    repoUrl: 'https://github.com/rohanmalhotra0/Vox',
    tags: ['Multimedia', 'Research', 'Responsive Web'],
  },
  {
    title: 'IndyTrack API',
    slug: 'indytrack-api',
    category: 'Systems',
    year: '2025',
    description:
      'I built the backend for a task tracker, including users, due dates, alerts, notifications, and SQL persistence.',
    repoUrl: 'https://github.com/rohanmalhotra0/IndyTrack1',
    tags: ['Flask', 'SQLAlchemy', 'PostgreSQL', 'API'],
  },
  {
    title: 'Physics Calculator',
    slug: 'physics-calculator',
    category: 'Education',
    year: '2025',
    description:
      'I wrote a small Python calculator for kinematics and electric-field problems so I did not have to repeat the same setup by hand.',
    repoUrl: 'https://github.com/rohanmalhotra0/physicscalc',
    tags: ['Python', 'Physics', 'Utilities'],
  },
  {
    title: 'Algorithms Practice',
    slug: 'algorithms-practice',
    category: 'Education',
    year: 'Ongoing',
    description:
      'This is where I keep my ongoing LeetCode and NeetCode work as I practice data structures and algorithms.',
    repoUrl: 'https://github.com/rohanmalhotra0/leet-code-daily',
    tags: ['Algorithms', 'Data Structures', 'Practice'],
  },
];

export const skillGroups = [
  {
    label: 'Languages',
    items: ['Python', 'Java', 'C', 'C++', 'SQL', 'Groovy', 'R', 'MATLAB'],
  },
  {
    label: 'AI & data',
    items: ['PyTorch', 'YOLO11', 'OpenCV', 'XGBoost', 'LoRA', 'RAG', 'NumPy', 'Pandas', 'SciPy'],
  },
  {
    label: 'Systems & cloud',
    items: ['Linux', 'Bash', 'Docker', 'AWS', 'gRPC', 'WebSocket', 'PostgreSQL'],
  },
  {
    label: 'Financial systems',
    items: ['Oracle EPM Cloud', 'OIC', 'EPM Automate', 'Monte Carlo', 'Excel Macros'],
  },
];

/** Page sections in order; drives the navbar, command palette, and footer. */
export const sections = [
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'research', label: 'Research' },
  { id: 'about', label: 'About' },
  { id: 'education', label: 'Education' },
  { id: 'rohangpt', label: 'Chat' },
  { id: 'contact', label: 'Contact' },
];

/** Places I have worked or studied, for the hero "worked at" strip. */
export const affiliations = ['IBM', 'Kalshi', 'Virginia Tech Hume Center', 'NYU Courant'];

export const education = {
  school: 'New York University',
  college: 'Courant Institute of Mathematical Sciences',
  degree: 'B.A. Mathematics and Computer Science',
  minor: 'Double Major',
  gpa: '3.7',
  gpaScale: '4.0',
  start: '2024-08-01',
  end: '2027-05-15',
  dates: 'Aug 2024 – May 2027',
  location: 'New York, NY',
  logoUrl: assetUrl('website-photos/Work%20Logos/new_york_university_logo.jpeg'),
  accelerated: 'I’m finishing the degree in three years.',
  graduateCourse: {
    title: 'Mathematical Techniques for CS Applications',
  },
  coursework: [
    'Algorithms',
    'Operating Systems',
    'Computer Organization',
    'Data Structures',
    'Machine Learning',
    'Software Engineering',
    'Linear Algebra',
    'Probability & Statistics',
    'Real Analysis',
    'Differential Equations',
    'Numerical Methods',
  ],
};

export const formspreeUrl = 'https://formspree.io/f/xrbwdkqb';
