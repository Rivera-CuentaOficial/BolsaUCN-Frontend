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
    originalFileName: string;
    url: string;
    fileSizeBytes: number;
    uploadDate: string;
}

export const cvService = {
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

  async getCV(): Promise<GetCVResponse> {
    const response = await api.get<GetCVResponse>("/user/cv");
    return response.data;
  },

  async deleteCV(): Promise<CVResponse> {
    const response = await api.delete<CVResponse>("/user/cv");
    return response.data;
  },

  downloadCV(url: string, fileName: string): void {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};