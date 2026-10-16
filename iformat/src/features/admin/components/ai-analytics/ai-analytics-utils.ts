export const AI_FEATURE_LABELS: Record<string, string> = {
  COVER_LETTER: "Cover Letter",
  COLD_EMAIL: "Cold Email",
  RESUME_OPTIMIZER: "Resume Optimizer",
  CV_BUILD: "CV Builder",
  PRODUCT_RECOMMEND: "Product Recommender",
  CAREER_CHAT: "Career Chat",
  JOB_ANALYSIS: "Job Fit Analyzer",
  CANDIDATE_SCREENING: "Candidate Screening",
};

export const featureLabel = (feature: string) => AI_FEATURE_LABELS[feature] ?? feature;

export const formatNumber = (value: number) => value.toLocaleString("en-US");

export const formatTokens = (value: number) =>
  value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(2)}M`
    : value >= 1_000
    ? `${(value / 1_000).toFixed(1)}k`
    : String(value);

export const formatUsd = (value: number | null) =>
  value === null ? "-" : `$${value >= 0.01 || value === 0 ? value.toFixed(2) : value.toFixed(4)}`;

export const formatLatency = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`);
