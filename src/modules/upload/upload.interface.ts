export interface UploadResponse {
  success: boolean;
  data?: {
    filename: string;
    url: string;
    size: number;
    mimetype: string;
  };
  error?: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  data?: Array<{
    filename: string;
    url: string;
    size: number;
    mimetype: string;
  }>;
  error?: string;
}

export interface DeleteFileDTO {
  filename: string;
}
