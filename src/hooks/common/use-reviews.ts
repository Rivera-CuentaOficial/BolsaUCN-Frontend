import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services/reviewService";
import type {
  MyReviewsSearchParamsDTO,
  GetReviewsSearchParamsDTO,
  ApplicantReviewForOfferorDTO,
  OfferorReviewForApplicantDTO,
  HideReviewInfoDTO,
} from "@/models/responses";
import { toast } from "sonner";

// Query keys
export const reviewKeys = {
  all: ["reviews"] as const,
  myReviews: (params?: MyReviewsSearchParamsDTO) =>
    [...reviewKeys.all, "my", params] as const,
  myReviewDetails: (id: number) =>
    [...reviewKeys.all, "my", "details", id] as const,
  adminReviews: (params?: MyReviewsSearchParamsDTO) =>
    [...reviewKeys.all, "admin", params] as const,
  adminReviewDetails: (id: number) =>
    [...reviewKeys.all, "admin", "details", id] as const,
};

// ========================================
// User Hooks
// ========================================

export function useMyReviews(params?: MyReviewsSearchParamsDTO) {
  return useQuery({
    queryKey: reviewKeys.myReviews(params),
    queryFn: () => reviewService.getMyReviews(params),
  });
}

export function useMyReviewDetails(reviewId: number) {
  return useQuery({
    queryKey: reviewKeys.myReviewDetails(reviewId),
    queryFn: () => reviewService.getMyReviewDetails(reviewId),
    enabled: reviewId > 0,
  });
}

export function useSubmitApplicantReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: number;
      data: ApplicantReviewForOfferorDTO;
    }) => reviewService.submitApplicantReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success("Evaluacion enviada correctamente");
    },
    onError: () => {
      toast.error("Error al enviar la evaluacion");
    },
  });
}

export function useSubmitOfferorReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: number;
      data: OfferorReviewForApplicantDTO;
    }) => reviewService.submitOfferorReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success("Evaluacion enviada correctamente");
    },
    onError: () => {
      toast.error("Error al enviar la evaluacion");
    },
  });
}

// ========================================
// Admin Hooks
// ========================================

export function useAdminReviews(params?: GetReviewsSearchParamsDTO) {
  return useQuery({
    queryKey: reviewKeys.adminReviews(params),
    queryFn: () => reviewService.getAdminReviews(params),
  });
}

export function useAdminReviewDetails(reviewId: number) {
  return useQuery({
    queryKey: reviewKeys.adminReviewDetails(reviewId),
    queryFn: () => reviewService.getAdminReviewDetails(reviewId),
    enabled: reviewId > 0,
  });
}

export function useHideReviewInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: number;
      data: HideReviewInfoDTO;
    }) => reviewService.hideReviewInfo(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success("Informacion de la resena ocultada correctamente");
    },
    onError: () => {
      toast.error("Error al ocultar la informacion de la resena");
    },
  });
}

// ========================================
// PDF Hooks
// ========================================

export function useDownloadMyReviewsPdf() {
  return useMutation({
    mutationFn: () => reviewService.downloadMyReviewsPdf(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "mis-resenas.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF descargado correctamente");
    },
    onError: () => {
      toast.error("Error al descargar el PDF");
    },
  });
}

export function useDownloadUserReviewsPdf() {
  return useMutation({
    mutationFn: (userId: number) => reviewService.downloadUserReviewsPdf(userId),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "resenas-usuario.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF descargado correctamente");
    },
    onError: () => {
      toast.error("Error al descargar el PDF");
    },
  });
}

export function useDownloadSystemReviewsPdf() {
  return useMutation({
    mutationFn: () => reviewService.downloadSystemReviewsPdf(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "resenas-sistema.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF descargado correctamente");
    },
    onError: () => {
      toast.error("Error al descargar el PDF");
    },
  });
}