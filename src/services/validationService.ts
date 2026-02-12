import { BaseApiService } from "@/services/base-api-service";
import { ApiResponse } from "@/models/generics";
import type { BuySellBasic, PendingOffersForAdmin, ValidationResponse } from "src/models/responses";
import { PublicationDetailsForApprovalDTO, PublicationsForValidationDTO } from "@/models/responses/publication";

export interface ValidationActionRequest {
  action: "publish" | "reject";
  rejectionReason?: string;
}

export class ValidationService extends BaseApiService {
  constructor() {
    super("/admin/publications");
  }

  /**
   * Obtiene las publicaciones pendientes de aprobación con opciones de búsqueda, filtrado y paginación.
   * @param params - Parámetros para filtrar, buscar, ordenar y paginar las publicaciones.
   * @returns Lista paginada de publicaciones pendientes de aprobación.
   */
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

  /**
   * Obtiene los detalles completos de una publicación pendiente de aprobación.
   * @param publicationId - ID de la publicación (no usa el prefijo bs-)
   * @returns Detalles de la publicación para aprobación.
   */
  getPublicationDetailForApproval(
    publicationId: string | number
  ) {
    return this.httpClient.get<ApiResponse<PublicationDetailsForApprovalDTO>>(
      `${this.baseURL}/pending/${publicationId}`
    );
  }

  /**
   * Valida o rechaza una publicación pendiente de aprobación.
   * @param publicationId - ID de la publicación (no usa el prefijo bs-)
   * @param action - Acción a realizar ("publish" para publicar, "reject" para rechazar)
   * @returns Resultado de la operación de validación.
   */
  validatePublication(
    publicationId: number,
    action: "publish" | "reject",
    rejectionReason?: string
  ) {
    if (action === "reject" && !rejectionReason) {
      throw new Error("La razón de rechazo es obligatoria");
    }
    const endpoint = `${this.baseURL}/pending/${publicationId}/validate`;
    const payload: ValidationActionRequest = { action, ...(rejectionReason && { rejectionReason }) };
    return this.httpClient.patch<ApiResponse<ValidationResponse>>(endpoint, payload);
  }
}

export const validationService = new ValidationService();