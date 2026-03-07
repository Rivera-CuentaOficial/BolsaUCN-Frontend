import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  handleApiError,
  getUserFromToken,
} from "@/lib";
import { toast } from "sonner";
import { offererPublicationService } from "@/services/offererPublicationService";

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
