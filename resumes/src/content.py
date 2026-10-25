"""All résumé text lives here. Edit this file, then run:  python3 resumes/src/build.py

Markup: wrap text in **double asterisks** to make it bold.
"""

NAME = "Rohan Malhotra"

CONTACT = [
    ("New York, NY", None),
    ("973-713-3741", "tel:+19737133741"),
    ("ram9952@nyu.edu", "mailto:ram9952@nyu.edu"),
    ("rohanm.org", "https://rohanm.org"),
    ("linkedin.com/in/rohanamal", "https://www.linkedin.com/in/rohanamal"),
    ("github.com/rohanmalhotra0", "https://github.com/rohanmalhotra0"),
]


# ---------------------------------------------------------------- builders

def entry(org, loc, *roles):
    """An employer/organization with one or more roles."""
    groups = []
    for i, (title, dates, bullets) in enumerate(roles):
        rows = [] if i else [{"left": [(org, "b")], "right": [(loc, "")]}]
        rows.append({"left": [(title, "i")], "right": [(dates, "i")]})
        groups.append({"rows": rows, "bullets": list(bullets)})
    return {"groups": groups}


def role(title, dates, *bullets):
    return (title, dates, bullets)


def project(name, tech, dates, *bullets, link=None):
    left = [(name, "b")]
    if link:
        left += [("  |  ", ""), (link, "", "https://" + link)]
    left += [("  |  ", ""), (tech, "i")]
    return {"groups": [{"rows": [{"left": left, "right": [(dates, "")]}], "bullets": list(bullets)}]}


def pub(title, who, dates, handle, *bullets):
    rows = [
        {"left": [(title, "b")], "right": [(dates, "")]},
        {"left": [(who, "i")], "right": [(handle, "i", "https://" + handle)]},
    ]
    return {"groups": [{"rows": rows, "bullets": list(bullets)}]}


def lines(*pairs):
    """Label: text lines, used for Skills."""
    return {"lines": list(pairs)}


def para(text):
    return {"para": text}


def section(title, *blocks):
    return {"title": title, "blocks": list(blocks)}


# ---------------------------------------------------------------- education

NYU = "New York University, Courant Institute of Mathematical Sciences"
DEGREE = "B.A. in Mathematics and Computer Science (Double Major)"
GPA = "**GPA:** 3.7/4.0  |  Accelerated three-year degree  |  **Graduate course:** Mathematical Techniques for CS Applications"

COURSES = {
    "quant": "Probability & Statistics, Real Analysis, Linear Algebra, Numerical Methods, Differential Equations",
    "swe": "Data Structures, Algorithms, Operating Systems, Computer Organization, Software Engineering",
    "ml": "Machine Learning, Linear Algebra, Probability & Statistics, Numerical Methods, Algorithms",
    "data": "Probability & Statistics, Machine Learning, Linear Algebra, Numerical Methods, Algorithms",
    "consulting": "Probability & Statistics, Linear Algebra, Algorithms, Machine Learning, Software Engineering",
}


def education(courses=None):
    bullets = [GPA]
    if courses:
        bullets.append("**Coursework:** " + COURSES[courses])
    return section("Education", entry(NYU, "New York, NY", role(DEGREE, "Expected May 2027", *bullets)))


# ---------------------------------------------------------------- bullet library

# IBM, Applications Developer Intern (IBM Consulting)
A_QWEN = "Fine-tuned Qwen-Coder-32B on Oracle EPM assets, raising EPM build-generation accuracy from **36.7% to 95.0%**."
A_ASSIST = "Built an on-prem EPM assistant that turns plain-language requests into reviewable JSON using RAG and MCP tools."
A_FORECAST = "Built 13-day rolling cash forecasts, SOFR loan and interest-accrual models, and close reports in Oracle EPM."
A_XGB = "Built an XGBoost cash-flow model, 13-day rolling cash forecasts, and SOFR loan models in Oracle EPM."
A_OIC = "Connected banking APIs to ERP and EPM via Oracle Integration Cloud and migrated Excel workflows to Oracle Cloud."

# IBM, Robotics Engineer Intern
R_YOLO = "Trained YOLO11 models on 898 hand-labeled images to **99.5% mAP@50** with 99.4% precision and 99.4% recall."
R_SPOT = "Connected real-time inference to the Boston Dynamics Spot SDK via OpenCV, gRPC, and lock-free inference queues."
R_DEMO = "Built an autonomous object-retrieval demo, presented it live at IBM DevCon, and open-sourced the full pipeline."
R_ADOPT = "Presented live retrieval demos at IBM DevCon; IBM sales and client-success teams adopted the demo."

