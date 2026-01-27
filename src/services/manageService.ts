import { BaseApiService } from "@/services/base-api-service";
import { ApiResponse } from "@/models/generics";
import type { OfferDetailForAdmin, BuySellDetailForAdmin } from "src/models/responses";
import { PublicationDetailsForApprovalDTO } from "@/models/responses/publication";

export class ManageService extends BaseApiService {
  constructor() {
    super("/publications");
  }
  // lamentablemente por como esta hecha la logica del hook se tiene q utilizar el llamado con los detail
  getPublishedOffers() {
    return this.httpClient.get<ApiResponse<OfferDetailForAdmin[]>>(
      `${this.baseURL}/offers/published`
    );
  }

  getPublishedBuySells() {
    return this.httpClient.get<ApiResponse<BuySellDetailForAdmin[]>>(
        `${this.baseURL}/buysells/published`
    );
  }

  /**
   * Obtiene los detalles completos de una publicación pendiente.
   * @param publicationId - ID de la publicación (no usa el prefijo bs-)
   * @returns Detalles de la publicación para gestión.
   */
  getPublicationDetailForManagement(publicationId: number | string) {
    return this.httpClient.get<ApiResponse<PublicationDetailsForApprovalDTO>>(
      `${this.baseURL}/pending/${publicationId}`
    );
  }

  /**
   * @deprecated Usa getPublicationDetailForManagement en su lugar
   */
  getPublicationManagementDetail(typePath: "buysells" | "offers", entityId: string) {
    const endpoint = `${this.baseURL}/${typePath}/${entityId}/details`;
    return this.httpClient.get<any>(endpoint);
  }

  closePublication(typePath: "buysells" | "offers", publicationId: string) {
    const endpoint = `${this.baseURL}/${typePath}/${publicationId}/close`;
    return this.httpClient.patch<ApiResponse<string>>(endpoint, {});
  }

  getPostulants(publicationId: string) {
    const endpoint = `${this.baseURL}/offers/${publicationId}/applicants`;
    return this.httpClient.get<ApiResponse<any[]>>(endpoint);
  }

  getPostulantDetail(id: string) {
    const endpoint = `${this.baseURL}/applications/${id}/details`;
    return this.httpClient.get<ApiResponse<any[]>>(endpoint);
  }
}

export const manageService = new ManageService();