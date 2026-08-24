export interface CVVersionDTO {
  id: string;
  cvId: string;
  versionNumber: number;
  content: any;
  createdAt: string;
}

export interface CVDTO {
  id: string;
  userId: string;
  title: string;
  isDefault: boolean;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  versions?: CVVersionDTO[];
}

export interface CreateCVRequest {
  title?: string;
  content: Record<string, any>;
}

export interface SaveCVVersionRequest {
  content: Record<string, any>;
}