# Kalshi, Quantitative Developer
K_ENGINE = "Built a C++ hedging engine that converts contract prices (cents, probability, bps) into real-time exposure."
K_KELLY = "Implemented fractional-Kelly position sizing with max-allocation caps to output recommended stake sizes."
K_WS = "Architected a WebSocket market-data pipeline ingesting quotes and trades to drive live pricing and hedge signals."
K_HAZARD = "Co-authored research modeling job-loss risk as a macro-sensitive Poisson hazard with jump-diffusion income."
K_HEDGE = "Measured tail-risk reduction from Kalshi hedges with minimum-variance hedge ratios and Monte Carlo simulation."
K_APP = "Built a Next.js/Python engine that recommends hedge size and compares cost vs. tail risk using FRED and BLS data."
K_DEPLOY = "Wrote C++ risk tools, containerized the runtime with Docker, and deployed it to Render."

# Hume Center, Aerospace Researcher
H_CUBE = "Supported design and testing of ContentCube, a CubeSat deployed from the ISS into low Earth orbit in 2025."
H_C = "Programmed imaging and signal-processing tests in C for ContentCube, a CubeSat deployed from the ISS in 2025."
H_TEST = "Engineered a test environment simulating concurrent imaging workloads to resolve race conditions and memory bugs."

# Aress Software, Machine Learning Intern
AR_TORCH = "Trained and deployed PyTorch models on **500K+ multimodal records** across Azure and AWS."
AR_NOSQL = "Designed NoSQL pipelines unifying 10+ data sources into one analytics layer; optimized SQL queries for speed."
AR_BI = "Built Power BI dashboards surfacing 20+ real-time KPIs for global operations teams; managed the JIRA workflow."

# Y-Axis Overseas Careers, Data Engineering Intern
Y_CLEAN = "Cleaned and standardized 20K+ SQL records with schema fixes and validation, cutting data-prep time by **15%**."
Y_FEAT = "Engineered 12 predictive features from dataset analysis and transformations, raising model accuracy by **10%**."
Y_EXCEL = "Built automated Excel dashboards with dynamic filtering, enabling faster eligibility reviews."

# PIVOT
PV_FOUND = "Founded and led a multi-university student research group running physics and quantitative-finance projects."
PV_TRADE = "Developed a physics-based trading model with a C++ signal engine and automated execution on a Raspberry Pi."
PV_COMBO = "Founded a multi-university research group and built its C++ signal engine with automated Raspberry Pi execution."
PV_ORG = "Ran workshops, mentorship, and project incubation across campuses on the PIVOT collaboration platform."


def ibm(*roles):
    return entry("IBM", "Dallas, TX", *roles)


def ibm_app(*b):
    return role("Applications Developer Intern, IBM Consulting", "May 2026 – Aug 2026", *b)


def ibm_robot(*b):
    return role("Robotics Engineer Intern", "Jun 2026 – Aug 2026", *b)


def kalshi(*b):
    return entry("Kalshi", "New York, NY", role("Quantitative Developer", "Jan 2026 – May 2026", *b))


def hume(*b):
    return entry("Hume Center for National Security and Technology, Virginia Tech", "Blacksburg, VA",
                 role("Aerospace Researcher", "Nov 2024 – May 2025", *b))


def aress(*b):
    return entry("Aress Software", "New York, NY", role("Machine Learning Intern", "Jun 2025 – Aug 2025", *b))


def yaxis(*b):
    return entry("Y-Axis Overseas Careers", "Chatham, NJ", role("Data Engineering Intern", "May 2024 – Aug 2024", *b))


def pivot(*b):
    return entry("PIVOT (AMP Lab)  |  vtpivot.org", "Blacksburg, VA",
                 role("Founder & Project Lead", "Feb 2024 – Dec 2025", *b))


def reddit(*b):
    return pub("Reddit Data in Quantitative Financial Models (published)", "Co-author, Virginia Tech (VTechWorks)",
               "Jan 2025 – May 2025", "hdl.handle.net/10919/124730", *b)


