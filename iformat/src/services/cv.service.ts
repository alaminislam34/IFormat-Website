import { apiClient } from "@/lib/api/api-client";
import { CVDTO, CVVersionDTO, CreateCVRequest, SaveCVVersionRequest } from "@/types/api";

export const cvService = {
  /**
   * List all CVs owned by the authenticated candidate
   */
  async listUserCVs(): Promise<CVDTO[]> {
    return apiClient.get<CVDTO[]>("/cv");
  },

  /**
   * Get single CV with version history
   */
  async getCVById(id: string): Promise<CVDTO> {
    return apiClient.get<CVDTO>(`/cv/${id}`);
  },

  /**
   * Create a new CV with initial version
   */
  async createCV(payload: CreateCVRequest): Promise<CVDTO> {
    return apiClient.post<CVDTO>("/cv", payload);
  },

  /**
   * Save a new version to an existing CV
   */
  async saveNewVersion(cvId: string, payload: SaveCVVersionRequest): Promise<CVVersionDTO> {
    return apiClient.post<CVVersionDTO>(`/cv/${cvId}/versions`, payload);
  },

  /**
   * Delete a CV
   */
  async deleteCV(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/cv/${id}`);
  },
};
