import { apiClient } from "@/lib/api/api-client";
import { ScreeningResultDTO } from "@/types/api";

export const screeningService = {
  /**
   * Fetch the AI screening result for a given job application
   */
  async getScreeningResult(applicationId: string): Promise<ScreeningResultDTO> {
    return apiClient.get<ScreeningResultDTO>(`/screening/${applicationId}`);
  },

  /**
   * Re-run or trigger AI candidate screening for an application
   */
  async rerunScreening(applicationId: string): Promise<ScreeningResultDTO> {
    return apiClient.post<ScreeningResultDTO>(`/screening/${applicationId}/rerun`);
  },
};