def kelly(*b):
    return pub("An Economic Approach to Optimize Capital Allocation (published)", "Author, Virginia Tech (VTechWorks)",
               "Aug 2024 – Dec 2024", "hdl.handle.net/10919/124871", *b)


RD_1 = "Co-authored a published paper on how r/wallstreetbets sentiment after the GameStop squeeze relates to volatility."
RD_2 = "Applied NLP sentiment scoring and regression models in Python to quantify sentiment's impact on equity returns."
KE_1 = "Applied the Kelly Criterion to capital allocation, risk of ruin, and long-run growth in investing and insurance."
KE_2 = "Ran Monte Carlo tests and backtests in Python comparing full vs. fractional Kelly under drawdowns and costs."

# Projects
def refrax(*b):
    return project("Refrax", "C++, Next.js, TypeScript, PostgreSQL", "Jun 2025 – Feb 2026", *b, link="refrax.io")


RF_1 = "Built a quantitative research and backtesting platform with 2D/3D visualization of financial data."
RF_2 = "Designed low-latency REST/WebSocket pipelines streaming market data into a PostgreSQL research environment."
RF_3 = "Implemented C++ risk engines (Greeks, P&L simulation, portfolio exposure) optimized for parallel execution."


def epm_wizard(*b):
    return project("EPM Wizard", "FastAPI, React, Groovy, Playwright", "2026", *b)


EW_1 = "Built a tool that turns plain-English requests into Oracle EPM forms and rules, with preview and approval steps."


def casen(*b):
    return project("Casen", "JavaScript, OpenAI, Supabase, Voice AI", "2026", *b, link="getcasen.com")


CA_1 = "Built a case-interview prep platform with frameworks, drills, M&A news, and voice-based AI mock interviews."


def nightshift(*b):
    return project("NightShift", "FastAPI, Playwright, Next.js, Stripe", "2026", *b)


NS_1 = "Built a platform that finds jobs, fills applications via browser automation, and verifies confirmation emails."
NS_2 = "Added scheduled runs, Stripe subscriptions, and a live dashboard with a full application log."


def greensticker(*b):
    return project("GreenSticker", "Python, OpenCV", "", *b, link="greensticker.us")


GS_1 = "Built a hands-free webcam mouse that tracks a colored sticker, with low-latency on-device processing."


def kelly_dash(*b):
    return project("Kalshi Live Kelly Dashboard", "FastAPI, WebSockets, Plotly", "2026", *b)


KD_1 = "Built a live dashboard that streams Kalshi prices over WebSockets and tests position sizes with Kelly sizing."


def options(*b):
    return project("American Options Pricing System", "Python, NumPy, Alpaca API", "", *b)


OP_1 = "Built a scheduled pipeline that pulls option data, prices American options with a binomial tree, and logs runs."


def quiz(*b):
    return project("AI Quiz Maker", "Next.js, FastAPI, OpenAI", "2026", *b)


QZ_1 = "Built an app that turns PDFs and notes into quizzes, flashcards, and recall prompts using an LLM."


def indytrack(*b):
    return project("IndyTrack API", "Flask, SQLAlchemy, PostgreSQL", "2025", *b)


IT_1 = "Built a task-tracker backend with user accounts, due dates, alerts, notifications, and SQL persistence."


def love_island(*b):
    return project("Love Island Sponsorship ROI Analysis", "Python, Pandas, Plotly", "2025", *b)


LI_1 = "Compared sponsorship cost, reach, and engagement across Love Island brand deals; built an interactive ROI page."


def spy(*b):
    return project("SPY Gradient Boosting Predictor", "scikit-learn, PCA, yfinance", "2025", *b)


SP_1 = "Trained a gradient-boosting model to predict the next SPY close from EMA, RSI, and MACD features with PCA."

INTERESTS = "Paragliding, kayaking, alpine travel, learning German, building side projects"


# ---------------------------------------------------------------- résumés

RESUMES = {}

