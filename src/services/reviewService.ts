import { BaseApiService } from "./base-api-service";
import { ApiResponse } from "@/models/generics";

import type {
  MyReviewsDTO,
  MyReviewDetailsDTO,
  ApplicantReviewForOfferorDTO,
  OfferorReviewForApplicantDTO,
  MyReviewsSearchParamsDTO,
  GetReviewsDTO,
  GetReviewDetailsDTO,
  HideReviewInfoDTO
} from "@/models/responses";

export class ReviewService extends BaseApiService {
  constructor() {
    super("/reviews");
  }

  async getMyReviews(params?: MyReviewsSearchParamsDTO): Promise<MyReviewsDTO> {
    const response = await this.httpClient.get<ApiResponse<MyReviewsDTO>>(
      this.baseURL,
      { params }
    );
    return response.data.data;
  }

  async getMyReviewDetails(reviewId: number): Promise<MyReviewDetailsDTO> {
    const response = await this.httpClient.get<ApiResponse<MyReviewDetailsDTO>>(
      `${this.baseURL}/${reviewId}`
    );
    return response.data.data;
  }

  async submitApplicantReview(reviewId: number, reviewData: ApplicantReviewForOfferorDTO): Promise<string> {
    const response = await this.httpClient.patch<ApiResponse<string>>(
      `${this.baseURL}/${reviewId}/applicant`,
      reviewData
    );
    return response.data.data;
  }

  async submitOfferorReview(reviewId: number, reviewData: OfferorReviewForApplicantDTO): Promise<string> {
    const response = await this.httpClient.patch<ApiResponse<string>>(
      `${this.baseURL}/${reviewId}/offeror`,
      reviewData
    );
    return response.data.data;
  }

  async getAdminReviews(params?: MyReviewsSearchParamsDTO): Promise<GetReviewsDTO> {
    const response = await this.httpClient.get<ApiResponse<GetReviewsDTO>>(
      `admin${this.baseURL}`,
      { params }
    );
    return response.data.data;
  }

  async getAdminReviewDetails(reviewId: number): Promise<GetReviewDetailsDTO> {
    const response = await this.httpClient.get<ApiResponse<GetReviewDetailsDTO>>(
      `admin${this.baseURL}/${reviewId}`
    );
    return response.data.data;
  }

  async hideReviewInfo(reviewId: number, hideData: HideReviewInfoDTO): Promise<string> {
    const response = await this.httpClient.patch<ApiResponse<string>>(
      `admin${this.baseURL}/${reviewId}/hide`,
      hideData
    );
    return response.data.data;
  }

  async downloadMyReviewsPdf(): Promise<Blob> {
    const response = await this.httpClient.get(`${this.baseURL}/pdf`, { responseType: 'blob' });
    return response.data;
  }

  async downloadUserReviewsPdf(userId: number): Promise<Blob> {
    const response = await this.httpClient.get(`admin${this.baseURL}/pdf/${userId}`, { responseType: 'blob' });
    return response.data;
  }

  async downloadSystemReviewsPdf(): Promise<Blob> {
    const response = await this.httpClient.get(`admin${this.baseURL}/pdf`, { responseType: 'blob' });
    return response.data;
  }
}

export const reviewService = new ReviewService();
