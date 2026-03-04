import { BaseApiService } from "./base-api-service";
import { ApiResponse } from "@/models/generics";
import api from "./Service";

import type {
  CreatePublicationData,
  CreateBuySellData,
  MyPublishedPublication,
  ApplicantResponse,
  MyBuySell,
  OfferDetail,
} from "@/models/responses";

export class AdminPublicationService extends BaseApiService {
  constructor() {
    super("/publications"); // Base URL
  }

  /**
   * Obtener todas las publicaciones que el admin puede ver
   * Endpoint: /api/publications/admin/my-published
   */
  getMyPublishedPublications() {
    return this.httpClient.get<ApiResponse<MyPublishedPublication[]>>(
      `${this.baseURL}/admin/my-published`
    );
  }

  /**
   * Obtener detalles de una publicación específica por id
   */
  getPublicationById(id: number) {
    return this.httpClient.get<ApiResponse<MyPublishedPublication>>(
      `${this.baseURL}/admin/publication/${id}`
    );
  }

  //Endpoint: /api/publications/offerent/offer/{id}
  getMyPublicationById(id: number) {
    return this.httpClient.get<ApiResponse<OfferDetail>>(
      `${this.baseURL}/offerent/offer/${id}`
    );
  }
  //Endpoint: /api/publications/offerent/buysell/{id}

  getMyBuySellById(id: number) {
    return this.httpClient.get<ApiResponse<MyBuySell>>(
      `${this.baseURL}/offerent/buysell/${id}`
    );
  }
  // =========================================================
  //  NUEVOS MÉTODOS IMPLEMENTADOS
  // =========================================================

  /**
   * Método: GetOfferApplicantsForOfferer
   * Endpoint: /api/publications/offerent/my-offer/{offerId}/applicants
   * Descripción: Lista los postulantes de una oferta específica (dueño de la oferta).
   */
  getOfferApplicantsForOfferer(offerId: number | string) {
    return this.httpClient.get<ApiResponse<any[]>>(
      `${this.baseURL}/offerent/my-offer/${offerId}/applicants`
    );
  }
  /**
   * Método: GetApplicantDetail
   * Endpoint: /api/publications/offerent/my-offer/{offerId}/applicants/{studentId}
   * Descripción: Obtiene el detalle de un postulante específico.
   */
  getApplicantDetail(offerId: number | string, studentId: number | string) {
    return this.httpClient.get<ApiResponse<any[]>>(
      `${this.baseURL}/offerent/my-offer/${offerId}/applicants/${studentId}`
    );
  }

  /**
   * Método: AcceptApplicationOfferent (Actualización por estado)
   * Endpoint: /api/publications/offerent/my-offer/applicants/{status}
   * Descripción: Actualizar estado de postulaciones según "status".
   * Nota: Como es un PATCH, se suele enviar un body con los IDs a afectar,
   * aquí pongo `data` como opcional por si el endpoint lo requiere.
   */
  updateApplicationsBatchStatus(status: string, data?: any) {
    return this.httpClient.patch<ApiResponse<any[]>>(
      `${this.baseURL}/offerent/my-offer/applicants/${status}`,
      data || {} // Enviamos objeto vacío si no hay data, necesario en axios.patch
    );
  }

  /**
   * Método: AcceptApplication
   * Endpoint: /api/publications/offerent/applications/{applicationId}/accept
   * Descripción: Acepta una postulación específica.
   */
  acceptApplication(applicationId: number | string) {
    return this.httpClient.patch<ApiResponse<any[]>>(
      `${this.baseURL}/offerent/applications/${applicationId}/accept`,
      {} // Body vacío requerido para la firma de PATCH
    );
  }
  /**
   * Rechaza una postulación específica
   * Endpoint: PATCH /api/publications/offerent/applications/{applicationId}/reject
   */
  rejectApplication(applicationId: number | string) {
    return this.httpClient.patch<ApiResponse<any>>(
      `${this.baseURL}/offerent/applications/${applicationId}/reject`,
      {} // IMPORTANTE: Body vacío requerido para la firma de PATCH
    );
  }

  /**
   * Sube una imagen y retorna la URL resultante.
   * Endpoint asumido: /publications/upload
   */
  uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file); // 'file' suele ser el nombre estándar, verifica tu backend

    return this.httpClient.post<ApiResponse<string>>(
      `${this.baseURL}/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  }
  closePublication(id: number, type: number) {
    let endpoint: string;

    // Discriminar el endpoint según el tipo de publicación
    if (type === 0 || type === 2) {
      // Oferta de Trabajo (0) o Voluntariado (2) -> offer
      endpoint = `${this.baseURL}/offerent/my-offer/${id}/close`;
    } else if (type === 1) {
      // Compra/Venta (1) -> buysell
      endpoint = `${this.baseURL}/offerent/my-buysell/${id}/close`;
    } else {
      // Manejo de tipo desconocido o inválido
      throw new Error(
        "Tipo de publicación no válido para la acción de cierre."
      );
    }

    // Realiza la petición patch al endpoint específico
    return this.httpClient.patch<ApiResponse<any>>(endpoint, {});
  }

  /**
   * Cancelar una publicación BuySell (admin)
   * Endpoint: /api/publications/my-publications/{publicationId}/cancel
   */
  cancelPublication(publicationId: number) {
    return this.httpClient.patch<ApiResponse<string>>(
      `${this.baseURL}/my-publications/${publicationId}/cancel`
    );
  }
}
export const adminPublicationService = new AdminPublicationService();