# ===== General (LinkedIn) =====
RESUMES["General"] = [
    para("NYU Math and Computer Science double major (accelerated, May 2027) building quantitative, AI, and robotics systems: LLM tools "
         "and Spot robot vision at IBM, prediction-market risk research at Kalshi, and imaging tests for an ISS-deployed CubeSat."),
    education(),
    section("Experience",
            ibm(ibm_app(A_QWEN, A_ASSIST, A_FORECAST), ibm_robot(R_YOLO, R_SPOT, R_ADOPT)),
            kalshi(K_ENGINE, K_HAZARD, K_APP),
            hume(H_C, H_TEST),
            aress(AR_TORCH, AR_BI)),
    section("Research",
            reddit(),
            kelly()),
    section("Projects",
            refrax(RF_3),
            epm_wizard(EW_1),
            casen(CA_1),
            nightshift(NS_1)),
    section("Skills",
            lines(("Languages", "Python, C++, C, Java, SQL, TypeScript, Rust, R, MATLAB, Groovy"),
                  ("AI & Data", "PyTorch, YOLO11, OpenCV, XGBoost, scikit-learn, LoRA, RAG, MCP, NumPy, Pandas, SciPy"),
                  ("Systems", "Linux, Docker, Kubernetes, AWS, Azure, PostgreSQL, gRPC, WebSockets, React, Next.js, FastAPI"),
                  ("Finance Tools", "Oracle EPM Cloud, Oracle Integration Cloud, EPM Automate, Power BI, Excel (macros)"))),
]

# ===== Quant =====
QUANT_SKILLS = section("Skills",
    lines(("Languages", "C++, Python, C, SQL, Java, Rust, R, MATLAB"),
          ("Quant & Math", "Stochastic processes, Monte Carlo, Kelly sizing, regression, time series, options pricing"),
          ("Libraries", "NumPy, Pandas, SciPy, statsmodels, scikit-learn, XGBoost, PyTorch"),
          ("Systems", "Linux, Git, Docker, PostgreSQL, WebSockets, gRPC, multithreading, lock-free queues, AWS")))

Q_SPOT = "Built a real-time YOLO11 vision stack for Boston Dynamics Spot (99.5% mAP@50) with gRPC and lock-free queues."

RESUMES["Quant_Internship"] = [
    education("quant"),
    section("Experience",
            kalshi(K_ENGINE, K_KELLY, K_HAZARD, K_HEDGE),
            ibm(role("Applications Developer Intern & Robotics Engineer Intern", "May 2026 – Aug 2026", A_XGB, Q_SPOT)),
            hume(H_C, H_TEST)),
    section("Research",
            reddit(RD_1, RD_2),
            kelly(KE_1, KE_2)),
    section("Projects",
            refrax(RF_2, RF_3),
            kelly_dash(KD_1),
            options(OP_1)),
    section("Leadership",
            pivot(PV_FOUND, PV_TRADE)),
    QUANT_SKILLS,
]

RESUMES["Quant_FullTime"] = [
    education("quant"),
    section("Experience",
            kalshi(K_ENGINE, K_WS, K_KELLY, K_HAZARD, K_HEDGE, K_APP),
            ibm(ibm_robot("Built a real-time perception stack for Boston Dynamics Spot with gRPC, multithreading, and lock-free queues.",
                          R_YOLO),
                ibm_app(A_XGB, A_QWEN)),
            hume(H_C, H_TEST)),
    section("Research",
            reddit(RD_2),
            kelly(KE_2)),
    section("Projects",
            refrax(RF_2, RF_3),
            options(OP_1)),
    QUANT_SKILLS,
]

# ===== Software Engineering =====
SWE_SKILLS = section("Skills",
    lines(("Languages", "Python, C++, C, Java, TypeScript, JavaScript, SQL, Rust, Groovy"),
          ("Frameworks", "React, Next.js, FastAPI, Flask, Node.js, Playwright, PyTorch, OpenCV"),
          ("Infrastructure", "Linux, Git, Docker, Kubernetes, AWS, Azure, PostgreSQL, gRPC, WebSockets, REST APIs")))

S_SPOT_1 = "Built a real-time pipeline connecting YOLO11 inference to the Boston Dynamics Spot SDK via OpenCV and gRPC."
S_SPOT_2 = "Designed a multithreaded service with lock-free inference queues; demoed live retrieval at IBM DevCon."
S_SPOT_3 = "Open-sourced weights, training pipelines, and docs; IBM sales and client-success teams adopted the demo."

