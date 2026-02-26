const BASE = import.meta.env.BASE_URL || '/';
export const assetUrl = (path) => `${BASE}${String(path || '').replace(/^\/+/, '')}`;

export const projects = [
  {
    title: 'Refrax',
    description:
      'Quantitative modeling and 2D/3D visualization platform with low-latency REST + WebSocket pipelines and a PostgreSQL-backed research engine.',
    imageUrl: assetUrl('website-photos/projectsPhotos/refrax1.png'),
    liveUrl: 'https://refrax.io',
    tags: ['C++', 'PostgreSQL', 'REST', 'WebSocket', 'Visualization'],
  },
  {
    title: 'GreenSticker',
    description:
      'Computer vision accessibility tool enabling hands-free cursor control using color tracking with low-latency, on-device processing.',
    imageUrl: assetUrl('website-photos/projectsPhotos/greensticker.png'),
    liveUrl: 'https://greensticker.us',
    tags: ['Python', 'Computer Vision', 'Accessibility'],
  },
  {
    title: 'Autism Research Tool',
    description:
      'Screening experiments and structured data collection workflow with an accessible UX designed for research reliability.',
    imageUrl: assetUrl('website-photos/projectsPhotos/autism.png'),
    liveUrl: 'https://autismtester.com',
    tags: ['Research Tooling', 'Data Collection', 'UX'],
  },
  {
    title: 'PIVOT Platform',
    description:
      'Student-led STEM research platform supporting multi-university collaboration infrastructure and scalable project coordination.',
    imageUrl: assetUrl('website-photos/projectsPhotos/pivot.png'),
    liveUrl: 'https://vtpivot.org',
    tags: ['Platform', 'Collaboration', 'Infrastructure'],
  },
  {
    title: 'Gavindle',
    description:
      'Fully functional Wordle game used by 20+ users daily. PostgreSQL and React full-stack development.',
    imageUrl: assetUrl('website-photos/projectsPhotos/Gavindle.png'),
    liveUrl: 'https://gavindle.com',
    tags: ['React', 'PostgreSQL', 'Full Stack'],
  },
  {
    title: 'Automated Raspberry Pi Binomial Options System',
    description:
      'Raspberry Pi pipeline for live data ingestion, binomial tree pricing, and automated execution with guardrails.',
    imageUrl: assetUrl('website-photos/projectsPhotos/discreteOptions.jpeg'),
    tags: ['Raspberry Pi', 'Python', 'Live Data', 'Automation'],
  },
  {
    title: 'Quantum Oscillating Stock Model',
    description:
      'Wave-based cyclical signal construction with regime detection logic and automated reporting.',
    imageUrl: assetUrl('website-photos/projectsPhotos/download.png'),
    tags: ['Time Series', 'Signals', 'Regime Detection', 'Reporting'],
  },
  {
    title: 'RSI Predictor',
    description:
      'Engineered SMA, MACD, RSI features with a Random Forest baseline and cross-validation evaluation.',
    imageUrl: assetUrl('website-photos/projectsPhotos/rsi.jpeg'),
    tags: ['Random Forest', 'Feature Engineering', 'Cross-validation'],
  },
  {
    title: 'Linear Generator',
    description:
      'Wearable Faraday-law-based energy system for harvesting power from motion with an embedded systems prototype.',
    imageUrl: assetUrl('website-photos/projectsPhotos/linear-generator-1.webp'),
    tags: ['Embedded', 'Energy Harvesting', 'Prototype'],
  },
];

export const workExperience = [
  {
    title: 'Kalshi — Quantitative Developer Intern',
    description:
      'Built a C++ prediction-market hedging engine, converted price representations (cents ↔ probability ↔ basis points), implemented Kelly-based sizing logic, and architected a real-time WebSocket data pipeline.',
    imageUrl: assetUrl('website-photos/work/kalshi_logo.jpeg'),
    imageFit: 'contain',
    tags: ['C++', 'WebSocket', 'Real-time', 'Risk'],
  },
  {
    title: 'Aress Software — Machine Learning Intern',
    description:
      'Trained PyTorch models on 500k+ multimodal records, unified 10+ data sources into an analytics layer, and designed operational dashboards.',
    imageUrl: assetUrl('website-photos/work/aress_software_logo.jpeg'),
    imageFit: 'contain',
    tags: ['PyTorch', 'Data Engineering', 'Analytics'],
  },
  {
    title: 'Hume Center — Systems Engineering Intern',
    description:
      'Built concurrent C++ imaging modules, resolved race conditions and memory safety issues, and contributed to CubeSat systems deployed to orbit.',
    imageUrl: assetUrl('website-photos/work/humecenter_logo.jpeg'),
    imageFit: 'contain',
    tags: ['C++', 'Concurrency', 'Systems'],
  },
  {
    title: 'Y-Axis — Data Engineering Intern',
    description:
      'Cleaned and standardized SQL datasets, engineered predictive features, and built automated Excel dashboards.',
    imageUrl: assetUrl('website-photos/work/y_axis_logo.jpeg'),
    imageFit: 'contain',
    tags: ['SQL', 'Feature Engineering', 'Automation'],
  },
];

export const research = [
  {
    title: 'Reddit Sentiment in Financial Markets',
    description:
      'NLP + time-series modeling with volatility analysis and regression-based evaluation pipelines.',
    imageUrl: assetUrl('website-photos/Research/RedditSetiment.png'),
    liveUrl: assetUrl('website-photos/Research/Reddit%20Data%20in%20Quantitative%20Financial%20Models%20copy.pdf'),
    tags: ['NLP', 'Time Series', 'Regression'],
  },
  {
    title: 'Capital Allocation with the Kelly Criterion',
    description:
      'Monte Carlo backtesting comparing fractional vs full Kelly and analyzing risk-adjusted growth.',
    imageUrl: assetUrl('website-photos/Research/economic.png'),
    liveUrl: assetUrl('website-photos/Research/AnEconomic%20Approachto%20OptimizeCapital%20Allocation.pdf'),
    tags: ['Monte Carlo', 'Optimization', 'Risk'],
  },
];

