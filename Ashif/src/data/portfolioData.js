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
    'Computer Science student and Mathematics minor at NYU Courant building production software at the intersection of financial systems, computer vision, machine learning, and real-time infrastructure.',
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
    label: 'Building in public',
    caption: 'Sharing systems and robotics work with technical audiences.',
  },
  {
    id: 'portrait',
    src: assetUrl('website-photos/me/04.jpg'),
    alt: 'Rohan Malhotra outdoors in New York',
    label: 'Based in New York',
    caption: 'Studying computer science and mathematics at NYU Courant.',
  },
  {
    id: 'team',
    src: assetUrl('website-photos/me/09.png'),
    alt: 'Rohan Malhotra with friends and collaborators',
    label: 'Team builder',
    caption: 'Most energized by ambitious, collaborative engineering teams.',
  },
  {
    id: 'headshot',
    src: assetUrl('website-photos/me/01-headshot.png'),
    alt: 'Professional headshot of Rohan Malhotra',
    label: 'Rohan Malhotra',
    caption: 'Software engineer, researcher, and builder.',
  },
];

export const workExperience = [
  {
    company: 'DRW',
    role: 'Applications Developer Intern · via IBM',
    location: 'Dallas, TX',
    date: 'May 2026 – Aug 2026',
    imageUrl: assetUrl('website-photos/work/ibm_logo.webp'),
    imageAlt: 'IBM logo',
    imageLabel: 'IBM delivery team at DRW',
    summary:
      'Shipping forecasting, cloud integration, and applied-AI systems for financial planning workflows.',
    highlights: [
      'Built rolling 13-day cash forecasts, SOFR loan calculations, interest accrual models, close reports, and an XGBoost cash-flow model in Oracle EPM Planning.',
      'Integrated banking APIs through Oracle Integration Cloud, creating JSON pipelines into ERP Financials and EPM while migrating Excel workflows to Oracle Cloud.',
      'Fine-tuned Qwen-Coder-32B on Oracle EPM implementation assets, raising form, business-rule, and report creation accuracy from 36.7% to 95.0%.',
      'Deployed an on-prem Text-to-JSON EPM assistant with RAG, MCP tools, custom agents, confidence scoring, EPM Automate, and Oracle EPM APIs.',
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
    summary:
      'Built the perception and autonomy stack for a Boston Dynamics Spot retrieval demo.',
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
    summary:
      'Turned income-risk research into a deployed prediction-market hedging product.',
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
    role: 'Systems Engineering Researcher',
    location: 'Blacksburg, VA',
    date: 'Research experience',
    imageUrl: assetUrl('website-photos/work/humecenter_logo.jpeg'),
    imageAlt: 'Hume Center for National Security and Technology logo',
    imageLabel: 'Virginia Tech Hume Center',
    summary:
      'Contributed embedded imaging and signal-processing work to a CubeSat deployed into low Earth orbit.',
    highlights: [
      'Supported the design, build, and testing of ContentCube before launch to the International Space Station.',
      'Programmed imaging and signal-processing tests in C for autonomous in-orbit photography.',
      'Worked across hardware, test, and software constraints in a mission-driven systems environment.',
    ],
    tags: ['C', 'CubeSat', 'Embedded Systems', 'Signal Processing'],
  },
  {
    company: 'Aress Software',
    role: 'Machine Learning Intern',
    location: 'Earlier experience',
    date: 'Earlier experience',
    imageUrl: assetUrl('website-photos/work/aress_software_logo.jpeg'),
    imageAlt: 'Aress Software logo',
    imageLabel: 'Aress Software',
    summary:
      'Trained multimodal models and built a unified analytics layer for operational reporting.',
    highlights: [
      'Trained PyTorch models on more than 500,000 multimodal records.',
      'Unified more than 10 source systems and translated outputs into operational dashboards.',
    ],
    tags: ['PyTorch', 'Data Engineering', 'Analytics'],
  },
  {
    company: 'Y-Axis',
    role: 'Data Engineering Intern',
    location: 'Earlier experience',
    date: 'Earlier experience',
    imageUrl: assetUrl('website-photos/work/y_axis_logo.jpeg'),
    imageAlt: 'Y-Axis Overseas Careers logo',
    imageLabel: 'Y-Axis',
    summary:
      'Standardized datasets, engineered predictive features, and automated recurring reporting.',
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
    imageAlt: 'Reddit sentiment research paper preview',
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
      'Local-first AI workspace for designing, previewing, approving, and deploying Oracle EPM implementation artifacts.',
    longDescription:
      'Combines validated structured specifications, deterministic artifact generation, approval safeguards, deployment verification, a narrated browser extension, and a fine-tuned EPM coding model.',
    imageUrl:
      'https://raw.githubusercontent.com/rohanmalhotra0/epm/main/frontend/public/og-professional.png',
    imageAlt: 'EPM Wizard product interface',
    repoUrl: 'https://github.com/rohanmalhotra0/epm',
    tags: ['FastAPI', 'React', 'IBM Carbon', 'Groovy', 'Playwright'],
    featured: true,
  },
  {
    title: 'CuriousAI',
    slug: 'curious-ai',
    category: 'AI & Systems',
    year: '2026',
    description:
      'Private personal knowledge system with citation-backed answers, confidence scoring, expert routing, and durable memory.',
    longDescription:
      'Ingests personal documents into a pgvector-backed evidence layer, then generates cited answers, mind maps, and evidence-based skill profiles through specialized expert routes.',
    imageUrl:
      'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/CuriousAi',
    imageAlt: 'CuriousAI repository preview',
    repoUrl: 'https://github.com/rohanmalhotra0/CuriousAi',
    tags: ['TypeScript', 'RAG', 'PostgreSQL', 'pgvector', 'Docker'],
    featured: true,
  },
  {
    title: 'Oracle EPM Interactive Guide',
    slug: 'epm-interactive-guide',
    category: 'Education',
    year: '2026',
    description:
      'Interactive textbook for Oracle EPM certification and consulting onboarding.',
    longDescription:
      'Includes a module atlas, Mermaid workflow maps, an approval-state simulator, glossary, command palette, and a grounded learning assistant.',
    imageUrl:
      'https://raw.githubusercontent.com/rohanmalhotra0/capstone/main/screenshots/home.png',
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
      'Consulting interview platform with 71 cases, AI voice mocks, behavioral practice, and a live job board.',
    longDescription:
      'Brings frameworks, vocabulary drills, resume-to-STAR practice, M&A news, and voice-based case simulations into one focused study system.',
    imageUrl: 'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/lab',
    imageAlt: 'Casen consulting casebook repository preview',
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
      'Automated job-application platform spanning multi-board discovery, AI form filling, verification, and tracking.',
    longDescription:
      'Coordinates Playwright browser automation, FastAPI services, scheduling, email verification, subscription management, and a Next.js control plane.',
    imageUrl:
      'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/NightShift',
    imageAlt: 'NightShift automated job platform repository preview',
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
      'Quantitative modeling and 2D/3D visualization workspace backed by low-latency REST and WebSocket pipelines.',
    longDescription:
      'A research platform for moving from market data to numerical experiments and interactive visual output without bouncing between disconnected tools.',
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
      'Real-time YOLO11 perception and autonomy stack for Boston Dynamics Spot.',
    longDescription:
      'A complete data-labeling, training, evaluation, inference, and robot-control workflow with multithreaded queues and a live autonomous retrieval demo.',
    imageUrl: assetUrl('website-photos/work/ibm_logo.webp'),
    imageAlt: 'IBM logo representing the Spot robotics project',
    repoUrl: 'https://github.com/rohanmalhotra0',
    tags: ['YOLO11', 'OpenCV', 'Spot SDK', 'gRPC'],
    featured: true,
  },
  {
    title: 'Income Risk Hedging Engine',
    slug: 'income-risk-hedging',
    category: 'Quant',
    description:
      'Full-stack simulator that recommends prediction-market hedges against job-loss tail risk.',
    longDescription:
      'Runs a hazard and Monte Carlo pipeline from user inputs, then returns suggested contract sizing, upfront cost, and before/after tail-risk comparisons.',
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
      'Hands-free cursor control using fast, on-device color tracking for accessible computer interaction.',
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
      'Accessible screening experiments and a structured data-collection workflow for reliable research.',
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
      'Multi-university STEM collaboration and project-coordination platform.',
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
      'Production Wordle-style game with a React client, PostgreSQL persistence, and daily players.',
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
      'Scheduled Alpaca option-data pipeline with American binomial-tree pricing, CSV logging, and exported tree data.',
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
      'Wave-inspired cyclical signal research with regime detection and automated reporting.',
    imageUrl: assetUrl('website-photos/projectsPhotos/download.png'),
    imageAlt: 'Oscillating stock-model visualization',
    tags: ['Time Series', 'Signals', 'Regime Detection'],
  },
  {
    title: 'RSI Predictor',
    slug: 'rsi-predictor',
    category: 'AI & Robotics',
    description:
      'Compares linear regression and Random Forest approaches for RSI prediction using market and moving-average features.',
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
      'Faraday-law energy-harvesting prototype that converts body motion into electrical power.',
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
      'Turns PDF, text, or Markdown uploads into schema-valid quizzes, flashcards, and active-recall prompts.',
    imageUrl:
      'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/ai-quiz-generator',
    imageAlt: 'AI Quiz Maker repository preview',
    repoUrl: 'https://github.com/rohanmalhotra0/ai-quiz-generator',
    tags: ['Next.js', 'FastAPI', 'OpenAI', 'PDF Extraction'],
  },
  {
    title: 'Kalshi Live Kelly Dashboard',
    slug: 'kalshi-live-kelly',
    category: 'Quant',
    year: '2026',
    description:
      'Real-time YES-price dashboard with WebSocket streaming and interactive Kelly-sizing controls.',
    imageUrl:
      'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/KalshiHedgingDashboard',
    imageAlt: 'Kalshi Live Kelly Dashboard repository preview',
    repoUrl: 'https://github.com/rohanmalhotra0/KalshiHedgingDashboard',
    tags: ['FastAPI', 'WebSocket', 'Plotly', 'Kelly Criterion'],
  },
  {
    title: 'IBM Internship Progress Tracker',
    slug: 'ibm-internship-tracker',
    category: 'Web',
    year: '2026',
    description:
      'Nine-week dashboard with manager and detailed views, workstreams, weekly outcomes, training, and reflections.',
    imageUrl: 'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/blogs',
    imageAlt: 'IBM internship tracker repository preview',
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
      'Interactive strategy deck comparing reach, engagement, cost, and modeled entertainment ROI.',
    imageUrl: 'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/BAC',
    imageAlt: 'Love Island ROI analysis repository preview',
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
      'Next-day SPY close predictor using EMA, RSI, MACD, standardization, PCA, and gradient boosting.',
    imageUrl:
      'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/GBM-Model-Python',
    imageAlt: 'SPY gradient boosting model repository preview',
    repoUrl: 'https://github.com/rohanmalhotra0/GBM-Model-Python',
    tags: ['scikit-learn', 'PCA', 'Gradient Boosting', 'yfinance'],
  },
  {
    title: 'rohan.lab Study Notebooks',
    slug: 'rohan-lab',
    category: 'Education',
    year: '2026',
    description:
      'Unified study hub for operating systems, politics, German, Oracle EPM, quizzes, flashcards, and source material.',
    imageUrl:
      'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/schoolwork',
    imageAlt: 'rohan.lab study notebooks repository preview',
    repoUrl: 'https://github.com/rohanmalhotra0/schoolwork',
    tags: ['JavaScript', 'Study Tools', 'Voice Chat'],
  },
  {
    title: 'German II Study Lab',
    slug: 'german-study-lab',
    category: 'Education',
    year: '2026',
    description:
      'Adaptive practice interface with flashcards, quizzes, grammar references, and vocabulary grids.',
    imageUrl: 'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/german',
    imageAlt: 'German II Study Lab repository preview',
    repoUrl: 'https://github.com/rohanmalhotra0/german',
    tags: ['JavaScript', 'Adaptive Practice', 'Education'],
  },
  {
    title: 'Why Do Democracies Survive?',
    slug: 'democracies-survive',
    category: 'Education',
    year: '2026',
    description:
      'Responsive multimedia political-science explainer featuring institutional analysis and a South Korea case study.',
    imageUrl: 'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/Vox',
    imageAlt: 'Why Do Democracies Survive project repository preview',
    repoUrl: 'https://github.com/rohanmalhotra0/Vox',
    tags: ['Multimedia', 'Research', 'Responsive Web'],
  },
  {
    title: 'IndyTrack API',
    slug: 'indytrack-api',
    category: 'Systems',
    year: '2025',
    description:
      'Flask API for users, tasks, due-date calculations, alerts, and notifications with SQL persistence.',
    imageUrl:
      'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/IndyTrack1',
    imageAlt: 'IndyTrack backend repository preview',
    repoUrl: 'https://github.com/rohanmalhotra0/IndyTrack1',
    tags: ['Flask', 'SQLAlchemy', 'PostgreSQL', 'API'],
  },
  {
    title: 'Physics Calculator',
    slug: 'physics-calculator',
    category: 'Education',
    year: '2025',
    description:
      'Compact Python calculator for kinematics and electric-field problem solving.',
    imageUrl:
      'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/physicscalc',
    imageAlt: 'Physics Calculator repository preview',
    repoUrl: 'https://github.com/rohanmalhotra0/physicscalc',
    tags: ['Python', 'Physics', 'Utilities'],
  },
  {
    title: 'Algorithms Practice',
    slug: 'algorithms-practice',
    category: 'Education',
    year: 'Ongoing',
    description:
      'Daily data-structures and algorithms practice tracked across LeetCode and NeetCode submissions.',
    imageUrl:
      'https://opengraph.githubassets.com/portfolio/rohanmalhotra0/leet-code-daily',
    imageAlt: 'Algorithms practice repository preview',
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
