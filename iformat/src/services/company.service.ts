import { apiClient } from "@/lib/api/api-client";
import { CompanyProfileDTO, UpdateCompanyDetailsRequest } from "@/types/api";

export const companyService = {
  /**
   * Fetch current authenticated employer's company profile
   */
  async getProfile(): Promise<CompanyProfileDTO> {
    const user = await apiClient.get<any>("/users/me");
    return {
      id: user.id,
      name: user.companyName || user.name || "",
      email: user.email || "",
      website: user.companyWebsite || "",
      description: user.companyDescription || "",
      logoUrl: user.companyLogoUrl || "",
    };
  },

  /**
   * Create or update employer's company profile
   */
  async updateDetails(payload: UpdateCompanyDetailsRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>("/users/company", {
      companyName: payload.name,
      companyWebsite: payload.website,
      companyDescription: payload.description,
      companyLogoUrl: payload.logoUrl,
    });
  },
};
