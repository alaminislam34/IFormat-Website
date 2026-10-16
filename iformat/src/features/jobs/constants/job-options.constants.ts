export const WORK_MODES = ["Remote", "Onsite", "Hybrid"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export interface JobCategoryOption {
  name: string;
  icon: string;
}

export const JOB_CATEGORIES: readonly JobCategoryOption[] = [
  { name: "Executive Leadership & Management", icon: "👔" },
  { name: "Business, Marketing & Communications", icon: "📈" },
  { name: "Human Resources & Administration", icon: "🧑‍🤝‍🧑" },
  { name: "Finance, Banking & Investment", icon: "💰" },
  { name: "Legal, Governance, Risk & Compliance", icon: "⚖️" },
  { name: "Strategy, Consulting & Business Development", icon: "🧭" },
  { name: "Technology, Engineering, Data & AI", icon: "⚙️" },
  { name: "Project Management & Operations", icon: "🗂️" },
  { name: "Construction, Real Estate & Infrastructure", icon: "🏗️" },
  { name: "Logistics, Supply Chain & Fleet Management", icon: "🚚" },
  { name: "Energy, Manufacturing & Industrial", icon: "🏭" },
  { name: "Healthcare, Education & Life Sciences", icon: "🩺" },
  { name: "Government & Public Sector", icon: "🏛️" },
  { name: "Retail, Hospitality, Tourism & Events", icon: "🛎️" },
  { name: "Other", icon: "✨" },
];

export const DEFAULT_CATEGORY = JOB_CATEGORIES[0].name;

/** Gulf region first (primary market), then other common hiring countries. */
export const COUNTRIES: readonly string[] = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "Egypt",
  "Jordan",
  "Bangladesh",
  "India",
  "Pakistan",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "Other",
];

/** City suggestions per country; the city field still accepts any value. */
export const CITIES_BY_COUNTRY: Readonly<Record<string, readonly string[]>> = {
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam", "Khobar", "Mecca", "Medina", "NEOM", "Jubail"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"],
  Qatar: ["Doha", "Lusail", "Al Rayyan"],
  Kuwait: ["Kuwait City", "Hawalli"],
  Bahrain: ["Manama", "Muharraq"],
  Oman: ["Muscat", "Salalah", "Sohar"],
  Egypt: ["Cairo", "Alexandria", "Giza"],
  Jordan: ["Amman", "Aqaba"],
  Bangladesh: ["Dhaka", "Chattogram", "Sylhet"],
  India: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad"],
  Pakistan: ["Karachi", "Lahore", "Islamabad"],
  "United Kingdom": ["London", "Manchester", "Birmingham"],
  "United States": ["New York", "San Francisco", "Austin", "Chicago"],
  Canada: ["Toronto", "Vancouver", "Montreal"],
  Australia: ["Sydney", "Melbourne", "Brisbane"],
};
