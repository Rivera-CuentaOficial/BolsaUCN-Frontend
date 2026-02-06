import { BaseApiService } from "./base-api-service";
import { ApiResponse } from "@/models/generics";

import type {
  CreatePublicationData,
  CreateBuySellData,
  MyPublishedPublication,
  ApplicantResponse,
  MyBuySell,
  OfferDetail,
  MyPublicationsResponse,
  MyPublicationsSearchParams
} from "src/models/responses";
import type { OffererPublication } from "src/models/generics";
import { MyPublicationDetails } from "@/models/responses/publication";

export class OffererPublicationService extends BaseApiService {
  constructor() {
    super("/publications");
  }

  create(data: CreatePublicationData) {
    return this.httpClient.post<ApiResponse<OffererPublication>>(
      `${this.baseURL}/offers`,
      data
    );
  }
  createBuySell(data: CreateBuySellData) {
    return this.httpClient.post<ApiResponse<OffererPublication>>(
      `${this.baseURL}/buysells`,
      data
    );
  }
  getMyPublications(params?: MyPublicationsSearchParams) {
    return this.httpClient.get<ApiResponse<MyPublicationsResponse>>(
      `${this.baseURL}/my-publications`,
      { params }
    );
  }
  getMyPublicationDetails(publicationId: number) {
    return this.httpClient.get<ApiResponse<MyPublicationDetails>>(
      `${this.baseURL}/my-publications/${publicationId}`
    );  
  }
  updateApplicationStatus(applicationId: number, offerId: number, newStatus: "Aceptada" | "Rechazada") {
    return this.httpClient.patch<ApiResponse<boolean>>(
      `${this.baseURL}/my-publications/${offerId}/applications/${applicationId}/update-status`,
      { newStatus }
    );
  }

  /**
  * @deprecated Use getMyPublications instead
  */
  getMyPublishedPublications() {
    return this.httpClient.get<ApiResponse<MyPublishedPublication[]>>(
      `${this.baseURL}/offerent/my-published`
    );
  }

  /**
  * @deprecated Use getMyPublications instead
  */
  getMyRejectedPublications() {
    return this.httpClient.get<ApiResponse<MyPublishedPublication[]>>(
      `${this.baseURL}/offerent/my-rejected`
    );
  }

  /**
  * @deprecated Use getMyPublications instead
  */
  getPMyPendingPublications() {
    return this.httpClient.get<ApiResponse<MyPublishedPublication[]>>(
      `${this.baseURL}/offerent/my-pending`
    );
  }

  /**
   * @deprecated Use getMyPublicationDetails instead
   */
  //Endpoint: /api/publications/offerent/offer/{id}
  getMyPublicationById(id: number) {
    return this.httpClient.get<ApiResponse<OfferDetail>>(
      `${this.baseURL}/offerent/offer/${id}`
    );
  }
  //Endpoint: /api/publications/offerent/buysell/{id}
  /**
   * @deprecated Use getMyPublicationDetails instead
   */
  getMyBullSellById(id: number) {
    return this.httpClient.get<ApiResponse<MyBuySell>>(
      `${this.baseURL}/offerent/buysell/${id}`
    );
  }
  // =========================================================
  //  NUEVOS MÉTODOS IMPLEMENTADOS
  // =========================================================

  /**
   * @deprecated Use getApplicationsByOfferId instead
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
   * @deprecated Use getApplicationsByOfferId instead
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
   * @deprecated Use updateApplicationsStatus instead
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
   * @deprecated Use updateApplicationsStatus instead
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
   * @deprecated Use updateApplicationsStatus instead
   * Método: RejectApplication
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
   * Apela una publicación rechazada enviando una justificación
   * Endpoint: POST /api/publications/{id}/appeal
   */
  appealPublication(id: number | string, justification: string) {
    // Asumimos que el backend espera un JSON { "justification": "texto..." }
    // Si el backend espera otro nombre de campo (ej: "reason"), cámbialo aquí.
    const body = { justification: justification };

    return this.httpClient.post<ApiResponse<any>>(
      `${this.baseURL}/${id}/appeal`,
      body
    );
  }

  /**
   * @deprecated EL nuevo flujo esta corresponde solo a Compra/Venta (crear y editar)
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
  closePublication(id: number, type: number){
    let endpoint: string;

    // Discriminar el endpoint según el tipo de publicación
    if (type === 0 || type === 2) {
        // Oferta de Trabajo (0) o Voluntariado (2) -> offer
        endpoint = `${this.baseURL}/offerent/my-offer/${id}/close`;
    }
    else if (type === 1) {
        // Compra/Venta (1) -> buysell
        endpoint = `${this.baseURL}/offerent/my-buysell/${id}/close`;
    } else {
        // Manejo de tipo desconocido o inválido
        throw new Error("Tipo de publicación no válido para la acción de cierre.");
    }

    // Realiza la petición patch al endpoint específico
    return this.httpClient.patch<ApiResponse<any>>(endpoint, {});
};


}

export const offererPublicationService = new OffererPublicationService();
