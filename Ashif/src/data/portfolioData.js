const BASE = import.meta.env.BASE_URL || '/';

export const assetUrl = (path) =>
  `${BASE}${String(path || '').replace(/^\/+/, '')}`;

export const profile = {
  name: 'Rohan Malhotra',
  location: 'New York, NY',
  email: 'rohanm8974@gmail.com',
  website: 'https://rohanm.org',
  github: 'https://github.com/rohanmalhotra0',
  linkedin: 'https://www.linkedin.com/in/rohanamal',
  resumeUrl: assetUrl(
    'website-photos/resume/Rohan_Malhotra_Resume_2026.pdf'
  ),
  headline: 'Applied AI, quantitative systems, and robotics.',
  summary:
    'I’m a computer science student at NYU Courant. Lately I’ve been building Oracle finance tools, computer-vision systems for Boston Dynamics Spot, and quantitative research software.',
};

export const heroStats = [
  { value: '99.5%', label: 'YOLO11 mAP@50' },
  { value: '95.0%', label: 'EPM task accuracy' },
  { value: '3 years', label: 'Accelerated NYU path' },
];

export const photos = [
  {
    id: 'devcon',
    src: assetUrl('website-photos/me/01.png'),
    alt: 'Rohan Malhotra speaking with attendees at a technology event',
    label: 'IBM DevCon',
    caption: 'Talking through the Spot project after the demo.',
  },
  {
    id: 'portrait',
    src: assetUrl('website-photos/me/04.jpg'),
    alt: 'Rohan Malhotra outdoors in New York',
    label: 'New York',
    caption: 'Most days are split between NYU, projects, and the city.',
  },
  {
    id: 'team',
    src: assetUrl('website-photos/me/09.png'),
    alt: 'Rohan Malhotra with friends and collaborators',
    label: 'Good people',
    caption: 'The work is better when I get to build it with people I trust.',
  },
  {
    id: 'headshot',
    src: assetUrl('website-photos/me/01-headshot.png'),
    alt: 'Professional headshot of Rohan Malhotra',
    label: 'Me',
    caption: 'Computer science, math, robots, markets, and too many side projects.',
  },
];

export const workExperience = [
  {
    company: 'DRW',
    role: 'Applications Developer Intern · via IBM',
    location: 'Dallas, TX',
    date: 'May 2026 – Aug 2026',
    imageUrl: assetUrl('website-photos/work/drw-logo-transparent.webp'),
    imageAlt: 'DRW wordmark',
    imageLabel: 'DRW · IBM delivery team',
    logoClassName: 'h-[72px] w-auto max-w-[74%]',
    summary:
      'At DRW through IBM, I worked on Oracle EPM forecasting, cloud integrations, and an on-prem assistant for finance teams.',
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
    location: 'Dallas, TX',
    date: 'Jun 2026 – Aug 2026',
    imageUrl: assetUrl('website-photos/work/ibm_logo.webp'),
    imageAlt: 'IBM logo',
    imageLabel: 'IBM Robotics',
    logoClassName: 'h-[68px] w-auto max-w-[72%]',
    summary:
      'I trained the vision system for a Boston Dynamics Spot demo and connected real-time detection to the robot.',
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
    company: 'Hume Center',
    role: 'Aerospace Researcher',
    location: 'Blacksburg, VA',
    date: 'Research experience',
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
    company: 'Aress Software',
    role: 'Machine Learning Intern',
    location: 'Earlier experience',
    date: 'Earlier experience',
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
    company: 'Y-Axis',
    role: 'Data Engineering Intern',
    location: 'Earlier experience',
    date: 'Earlier experience',
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
    title: 'Hedging Personal Income Risk with Prediction Markets',
    eyebrow: 'Applied quantitative research',
    description:
      'A macro-sensitive Poisson hazard model with jump-diffusion income dynamics, minimum-variance hedge ratios, and Monte Carlo simulation for measuring tail-risk reduction.',
    imageUrl: assetUrl('website-photos/projectsPhotos/discreteOptions.jpeg'),
    imageAlt: 'Quantitative model visualization for prediction-market hedging',
    liveUrl: assetUrl('website-photos/Research/currentModel%20(2).pdf'),
    tags: ['Prediction Markets', 'Poisson Process', 'Monte Carlo'],
  },
  {
    title: 'Reddit Sentiment Data for Financial Applications',
    eyebrow: 'Published research',
    description:
      'NLP and regression models in Python measuring how r/wallstreetbets sentiment relates to equity returns and volatility.',
    imageUrl: assetUrl('website-photos/Research/RedditSetiment.png'),
    imageAlt: 'Reddit sentiment research paper figure',
    liveUrl: assetUrl(
      'website-photos/Research/Reddit%20Data%20in%20Quantitative%20Financial%20Models%20copy.pdf'
    ),
    externalUrl: 'https://hdl.handle.net/10919/124730',
    tags: ['NLP', 'Regression', 'Market Data'],
  },
  {
    title: 'An Economic Approach to Capital Allocation',
    eyebrow: 'Optimization research',
    description:
      'Monte Carlo backtesting of fractional and full Kelly strategies with emphasis on drawdowns, path dependence, and risk-adjusted growth.',
    imageUrl: assetUrl('website-photos/Research/economic.png'),
    imageAlt: 'Capital-allocation research visualization',
    liveUrl: assetUrl(
      'website-photos/Research/AnEconomic%20Approachto%20OptimizeCapital%20Allocation.pdf'
    ),
    tags: ['Kelly Criterion', 'Optimization', 'Risk'],
  },
];