RESUMES["SWE_Internship"] = [
    education("swe"),
    section("Experience",
            ibm(ibm_robot(S_SPOT_1, S_SPOT_2, S_SPOT_3), ibm_app(A_ASSIST, A_OIC)),
            kalshi(K_ENGINE, K_APP, K_DEPLOY),
            hume(H_C, H_TEST),
            aress(AR_TORCH, AR_NOSQL)),
    section("Projects",
            nightshift(NS_1, NS_2),
            epm_wizard(EW_1),
            refrax(RF_2, RF_3)),
    section("Leadership",
            pivot(PV_COMBO)),
    SWE_SKILLS,
]

RESUMES["SWE_FullTime"] = [
    section("Experience",
            ibm(ibm_robot(S_SPOT_1, S_SPOT_2, S_SPOT_3), ibm_app(A_ASSIST, A_OIC, A_QWEN)),
            kalshi(K_ENGINE, K_WS, K_APP, K_DEPLOY),
            hume(H_C, H_TEST),
            aress(AR_TORCH, AR_NOSQL)),
    section("Projects",
            nightshift(NS_1, NS_2),
            refrax(RF_2, RF_3),
            epm_wizard(EW_1),
            indytrack(IT_1)),
    education("swe"),
    SWE_SKILLS,
]

# ===== AI / Machine Learning =====
ML_SKILLS = section("Skills",
    lines(("ML & AI", "PyTorch, scikit-learn, XGBoost, YOLO11, OpenCV, LLM fine-tuning, LoRA, RAG, MCP, NLP, OpenAI API"),
          ("Languages", "Python, C++, C, SQL, Java, TypeScript, R, MATLAB"),
          ("Data & Infra", "NumPy, Pandas, SciPy, Linux, Docker, AWS, Azure, PostgreSQL, gRPC, FastAPI, Next.js, Power BI")))

M_XGB = "Built an XGBoost cash-flow forecasting model and 13-day rolling cash forecasts in Oracle EPM Planning."
M_SPOT = "Ran real-time inference on Boston Dynamics Spot via OpenCV, gRPC, and lock-free queues; demoed at IBM DevCon."
M_KALSHI = "Built Poisson hazard and Monte Carlo models of job-loss risk plus a Python/Next.js hedge-sizing engine."

RESUMES["ML_Internship"] = [
    education("ml"),
    section("Experience",
            ibm(ibm_app(A_QWEN, A_ASSIST, M_XGB), ibm_robot(R_YOLO, M_SPOT)),
            aress(AR_TORCH, AR_NOSQL),
            kalshi(M_KALSHI),
            yaxis(Y_FEAT, Y_CLEAN)),
    section("Research",
            reddit(RD_2)),
    section("Projects",
            casen(CA_1),
            quiz(QZ_1),
            greensticker(GS_1),
            spy(SP_1)),
    ML_SKILLS,
]

RESUMES["ML_FullTime"] = [
    section("Experience",
            ibm(ibm_app(A_QWEN, A_ASSIST, M_XGB), ibm_robot(R_YOLO, R_SPOT, R_DEMO)),
            aress(AR_TORCH, AR_NOSQL, AR_BI),
            kalshi(M_KALSHI, K_DEPLOY),
            hume(H_C)),
    section("Projects",
            epm_wizard(EW_1),
            casen(CA_1),
            quiz(QZ_1),
            greensticker(GS_1)),
    section("Research",
            reddit(RD_2)),
    education("ml"),
    ML_SKILLS,
]

# ===== Consulting (management + technology) =====
CONSULT_SKILLS = section("Skills & Interests",
    lines(("Technical", "Excel (macros), Power BI, SQL, Python, Oracle EPM Cloud, Oracle Integration Cloud"),
          ("Interests", INTERESTS)))

C_IBM_ACC = "Raised accuracy of AI-generated Oracle EPM builds from **36.7% to 95.0%** by fine-tuning a model on past projects."
C_IBM_TREAS = "Built treasury tools for finance teams in Oracle EPM: 13-day cash forecasts, SOFR loan models, and close reports."
C_IBM_MIG = "Migrated Excel finance workflows to Oracle Cloud and connected banking APIs to ERP and EPM systems."
C_IBM_ASSIST = "Designed an AI assistant that lets finance users request EPM changes in plain language and review them first."
C_SPOT = "Built a Boston Dynamics Spot vision demo (99.4% precision) presented at IBM DevCon; adopted by IBM sales teams."
C_K_RES = "Co-authored research on hedging personal income risk with prediction markets, using FRED and BLS macro data."
C_K_TOOL = "Turned the research into a decision tool that recommends contract size and weighs cost against tail risk."
C_K_APP = "Delivered the tool as a Next.js and Python web app, containerized with Docker and deployed to Render."
C_ARESS = "Built Power BI dashboards tracking 20+ real-time KPIs for global operations by unifying 10+ data sources."
C_YAXIS = "Cut data-prep time **15%** by standardizing 20K+ records; built Excel dashboards that sped up eligibility reviews."
C_PUBS = "Published two finance papers via Virginia Tech: Reddit sentiment and volatility, and Kelly capital allocation."


