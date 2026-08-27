export interface CompanyProfileDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  logoUrl?: string;
  pitchVideoUrl?: string;
  documents?: string[];
  teamSize?: string;
  industry?: string;
  location?: string;
  website?: string;
}

export interface UpdateCompanyDetailsRequest {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  logoFile?: string | null;
  pitchVideoFile?: string | null;
  documentFiles?: string[];
}