export const projects = [
  {
    title: 'EPM Wizard',
    slug: 'epm-wizard',
    category: 'AI & Systems',
    year: '2026',
    description:
      'I built EPM Wizard so I could describe an Oracle EPM form or rule in plain English, inspect the generated artifact, and approve it before deployment.',
    longDescription:
      'I can describe what I need, preview the forms and rules it creates, approve the changes, and deploy them with checks in place.',
    imageUrl: assetUrl('website-photos/project-covers/epm-wizard.png'),
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
    imageUrl: assetUrl('website-photos/project-covers/epm-interactive-guide.png'),
    imageAlt: 'Oracle EPM interactive learning guide homepage',
    liveUrl: 'https://capstone-snowy-sigma.vercel.app',
    repoUrl: 'https://github.com/rohanmalhotra0/capstone',
    tags: ['Next.js', 'React Flow', 'Mermaid', 'OpenAI'],
    featured: true,
  },
  {
    title: 'Casen — Consulting Casebook',
    slug: 'casen',
    category: 'AI & Systems',
    year: '2026',
    description:
      'I built Casen to make case-interview prep feel less scattered by keeping cases, drills, voice practice, and job tracking in one place.',
    longDescription:
      'I use it for frameworks, vocabulary drills, behavioral stories, M&A news, and realistic voice-based mock interviews.',
    imageUrl: assetUrl('website-photos/project-covers/casen-live.png'),
    imageAlt: 'Casen consulting casebook landing page',
    liveUrl: 'https://getcasen.com',
    repoUrl: 'https://github.com/rohanmalhotra0/lab',
    tags: ['JavaScript', 'OpenAI', 'Supabase', 'Voice AI'],
    featured: true,
  },
  {
    title: 'NightShift',
    slug: 'nightshift',
    category: 'AI & Systems',
    year: '2026',
    description:
      'I built NightShift to handle the repetitive parts of applying to jobs: finding roles, filling forms, checking confirmation emails, and keeping an application log.',
    longDescription:
      'It combines browser automation, scheduling, email checks, subscriptions, and a dashboard where I can see what is happening.',
    imageUrl: assetUrl('website-photos/project-covers/nightshift-live.png'),
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
    description:
      'I built Refrax to explore market data, run models, and see the results in 2D and 3D without jumping between tools.',
    longDescription:
      'I wanted one workspace where I could pull live market data, run a numerical experiment, and inspect the result in 2D or 3D.',
    imageUrl: assetUrl('website-photos/projectsPhotos/refrax1.png'),
    imageAlt: 'Refrax quantitative visualization interface',
    liveUrl: 'https://refrax.io',
    repoUrl: 'https://github.com/rohanmalhotra0/prism-frontend',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Visualization'],
    featured: true,
  },
  {
    title: 'Spot Vision Pipeline',
    slug: 'spot-vision',
    category: 'AI & Robotics',
    description:
      'At IBM, I trained the vision system that helps a Boston Dynamics Spot robot find and retrieve objects in real time.',
    longDescription:
      'I labeled the data, trained and tested the model, connected it to the robot, and helped turn it into a live retrieval demo.',
    imageUrl: assetUrl('website-photos/project-covers/spot-vision.jpg'),
    imageAlt: 'Boston Dynamics Spot quadruped robot in motion',
    repoUrl: 'https://github.com/rohanmalhotra0',
    tags: ['YOLO11', 'OpenCV', 'Spot SDK', 'gRPC'],
    featured: true,
  },
  {
    title: 'Income Risk Hedging Engine',
    slug: 'income-risk-hedging',
    category: 'Quant',
    description:
      'I turned my Kalshi research into a simulator that shows how prediction-market contracts could hedge job-loss risk.',
    longDescription:
      'You enter a few assumptions and it compares contract sizes, upfront cost, and tail risk before and after the hedge.',
    imageUrl: assetUrl('website-photos/projectsPhotos/discreteOptions.jpeg'),
    imageAlt: 'Prediction-market hedging model visualization',
    repoUrl: 'https://github.com/rohanmalhotra0/kalshiQR',
    tags: ['Next.js', 'Python', 'C++', 'Monte Carlo'],
  },
  {
    title: 'GreenSticker',
    slug: 'greensticker',
    category: 'AI & Robotics',
    description:
      'I built a hands-free mouse that follows a colored sticker through a webcam, making basic computer control more accessible.',
    imageUrl: assetUrl('website-photos/projectsPhotos/greensticker.png'),
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
    imageUrl: assetUrl('website-photos/projectsPhotos/autism.png'),
    imageAlt: 'Autism research tool interface',
    liveUrl: 'https://autismtester.com',
    repoUrl: 'https://github.com/rohanmalhotra0/AutismResearch',
    tags: ['Research Tooling', 'Data Collection', 'UX'],
  },
  {
    title: 'PIVOT Platform',
    slug: 'pivot',
    category: 'Web',
    description:
      'I worked on PIVOT, a site where students at different universities can post STEM projects and find collaborators.',
    imageUrl: assetUrl('website-photos/projectsPhotos/pivot.png'),
    imageAlt: 'PIVOT student research platform',
    liveUrl: 'https://vtpivot.org',
    tags: ['React', 'Collaboration', 'Infrastructure'],
  },
  {
    title: 'Gavindle',
    slug: 'gavindle',
    category: 'Web',
    description:
      'I made a daily word game with streaks, stats, and a shared leaderboard because I wanted my own spin on Wordle.',
    imageUrl: assetUrl('website-photos/projectsPhotos/Gavindle.png'),
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
    imageUrl: assetUrl('website-photos/projectsPhotos/discreteOptions.jpeg'),
    imageAlt: 'Binomial options model running on a Raspberry Pi',
    repoUrl: 'https://github.com/rohanmalhotra0/Discrete-Options-System',
    tags: ['Python', 'NumPy', 'Alpaca', 'Options'],
  },
  {
    title: 'Quantum Oscillating Stock Model',
    slug: 'oscillating-stock-model',
    category: 'Quant',
    description:
      'I experimented with wave-like cycles in market data to see whether they could help identify changing regimes and recurring signals.',
    imageUrl: assetUrl('website-photos/projectsPhotos/download.png'),
    imageAlt: 'Oscillating stock-model visualization',
    tags: ['Time Series', 'Signals', 'Regime Detection'],
  },
  {
    title: 'RSI Predictor',
    slug: 'rsi-predictor',
    category: 'AI & Robotics',
    description:
      'I compared linear regression and random forests to see which one handled RSI prediction better from simple market features.',
    imageUrl: assetUrl('website-photos/projectsPhotos/rsi.jpeg'),
    imageAlt: 'RSI predictor market chart',
    repoUrl: 'https://github.com/rohanmalhotra0/rsi-random-forest',
    tags: ['Random Forest', 'Moving Averages', 'Holdout MAE'],
  },
  {
    title: 'Wearable Linear Generator',
    slug: 'linear-generator',
    category: 'Systems',
    description:
      'I built a small hardware prototype that uses Faraday’s law to turn body motion into electrical power.',
    imageUrl: assetUrl('website-photos/projectsPhotos/linear-generator-1.webp'),
    imageAlt: 'Wearable linear-generator engineering prototype',
    tags: ['Embedded Systems', 'Energy Harvesting', 'Hardware'],
  },
  {
    title: 'AI Quiz Maker',
    slug: 'ai-quiz-maker',
    category: 'AI & Systems',
    year: '2026',
    description:
      'I made this so I could drop in a PDF or notes and get a usable set of quizzes, flashcards, and recall prompts.',
    imageUrl: assetUrl('website-photos/project-covers/ai-quiz-maker.png'),
    imageAlt: 'AI Quiz Maker project image',
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
    imageUrl: assetUrl('website-photos/project-covers/kalshi-live-kelly.png'),
    imageAlt: 'Kalshi Live Kelly Dashboard project image',
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
    imageUrl: assetUrl('website-photos/project-covers/ibm-internship-tracker.png'),
    imageAlt: 'IBM internship tracker interface',
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
    imageUrl: assetUrl('website-photos/project-covers/love-island-roi.png'),
    imageAlt: 'Love Island ROI analysis slide',
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
    imageUrl: assetUrl('website-photos/project-covers/spy-gradient-boosting.png'),
    imageAlt: 'SPY gradient boosting model chart',
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
    imageUrl: assetUrl('website-photos/project-covers/rohan-lab.png'),
    imageAlt: 'rohan.lab study notebooks interface',
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
    imageUrl: assetUrl('website-photos/project-covers/german-study-lab.png'),
    imageAlt: 'German II Study Lab interface',
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
    imageUrl: assetUrl('website-photos/project-covers/democracies-survive.png'),
    imageAlt: 'Why Do Democracies Survive multimedia page',
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
    imageUrl: assetUrl('website-photos/project-covers/indytrack-api.png'),
    imageAlt: 'IndyTrack backend project image',
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
    imageUrl: assetUrl('website-photos/project-covers/physics-calculator.png'),
    imageAlt: 'Physics Calculator project image',
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
    imageUrl: assetUrl('website-photos/project-covers/algorithms-practice.png'),
    imageAlt: 'Algorithms practice project image',
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
