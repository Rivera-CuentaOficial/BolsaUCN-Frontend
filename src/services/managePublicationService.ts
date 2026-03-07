import { BaseApiService } from "@/services/base-api-service";
import { ApiResponse } from "@/models/generics";
import type { 
  PublicationsForAdmin,
  PublicationsForAdminSearchParams,
  PublicationDetailsForAdmin
} from "@/models/responses";
import { PublicationDetailsForApprovalDTO } from "@/models/responses/publication";

export class ManagePublicationService extends BaseApiService {
  constructor() {
    super("/admin");
  }

  /**
   * Obtiene todas las publicaciones para el admin, con filtros y paginación.
   * @param params Parámetros de búsqueda para filtrar y paginar las publicaciones.
   * @returns Una promesa que resuelve con la respuesta de la API, que incluye una lista de publicaciones para el admin y el total de publicaciones.
   */
  getAllPublicationsForAdmin(params: PublicationsForAdminSearchParams) {
    return this.httpClient.get<ApiResponse<PublicationsForAdmin>>(
      `${this.baseURL}/publications`,
      { params }
    );
  }

  /**
   * Obtiene los detalles de una publicación específica para el admin por su ID.
   * @param publicationId ID de la publicación que se desea obtener.
   * @returns Una promesa que resuelve con la respuesta de la API, que incluye los detalles de la publicación para el admin.
   */
  getPublicationDetailsByIdForAdmin(publicationId: number) {
    return this.httpClient.get<ApiResponse<PublicationDetailsForAdmin>>(
      `${this.baseURL}/publications/${publicationId}`
    );
  }

  /**
   * Cierra una publicación específica por su ID.
   * @param publicationId ID de la publicación que se desea cerrar.
   * @returns Una promesa que resuelve con la respuesta de la API, que incluye un mensaje de éxito o error.
   */
  closePublicationById(publicationId: number, closedByAdminReason: string) {
    return this.httpClient.patch<ApiResponse<string>>(
      `${this.baseURL}/publications/${publicationId}/close`,
      { closedByAdminReason }
    );
  }

  /**
   *@deprecated
   */
  getPublicationDetailForManagement(publicationId: number | string) {
    return this.httpClient.get<ApiResponse<PublicationDetailsForApprovalDTO>>(
      `${this.baseURL}/pending/${publicationId}`
    );
  }

  /**
   * @deprecated
   */
  getPublicationManagementDetail(typePath: "buysells" | "offers", entityId: string) {
    const endpoint = `${this.baseURL}/${typePath}/${entityId}/details`;
    return this.httpClient.get<any>(endpoint);
  }

  /**
    * @deprecated
   */
  closePublication(typePath: "buysells" | "offers", publicationId: string) {
    const endpoint = `${this.baseURL}/${typePath}/${publicationId}/close`;
    return this.httpClient.patch<ApiResponse<string>>(endpoint, {});
  }

  /**
   * @deprecated
   */
  getPostulants(publicationId: string) {
    const endpoint = `${this.baseURL}/offers/${publicationId}/applicants`;
    return this.httpClient.get<ApiResponse<any[]>>(endpoint);
  }

  /**
   * @deprecated
   */
  getPostulantDetail(id: string) {
    const endpoint = `${this.baseURL}/applications/${id}/details`;
    return this.httpClient.get<ApiResponse<any[]>>(endpoint);
  }
}

export const manageService = new ManagePublicationService();