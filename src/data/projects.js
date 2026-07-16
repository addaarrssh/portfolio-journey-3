// Real projects only — sourced from the author's own portfolio notes and resume.
// year is only set where a real date is known (resume-confirmed); otherwise null.

export const CATEGORIES = {
  ALL: "all",
  AI_ML: "ai-ml",
  AUTOMATION: "automation",
  LEARNING: "learning",
};

export const CATEGORY_LABELS = {
  [CATEGORIES.ALL]: "All Projects",
  [CATEGORIES.AI_ML]: "AI, ML & Data Science",
  [CATEGORIES.AUTOMATION]: "Analytics & Automation",
  [CATEGORIES.LEARNING]: "Learning & Portfolio",
};

export const projects = [
  // --- AI, Machine Learning & Data Science ---
  {
    id: "railcross",
    category: CATEGORIES.AI_ML,
    title: "RailCross — Railway Crossing Delay Assistant",
    repo: "https://github.com/addaarrssh/railcross-ai",
    liveUrl: null,
    year: null,
    description:
      "Predicts likely railway-level-crossing delays (OPEN / CLOSED / uncertainty-aware UNKNOWN) from traffic and stopped-time signals, shown on an interactive map. Uses a Histogram Gradient Boosting classifier with an abstention band, a synthetic crossing-event simulator with congestion hard negatives, route comparison, and crowdsourced gate-state reports. Evaluated on crossings held out entirely from training. Public demo uses synthetic data — no live gate-status claim.",
    tech: ["Python", "scikit-learn", "TypeScript", "React", "Mapping APIs", "SQLite/D1"],
  },
  {
    id: "energyshield-ai",
    category: CATEGORIES.AI_ML,
    title: "EnergyShield AI — Energy Supply-Chain Resilience Optimizer",
    repo: "https://github.com/addaarrssh/energyshield-ai",
    liveUrl: null,
    year: null,
    description:
      "Hackathon MVP modeling a Strait of Hormuz crude-oil shock affecting Indian refineries. Uses linear programming to optimize alternative crude sourcing and strategic reserve releases, projects downstream fuel-price and inflation effects, and presents a geospatial supply-twin map with a ranked action plan and evidence ledger.",
    tech: ["TypeScript", "React", "Vite", "FastAPI", "Python", "PuLP/CBC", "Pydantic"],
  },
  {
    id: "ai-study-buddy",
    category: CATEGORIES.AI_ML,
    title: "AI Study Buddy — Exam-Focused RAG Assistant",
    repo: "https://github.com/addaarrssh/exam-studdybuddy",
    liveUrl: null,
    year: 2026,
    description:
      "RAG application that turns handwritten and typed notes into a searchable knowledge base for exam prep. Vision-LLM text extraction, chunking, embeddings, and FAISS retrieval feed grounded question answering, plus previous-year-question analysis to generate revision packs and likely exam questions.",
    tech: ["Python", "Streamlit", "Groq API", "RAG", "FAISS", "sentence-transformers", "PyMuPDF"],
  },
  {
    id: "search-ranking-model",
    category: CATEGORIES.AI_ML,
    title: "Search Ranking Model",
    repo: "https://github.com/addaarrssh/search-ranking-model",
    liveUrl: null,
    year: null,
    description:
      "Learning-to-rank in two stages: a controlled synthetic search pipeline and a real model trained on the MSLR-WEB10K benchmark. Engineers BM25, TF-IDF, freshness, and popularity features and trains an XGBoost Ranker, evaluated with NDCG@10 and MRR rather than accuracy. Synthetic NDCG@10 0.9898 vs. BM25 baseline 0.8699; real MSLR sample NDCG@10 0.5581, MRR 0.8516.",
    tech: ["Python", "XGBoost", "BM25", "TF-IDF", "Information Retrieval"],
  },
  {
    id: "catch-the-liar",
    category: CATEGORIES.AI_ML,
    title: "Catch the Liar — Hallucination Detection in AI Text",
    repo: "https://github.com/addaarrssh/ai-ml-hacakathon",
    liveUrl: null,
    year: null,
    description:
      "XAVENIR 2026 AI/ML challenge solution: given two summaries, determines which is more likely hallucinated. Deliberately avoids pretrained backbones/embeddings, using features and vectorizers trained only on competition data, with structured scripts for feature engineering, training, and submission generation.",
    tech: ["Python", "pandas", "scikit-learn", "Custom text features"],
  },
  {
    id: "ipl-2026-prediction",
    category: CATEGORIES.AI_ML,
    title: "IPL 2026 Winner Prediction",
    repo: "https://github.com/addaarrssh/ipl-2026-winner-prediction",
    liveUrl: null,
    year: 2026,
    description:
      "End-to-end cricket analytics: trains a match-winner model with XGBoost on historical and ball-by-ball IPL data, engineers recent-form/head-to-head/venue features, integrates live Cricsheet and Cricbuzz data, and simulates remaining fixtures and playoffs to estimate championship probabilities in a public Streamlit dashboard.",
    tech: ["Python", "pandas", "scikit-learn", "XGBoost", "Streamlit", "Web Scraping"],
  },
  {
    id: "m5-walmart-forecasting",
    category: CATEGORIES.AI_ML,
    title: "M5 Walmart Sales Forecasting",
    repo: "https://github.com/addaarrssh/m5-walmart-sales-forecasting",
    liveUrl: null,
    year: null,
    description:
      "Kaggle M5 Forecasting project predicting daily Walmart sales from demand history, calendar events, and prices. Engineers lag/rolling-window/calendar/price features, compares Prophet, XGBoost, and a sequence-style baseline on time-ordered splits, and explicitly guards against time-series leakage.",
    tech: ["Python", "pandas", "Prophet", "XGBoost", "Time-Series Forecasting"],
  },
  {
    id: "customer-churn-prediction",
    category: CATEGORIES.AI_ML,
    title: "Customer Churn Prediction",
    repo: "https://github.com/addaarrssh/customer-churn-prediction",
    liveUrl: null,
    year: 2026,
    description:
      "Telecom churn prediction on the IBM Telco dataset (7,032 records): cleaning, EDA, a reusable Pipeline/ColumnTransformer preprocessing workflow, and a comparison of Logistic Regression vs. XGBoost. Deployed Logistic Regression pipeline reaches ~0.80 accuracy and 0.84 ROC-AUC in a Streamlit app with an adjustable decision threshold.",
    tech: ["Python", "pandas", "scikit-learn", "XGBoost", "Streamlit"],
  },
  {
    id: "titanic-survival-prediction",
    category: CATEGORIES.AI_ML,
    title: "Titanic Survival Prediction",
    repo: "https://github.com/addaarrssh/titanic-survival-prediction",
    liveUrl: null,
    year: null,
    description:
      "Kaggle Titanic classification combining EDA, engineered title/family-size/age-band/fare-band features, an end-to-end scikit-learn pipeline with XGBoost. Achieved 0.829 cross-validation accuracy and a 0.76794 public leaderboard score.",
    tech: ["Python", "pandas", "scikit-learn", "XGBoost"],
  },
  {
    id: "spaceship-titanic",
    category: CATEGORIES.AI_ML,
    title: "Spaceship Titanic — Kaggle Classification",
    repo: "https://github.com/addaarrssh/spaceship-titanic",
    liveUrl: null,
    year: null,
    description:
      "Kaggle Spaceship Titanic competition entry predicting whether a passenger was transported to another dimension. Scored 0.79775 on both the public and private leaderboards.",
    tech: ["Python", "Jupyter Notebook", "Kaggle"],
  },
  {
    id: "house-price-regression",
    category: CATEGORIES.AI_ML,
    title: "Bengaluru House Price Regression",
    repo: "https://github.com/addaarrssh/house-price-regression",
    liveUrl: null,
    year: null,
    description:
      "Regression project cleaning messy Bengaluru real-estate data (size/sqft fields, rare locations, outliers) and modeling price from area, BHK, bathrooms, and location. Covers linear/multiple regression, one-hot encoding, and residual analysis. Final result: MAE 18.96, RMSE 33.82, R² 0.828.",
    tech: ["Python", "pandas", "scikit-learn", "Linear Regression"],
  },
  {
    id: "stock-anomaly-detector",
    category: CATEGORIES.AI_ML,
    title: "Stock Anomaly Detector",
    repo: "https://github.com/addaarrssh/stock-anomaly-detector",
    liveUrl: null,
    year: 2026,
    description:
      "Streamlit app flagging unusual price/volume activity in NSE-listed stocks using Isolation Forest on up to three years of OHLCV data via yfinance. Engineers return, volume-ratio, and intraday-range signals and validates anomalies against known Reliance Industries events. Live deployment available.",
    tech: ["Python", "yfinance", "pandas", "scikit-learn", "Streamlit"],
  },

  // --- Analytics, Automation & Product Workflows ---
  {
    id: "olist-sql-analytics",
    category: CATEGORIES.AUTOMATION,
    title: "Olist E-Commerce SQL Analytics",
    repo: "https://github.com/addaarrssh/olist-sql-commerce-analytics",
    liveUrl: null,
    year: null,
    description:
      "End-to-end PostgreSQL analysis of Brazil's Olist marketplace: a relational model across customers, orders, products, sellers, and reviews, with joins, CTEs, views, and window functions. Finds São Paulo as the largest market by delivered-order GMV, Health & Beauty as the top category, and quantifies the late-delivery / satisfaction relationship.",
    tech: ["PostgreSQL", "Supabase", "SQL", "Data Modelling", "Window Functions"],
  },
  {
    id: "cartpulse",
    category: CATEGORIES.AUTOMATION,
    title: "CartPulse — AI Revenue Recovery Workflow",
    repo: "https://github.com/addaarrssh/cartpulse-n8n",
    liveUrl: null,
    year: null,
    description:
      "Simulation-first, AI-assisted abandoned-cart recovery workflow for D2C brands. A Gatekeeper Agent blocks unsafe outreach before a personalized message is even generated; scores replies and picks the next best action, with a compliance audit, A/B-test attribution, and revenue estimates — no real credentials or live messaging.",
    tech: ["n8n", "JavaScript", "Workflow Automation", "Decision Logic"],
  },
  {
    id: "company-news-tracker",
    category: CATEGORIES.AUTOMATION,
    title: "Company News Intelligence System",
    repo: "https://github.com/addaarrssh/company-news-tracker-n8n",
    liveUrl: null,
    year: null,
    description:
      "Automated monitoring for OpenAI, Reliance Industries, and Tata Group: collects RSS/Google News feeds, deduplicates within and across runs, applies weighted importance scoring, and routes concise briefings and on-demand queries through a Telegram bot with seven commands.",
    tech: ["n8n", "Google Sheets", "Telegram Bot API", "JavaScript"],
  },
  {
    id: "cricbuzz-livestats",
    category: CATEGORIES.AUTOMATION,
    title: "Cricbuzz LiveStats — Cricket Analytics Dashboard",
    repo: "https://github.com/addaarrssh/Cricbuzz-LiveStats",
    liveUrl: null,
    year: null,
    description:
      "Streamlit cricket dashboard with a live-match center (API fallback), IPL scorecard lookup, player leaderboards, 25 ready-made SQL analytics queries, and a CRUD interface for player data. Auto-generates a SQLite database from local CSVs so it stays usable without API access.",
    tech: ["Python", "Streamlit", "SQLite", "SQL"],
  },
  {
    id: "whatsapp-chat-viewer",
    category: CATEGORIES.AUTOMATION,
    title: "WhatsApp Chat Viewer",
    repo: "https://github.com/addaarrssh/whatsapp-chat-viewer",
    liveUrl: null,
    year: null,
    description:
      "Privacy-first browser app that turns an exported WhatsApp chat ZIP into a readable, WhatsApp-style conversation — bubbles, dates, senders, attachments, search — entirely client-side with no backend or upload step.",
    tech: ["HTML", "CSS", "JavaScript", "JSZip"],
  },
  {
    id: "daily-tracker",
    category: CATEGORIES.AUTOMATION,
    title: "Daily Tracker",
    repo: "https://github.com/addaarrssh/daily-tracker",
    liveUrl: null,
    year: null,
    description:
      "A JavaScript daily-tracking application — early product-development work on an interactive personal tracking interface.",
    tech: ["JavaScript"],
  },
  {
    id: "expense-tracker",
    category: CATEGORIES.AUTOMATION,
    title: "Expense Tracker",
    repo: "https://github.com/addaarrssh/expense-tracker",
    liveUrl: null,
    year: null,
    description:
      "A JavaScript expense-tracking application — early hands-on work building an interactive personal-finance interface.",
    tech: ["JavaScript"],
  },
  {
    id: "swiggy-instamart-submission",
    category: CATEGORIES.AUTOMATION,
    title: "Swiggy Instamart Competition Submission",
    repo: "https://github.com/addaarrssh/swiggy-instamart-competition-submission",
    liveUrl: null,
    year: null,
    description:
      "Competition submission for a Swiggy Instamart challenge. Undocumented in the public repo — described here only as a competition submission pending a full write-up.",
    tech: ["Python"],
  },

  // --- Learning & Portfolio Repositories ---
  {
    id: "data-analytics-portfolio",
    category: CATEGORIES.LEARNING,
    title: "Data Analytics Portfolio",
    repo: "https://github.com/addaarrssh/data-analytics-portfolio",
    liveUrl: null,
    year: null,
    description:
      "A collection repository of hands-on analytics and data-science practice — exploratory analysis, machine learning, and portfolio-building work in progress.",
    tech: ["Python", "Data Analytics"],
  },
  {
    id: "learning-web-dev",
    category: CATEGORIES.LEARNING,
    title: "Learning Web Development",
    repo: "https://github.com/addaarrssh/learning-web-dev",
    liveUrl: null,
    year: null,
    description:
      "A learning repository documenting practice with core web-development concepts — the progression from foundational HTML/CSS toward interactive JavaScript.",
    tech: ["HTML", "CSS", "JavaScript"],
  },
  {
    id: "github-profile",
    category: CATEGORIES.LEARNING,
    title: "GitHub Profile README",
    repo: "https://github.com/addaarrssh/addaarrssh",
    liveUrl: null,
    year: null,
    description:
      "Profile README presenting background as a Data Science and ML student and listing the current technical stack — Python, Streamlit, SQLite, scikit-learn, pandas, NumPy, PyTorch, and related tools.",
    tech: ["Markdown"],
  },
];

export const featuredProjectIds = [
  "railcross",
  "energyshield-ai",
  "ai-study-buddy",
  "search-ranking-model",
  "cartpulse",
  "customer-churn-prediction",
];
