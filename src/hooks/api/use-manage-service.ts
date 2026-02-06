import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  mapOfferToManage,
  mapBuySellToManage,
  handleApiError,
  mapBuySellToDetail,
  mapOfferToDetail,
  mapApplicantToView,
  getUserFromToken,
} from "@/lib";
import { manageService } from "@/services/manageService";
import {
  PublishedItem,
  OfferDetailForAdmin,
  BuySellDetailForAdmin,
  AdminDetail,
  ApplicantResponse,
} from "@/models/responses";
import { ClosePublicationVariables } from "@/models/requests";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { offererPublicationService } from "@/services/offererPublicationService";
import { mapPublicationDetailsToAdminDetail } from "@/lib/publication";

// centraliza la lógica para obtener publicaciones publicadas (ofertas y compras/ventas)

export const useGetPublishedPublications = () => {
  return useQuery<PublishedItem[], Error>({
    queryKey: ["admin", "manage", "published"],
    queryFn: async () => {
      try {
        const [offersRes, buysellsRes] = await Promise.all([
          manageService.getPublishedOffers(),
          manageService.getPublishedBuySells(),
        ]);
        const offersData: OfferDetailForAdmin[] = offersRes.data.data || [];
        const buysellsData: BuySellDetailForAdmin[] =
          buysellsRes.data.data || [];
        const mappedOffers = offersData
          .filter((o) => o && o.id)
          .map((o) => mapOfferToManage(o));
        const mappedBuys = buysellsData
          .filter((b) => b && b.id)
          .map((b) => mapBuySellToManage(b));
        return [...mappedOffers, ...mappedBuys];
      } catch (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.details || apiError.message);
      }
    },
    initialData: [],
  });
};

export const useGetAdminPublicationManagementDetailQuery = (
  id: string | undefined
) => {
  return useQuery<AdminDetail, Error>({
    queryKey: ["admin", "publication", id],
    queryFn: async () => {
      if (!id || id === "undefined")
        throw new Error("ID de publicación no válido.");

      const isBuySellPrefixed = id.startsWith("bs-");
      const entityId = isBuySellPrefixed ? id.split("-")[1] : id;

      const response = await manageService.getPublicationDetailForManagement(
        entityId
      );
      const detailDto = response.data?.data ?? response.data;

      if (!detailDto)
        throw new Error("Respuesta de API vacía o malformada.");

      return mapPublicationDetailsToAdminDetail(detailDto);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useClosePublicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, ClosePublicationVariables, void>({
    mutationFn: ({ id, typePath }) => {
      const entityId = id.startsWith("bs-") ? id.split("-")[1] : id;
      return manageService.closePublication(typePath, entityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "manage", "published"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "publication"] });
    },
  });
};

export const useGetPostulantsQuery = (publicationId: string | undefined) => {
  return useQuery<any[], Error>({
    queryKey: ["admin", "postulants", publicationId],
    queryFn: async () => {
      if (!publicationId) throw new Error("ID de publicación es requerido.");
      const response = await manageService.getPostulants(publicationId);
      const rawApplicants = response.data.data || [];
      return rawApplicants.map((app) => mapApplicantToView(app));
    },
    enabled: !!publicationId,
  });
};

export const useGetPostulantDetailQuery = (id: string | undefined) => {
  return useQuery<any, Error>({
    queryKey: ["admin", "postulantDetail", id],
    queryFn: async () => {
      if (!id) throw new Error("ID de postulante es requerido.");
      const response = await manageService.getPostulantDetail(id);
      return response.data.data;
    },
  });
};

export const useStudentsGetPostulantDetailQuery = (
  offerId: string | number | undefined,
  applicantId: string | number | undefined
) => {
  return useQuery<any, Error>({
    queryKey: ["applicant", "postulantDetail", offerId, applicantId],
    queryFn: async () => {
      if (!offerId || !applicantId)
        throw new Error("Faltan identificadores requeridos.");
      const response = await offererPublicationService.getApplicantDetail(
        offerId,
        applicantId
      );
      return response.data.data;
    },
    enabled: !!offerId && !!applicantId,
  });
};

export const useOffererGetPostulantDetailQuery = (
  offerId: string | number | undefined,
  applicantId: string | number | undefined
) => {
  return useQuery<any, Error>({
    queryKey: ["offerer", "postulantDetail", offerId, applicantId],
    queryFn: async () => {
      if (!offerId || !applicantId)
        throw new Error("Faltan identificadores requeridos.");
      const response = await offererPublicationService.getApplicantDetail(
        offerId,
        applicantId
      );
      return response.data.data;
    },
    enabled: !!offerId && !!applicantId,
  });
};

export const useGetOffererPostulantsQuery = (
  publicationId: string | undefined
) => {
  return useQuery<any[], Error>({
    queryKey: ["offerer", "postulants", publicationId],
    queryFn: async () => {
      if (!publicationId) throw new Error("ID de publicación es requerido.");
      const response =
        await offererPublicationService.getOfferApplicantsForOfferer(
          publicationId
        );
      const rawApplicants = response.data.data || [];
      return rawApplicants.map((app: any) => mapApplicantToView(app));
    },
    enabled: !!publicationId,
  });
};

// acceptApplication(applicationId: number | string) {
//     return this.httpClient.patch<ApiResponse<any[]>>(
//       `${this.baseURL}/students/applications/${applicationId}/accept`,
//       {} // Body vacío requerido para la firma de PATCH
//     );
//   }
//   /**
//    * Rechaza una postulación específica
//    * Endpoint: PATCH /api/publications/Student/applications/{applicationId}/reject
//    * Nota: El backend usa 'Student' (singular) aquí.
//    */
//   rejectApplication(applicationId: number | string) {
//     return this.httpClient.patch<ApiResponse<any>>(
//       `${this.baseURL}/students/applications/${applicationId}/reject`,
//       {} // IMPORTANTE: Body vacío requerido para la firma de PATCH
//     );

export const useAcceptApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number | string) => {
      const user = getUserFromToken();
      console.log("🔍 [DEBUG ACCEPT] User Data:", user, "UserType:", user?.userType);

      return offererPublicationService.acceptApplication(applicationId);
    },
    onSuccess: () => {
      toast.success("Postulación aceptada correctamente.");
      // Invalidamos para refrescar la data en pantalla inmediatamente
      queryClient.invalidateQueries({
        queryKey: ["offerer", "postulantDetail"],
      });
      queryClient.invalidateQueries({ queryKey: ["offerer", "postulants"] });
      queryClient.invalidateQueries({
        queryKey: ["applicant", "postulantDetail"],
      });
      queryClient.invalidateQueries({ queryKey: ["offer-applicants"] });
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      toast.error(apiError.details || "Error al aceptar la postulación.");
    },
  });
};

export const useRejectApplicationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number | string) => {
      const user = getUserFromToken();
      console.log("🔍 [DEBUG REJECT] User Data:", user, "UserType:", user?.userType);

      return offererPublicationService.rejectApplication(applicationId);
    },
    onSuccess: () => {
      toast.success("Postulación rechazada.");
      queryClient.invalidateQueries({
        queryKey: ["offerer", "postulantDetail"],
      });
      queryClient.invalidateQueries({ queryKey: ["offerer", "postulants"] });
      queryClient.invalidateQueries({
        queryKey: ["applicant", "postulantDetail"],
      });
      queryClient.invalidateQueries({ queryKey: ["offer-applicants"] });
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      toast.error(apiError.details || "Error al rechazar la postulación.");
    },
  });
};