def vt_research():
    return entry("Virginia Tech (VTechWorks)", "Blacksburg, VA",
                 role("Quantitative Finance Researcher", "Aug 2024 – May 2025", C_PUBS))


RESUMES["Consulting_Internship"] = [
    education("consulting"),
    section("Experience",
            ibm(ibm_app(C_IBM_ACC, C_IBM_TREAS, C_IBM_MIG, C_IBM_ASSIST), ibm_robot(C_SPOT)),
            kalshi(C_K_RES, C_K_TOOL, C_K_APP),
            hume(H_CUBE),
            aress(C_ARESS),
            yaxis(C_YAXIS)),
    section("Leadership & Projects",
            pivot(PV_FOUND, PV_ORG),
            casen(CA_1),
            love_island(LI_1),
            vt_research()),
    CONSULT_SKILLS,
]

RESUMES["Consulting_FullTime"] = [
    education("consulting"),
    section("Experience",
            ibm(ibm_app(C_IBM_ACC, C_IBM_TREAS, C_IBM_MIG, C_IBM_ASSIST), ibm_robot(C_SPOT)),
            kalshi(C_K_RES, C_K_TOOL, C_K_APP),
            hume(H_CUBE),
            aress(C_ARESS, AR_TORCH),
            yaxis(C_YAXIS, Y_FEAT)),
    section("Leadership & Projects",
            pivot(PV_FOUND, PV_ORG),
            casen(CA_1),
            love_island(LI_1),
            vt_research()),
    CONSULT_SKILLS,
]

# ===== Data Science & Analytics =====
DATA_SKILLS = section("Skills",
    lines(("Languages", "Python, SQL, R, C++, MATLAB, Java"),
          ("Data & ML", "Pandas, NumPy, SciPy, statsmodels, scikit-learn, XGBoost, PyTorch, NLP, regression, Monte Carlo"),
          ("Tools", "Power BI, Excel (macros), PostgreSQL, NoSQL, Jupyter, Plotly, AWS, Azure, Docker, Git, Oracle EPM")))

D_IBM_XGB = "Built an XGBoost cash-flow model and 13-day rolling cash forecasts in Oracle EPM Planning for finance teams."
D_IBM_MODELS = "Built SOFR loan, interest-accrual, and close-report models; piped banking API data into ERP and EPM as JSON."
D_YOLO = "Labeled 898 images and trained YOLO11 models to 99.5% mAP@50 with 99.4% precision and 99.4% recall."
D_KALSHI = "Modeled job-loss risk as a Poisson hazard on FRED and BLS data; measured hedge tail-risk cuts via Monte Carlo."

RESUMES["Data_Internship"] = [
    education("data"),
    section("Experience",
            ibm(ibm_app(D_IBM_XGB, D_IBM_MODELS, A_QWEN), ibm_robot(D_YOLO)),
            aress(AR_BI, AR_NOSQL, AR_TORCH),
            yaxis(Y_CLEAN, Y_FEAT, Y_EXCEL),
            kalshi(D_KALSHI, K_APP)),
    section("Research",
            reddit(RD_1, RD_2)),
    section("Projects",
            love_island(LI_1),
            spy(SP_1),
            refrax(RF_1, RF_2)),
    DATA_SKILLS,
]

RESUMES["Data_FullTime"] = [
    section("Experience",
            ibm(ibm_app(D_IBM_XGB, D_IBM_MODELS, A_QWEN), ibm_robot(D_YOLO)),
            kalshi(D_KALSHI, K_APP),
            aress(AR_BI, AR_NOSQL, AR_TORCH),
            yaxis(Y_CLEAN, Y_FEAT, Y_EXCEL)),
    section("Research",
            reddit(RD_2),
            kelly(KE_2)),
    section("Projects",
            love_island(LI_1),
            spy(SP_1)),
    education("data"),
    DATA_SKILLS,
]
