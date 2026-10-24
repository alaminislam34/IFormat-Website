import type { AdminUserItemDTO, UserLimitOverrides } from "@/services/admin.service";

export const LIMIT_FIELDS: {
  key: keyof UserLimitOverrides;
  label: string;
  hint: string;
  roles: string[];
}[] = [
  { key: "maxActiveJobs", label: "Active job posts", hint: "Employers", roles: ["EMPLOYER"] },
  { key: "maxApplicationsPerMonth", label: "Applications / month", hint: "Candidates", roles: ["CANDIDATE"] },
  { key: "maxAiGenerations", label: "AI generations / month", hint: "Resume, cover letter, email tools", roles: ["CANDIDATE"] },
  { key: "maxJobAnalyses", label: "Job analyses / month", hint: "AI job analyzer", roles: ["CANDIDATE"] },
];

export function limitFieldsForRole(role?: string) {
  const r = role?.toUpperCase();
  const fields = LIMIT_FIELDS.filter((f) => r && f.roles.includes(r));
  return fields.length ? fields : LIMIT_FIELDS;
}

// "" = plan default, "unlimited" = null, otherwise a number
export type LimitDraft = Record<keyof UserLimitOverrides, string>;

export function toDraft(o?: UserLimitOverrides | null): LimitDraft {
  const draft = {} as LimitDraft;
  for (const { key } of LIMIT_FIELDS) {
    const v = o?.[key];
    draft[key] = v === undefined ? "" : v === null ? "unlimited" : String(v);
  }
  return draft;
}

export function formatLimit(user: AdminUserItemDTO, key: keyof UserLimitOverrides) {
  const status = user.limits?.[key];
  if (!status) return null;
  const remaining = status.limit === null ? null : Math.max(0, status.limit - status.used);
  return { ...status, remaining };
}
