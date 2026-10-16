import { z } from "zod";

export const createJobSchema = z.object({
  title: z
    .string()
    .min(1, "Job Title is required")
    .min(3, "Title must be at least 3 characters"),
  company: z
    .string()
    .min(1, "Company Name is required")
    .min(2, "Company Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  jobType: z.enum(["Full Time", "Part Time", "Contract"]),
  workplaceType: z.enum(["Remote", "Onsite", "Hybrid"]),
  country: z.string().max(80),
  city: z.string().max(80, "City name is too long"),
  salary: z
    .string()
    .min(1, "Salary range is required")
    .refine(
      (val) => {
        const trimmed = val.trim();
        if (!trimmed) return false;
        // Accept valid negotiable / competitive keywords
        if (
          /^(competitive|negotiable|undisclosed|market rate)(\s*\/\s*(competitive|negotiable))?$/i.test(
            trimmed
          )
        ) {
          return true;
        }
        // Must contain numbers (rejects pure random text like 'sadfdsadasdsdsd')
        if (!/\d/.test(trimmed)) {
          return false;
        }
        // Must follow standard salary patterns (currency, numbers, range, period)
        const cur = "(?:[\\$€£¥৳]|C\\$|A\\$|USD|EUR|GBP|BDT|CAD|AUD|AED|SAR)?";
        const amount = "\\d[\\d,]*(?:\\.\\d+)?\\s*[kK]?";
        const pattern = new RegExp(
          `^(?:(?:from|up to)\\s+)?${cur}\\s*${amount}\\s*(?:(?:-|–|—|to)\\s*${cur}\\s*${amount})?(?:\\s*\\/\\s*(?:yr|year|mo|month|hr|hour|wk|week))?$`,
          "i"
        );
        return pattern.test(trimmed);
      },
      {
        message: "Please enter a valid salary (e.g. $80,000 - $120,000 / yr, or Negotiable)",
      }
    ),
  validity: z.string().min(1, "Job validity date is required"),
  description: z
    .string()
    .min(1, "Job description is required")
    .min(20, "Description must be at least 20 characters"),
  requirements: z.string().min(1, "Requirements are required"),
  niceToHave: z.string().optional(),
  perks: z.string().optional(),
}).refine((data) => data.workplaceType === "Remote" || data.country.trim().length > 0, {
  message: "Please select the job country",
  path: ["country"],
}).refine((data) => data.workplaceType === "Remote" || data.city.trim().length > 0, {
  message: "Please enter the job city (e.g. Riyadh)",
  path: ["city"],
});

export type CreateJobFormData = z.infer<typeof createJobSchema>;

export const applyJobSchema = z.object({
  candidateName: z.string().min(1, "Your name is required"),
  candidateEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  coverNote: z.string().optional(),
});

export type ApplyJobFormData = z.infer<typeof applyJobSchema>;
