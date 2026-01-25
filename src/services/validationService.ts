import { BaseApiService } from "@/services/base-api-service";
import { ApiResponse } from "@/models/generics";
import type { BuySellBasic, PendingOffersForAdmin, ValidationResponse } from "src/models/responses";
import { PublicationsForValidationDTO } from "@/models/responses/publication";

export interface ValidationActionRequest {
  action: "publish" | "reject";
}

export class ValidationService extends BaseApiService {
  constructor() {
    super("/publications");
  }

  getPendingOffers() {
    return this.httpClient.get<ApiResponse<PendingOffersForAdmin[]>>(
      `${this.baseURL}/offers/pending`
    );
  }

  getPendingBuySells() {
    return this.httpClient.get<ApiResponse<BuySellBasic[]>>(
      `${this.baseURL}/buysells/pending`
    );
  }

  //! NEW ENDPOINT TESTING
  getPendingPublications(params?:
    {
      searchTerm?: string;
      filterBy?: string;
      sortBy?: string;
      sortOrder?: string;
      pageNumber?: number;
      pageSize?: number;
    }
  ) {
    const queryParams = new URLSearchParams();
    queryParams.append('pageNumber', String(params?.pageNumber ?? "1"));
    if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize));
    if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params?.filterBy) queryParams.append('filterBy', params.filterBy);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return this.httpClient.get<ApiResponse<PublicationsForValidationDTO>>(
      `${this.baseURL}/pending?${queryParams.toString()}`
    );
  }

  getPublicationDetail(typePath: "buysells" | "offers", entityId: string) {
    const endpoint = `${this.baseURL}/${typePath}/${entityId}/validation`;
    return this.httpClient.get<any>(endpoint);
  }

  handleValidationAction(
    typePath: "buysells" | "offers",
    entityId: string,
    action: "publish" | "reject"
  ) {
    const endpoint = `${this.baseURL}/${typePath}/${entityId}/${action}`;
    return this.httpClient.patch<ApiResponse<string>>(endpoint, {});
  }

  validatePublication(
    publicationId: number,
    action: "publish" | "reject"
  ) {
    const endpoint = `${this.baseURL}/${publicationId}/validate`;
    const payload: ValidationActionRequest = { action };
    return this.httpClient.patch<ApiResponse<ValidationResponse>>(endpoint, payload);
  }
}

export const validationService = new ValidationService();