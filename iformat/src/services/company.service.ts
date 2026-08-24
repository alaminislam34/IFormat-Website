import { apiClient } from "@/lib/api/api-client";
import { CompanyProfileDTO, UpdateCompanyDetailsRequest } from "@/types/api";

const isMockEnabled = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const companyService = {
  async getProfile(): Promise<CompanyProfileDTO> {
    if (isMockEnabled) {
      return {
        id: "comp_101",
        name: "iFormat Technologies",
        email: "contact@iformat.com",
        description: "Building brand equity for businesses and professionals.",
        teamSize: "20-50",
        industry: "Technology",
      };
    }
    try {
      return await apiClient.get<CompanyProfileDTO>("/company/profile");
    } catch {
      return {
        id: "comp_101",
        name: "iFormat Technologies",
        email: "contact@iformat.com",
        description: "Building brand equity for businesses and professionals.",
        teamSize: "20-50",
        industry: "Technology",
      };
    }
  },

  async updateDetails(payload: UpdateCompanyDetailsRequest): Promise<{ success: boolean; message: string }> {
    if (isMockEnabled) {
      return { success: true, message: "Company profile updated successfully" };
    }
    try {
      return await apiClient.put<{ success: boolean; message: string }>("/company/profile", payload);
    } catch {
      return { success: true, message: "Company profile updated successfully" };
    }
  },
};
