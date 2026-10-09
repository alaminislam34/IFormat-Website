import { PlanDTO } from "@/types/api";
import type { PricingCardItem } from "@/features/landing/components/pricing-card";

export const DEFAULT_BRANDING_PLANS: PricingCardItem[] = [
  {
    code: "BRANDING_STARTER",
    name: "Starter",
    subtitle: "Maintain brand activity and engagement.",
    price: "$149",
    priceSuffix: "/month",
    isPopular: false,
    buttonText: "Get Started",
    features: [
      "Weekly engagement (4)",
      "Email/Whatsapp support",
      "Connections Strategy",
      "Reporting & analytics",
      "Job market advise",
    ],
  },
  {
    code: "BRANDING_GROW",
    name: "Grow",
    subtitle: "For career pivoters and specialized Brand visibility and job market alignment",
    price: "$299",
    priceSuffix: "/month",
    isPopular: false,
    buttonText: "Get Started",
    features: [
      "Weekly engagement (4)",
      "Email/Whatsapp support",
      "Connections Strategy",
      "Reporting & analytics",
      "Recruiter messaging",
      "Quarterly LinkedIn Optimization",
    ],
  },
  {
    code: "BRANDING_PROFESSIONAL",
    name: "Professional",
    subtitle: "High-touch leadership advisory & brand authority",
    price: "$449",
    priceSuffix: "/month",
    isPopular: true,
    buttonText: "Get Started",
    features: [
      "Dedicated consultant",
      "1:1 Brand Strategy",
      "Recruiter Engagement",
      "Brand Updates/Edits",
      "Interview Coaching",
      "Salary Negotiation",
    ],
  },
  {
    code: "BRANDING_ENTERPRISE",
    name: "Enterprise Solutions",
    subtitle: "Designed for career changers and niche pros to boost your brand and meet market needs",
    price: "",
    isPopular: false,
    buttonText: "Contact US",
    isContactUs: true,
    features: [
      "Outplacement Support",
      "Startup Brand Equity",
      "Stakeholder Brand Equity",
      "Investor Brand Engagement",
      "Restructuring",
      "Workforce Transitions",
    ],
  },
];

/** Feature bullets saved by admin: either a plain array or `{ features: [...] }`. */
export function getPlanFeatureList(customFeatures: unknown): string[] {
  const raw = customFeatures as any;
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.features) ? raw.features : [];
  return list.filter((f: unknown) => typeof f === "string" && f.trim() !== "");
}

export function findDbPlanFor(card: PricingCardItem, dbPlans: PlanDTO[]): PlanDTO | undefined {
  return (
    dbPlans.find((p) => p.code === card.code) ||
    dbPlans.find(
      (p) => p.code?.replace("BRANDING_", "") === card.code.replace("BRANDING_", "")
    ) ||
    dbPlans.find((p) => p.name?.toLowerCase().trim() === card.name.toLowerCase().trim())
  );
}

/**
 * Builds the pricing cards from admin-managed DB plans. Layout-only fields (button,
 * popular badge, contact-us) come from the defaults; name, description, price and
 * features come from the DB. Plans the admin deactivated are hidden. If the DB
 * returned nothing (offline), the defaults are shown as-is.
 */
export function buildBrandingPlanCards(dbPlans: PlanDTO[] | null | undefined): PricingCardItem[] {
  if (!dbPlans || dbPlans.length === 0) return DEFAULT_BRANDING_PLANS;

  const usedIds = new Set<string>();

  const cards = DEFAULT_BRANDING_PLANS.flatMap((card) => {
    const db = findDbPlanFor(card, dbPlans);
    if (db) usedIds.add(db.id);
    if (!db || db.isActive === false) return [];

    const features = getPlanFeatureList(db.customFeatures);
    return [
      {
        ...card,
        id: db.id,
        name: db.name?.trim() || card.name,
        // An empty description saved by admin means "no description"
        subtitle: db.description != null ? db.description.trim() : card.subtitle,
        price: card.isContactUs ? card.price : db.priceInCents > 0 ? `$${db.priceInCents / 100}` : card.price,
        features: features.length > 0 ? features : card.features,
      },
    ];
  });

  // Extra paid plans created by admin, shown before the Contact Us card
  const extraCards: PricingCardItem[] = dbPlans
    .filter(
      (p) => !usedIds.has(p.id) && p.isActive !== false && p.code !== "FREE_TIER" && p.priceInCents > 0
    )
    .map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      subtitle: p.description?.trim() || "",
      price: `$${p.priceInCents / 100}`,
      priceSuffix: p.billingInterval === "YEARLY" ? "/year" : "/month",
      isPopular: false,
      buttonText: "Get Started",
      features: getPlanFeatureList(p.customFeatures),
    }));

  const contactIdx = cards.findIndex((c) => c.isContactUs);
  if (contactIdx === -1) return [...cards, ...extraCards];
  return [...cards.slice(0, contactIdx), ...extraCards, ...cards.slice(contactIdx)];
}
