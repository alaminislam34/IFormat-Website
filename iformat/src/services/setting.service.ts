import { apiClient } from "@/lib/api/api-client";

export interface SystemSettingsDTO {
  AI_MODEL_PREFERENCE?: string;
  SCREENING_AUTO_RUN?: string | boolean;
  DEFAULT_MATCH_THRESHOLD?: string | number;
  [key: string]: any;
}

export const settingService = {
  /**
   * Get all system settings as key-value pairs
   */
  async getSettings(): Promise<SystemSettingsDTO> {
    return apiClient.get<SystemSettingsDTO>("/admin/settings");
  },

  /**
   * Update / upsert system settings
   */
  async updateSettings(settings: SystemSettingsDTO): Promise<SystemSettingsDTO> {
    return apiClient.patch<SystemSettingsDTO>("/admin/settings", { settings });
  },
};
