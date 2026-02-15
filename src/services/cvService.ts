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
  async getCV(userId: string): Promise<GetCVResponse> {
    const response = await api.get<GetCVResponse>(`/user/cv/${userId}`);
    return response.data;
  },

  //DELETE /api/user/cv
  async deleteCV(): Promise<CVResponse> {
    const response = await api.delete<CVResponse>("/user/cv");
    return response.data;
  },
};