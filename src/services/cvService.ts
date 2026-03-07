import { axiosInstance } from "@/providers";
import api from "./Service";

export interface CVResponse {
  message: string;
  data: string | null;
}

interface GetCVResponse {
    message: string;
    data: GetCVDTO;
}

export interface GetCVDTO {
    url: string;
    fileSizeBytes: number;
    uploadDate: string;
}

export interface HasCVResponse {
    message: string;
    data: HasCVDTO;
}

export interface HasCVDTO {
    hasCV: boolean;
}

export interface DownloadCVResponse {
    message: string;
    data: GetCVFileDTO;
}

export interface GetCVFileDTO {
    fileName: string;
    fileContent: string; // Base64 encoded content
    contentType: string; // MIME type of the file
}

export const cvService = {
  //PATCH /api/user/cv
  async uploadCV(file: File): Promise<CVResponse> {
    const formData = new FormData();
    formData.append("CVFile", file);

    const response = await api.patch<CVResponse>("/user/cv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  //GET /api/user/cv
  /**
   * @deprecated Use downloadCV instead to get the CV file content directly.
   */
  async getCV(userId: string): Promise<GetCVResponse> {
    const response = await api.get<GetCVResponse>(`/user/cv/${userId}`);
    return response.data;
  },

  //DELETE /api/user/cv
  async deleteCV(): Promise<CVResponse> {
    const response = await api.delete<CVResponse>("/user/cv");
    return response.data;
  },

  //GET /api/user/cv
  /**
   * Checks if the user has a CV uploaded. This endpoint is used to determine whether to show the "Upload CV" or "View CV" button in the UI.
   * @returns A boolean indicating whether the user has a CV uploaded.
   */
  async hasCV(): Promise<HasCVResponse> {
    const response = await api.get<HasCVResponse>("/user/cv");
    return response.data;
  },

  //GET /api/user/cv/download
  /**
   * Downloads the user's CV file content directly. This endpoint returns the file content as a Base64 encoded string along with the file name and MIME type, allowing the frontend to handle the file download without needing to redirect to a URL.
   * @returns An object containing the file name, Base64 encoded file content, and MIME type of the CV file.
   */
  async downloadCV(): Promise<void> {
    const response = await axiosInstance.get(`/user/cv/download`, {
      responseType: 'blob', // Important: Get binary data
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CV.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};