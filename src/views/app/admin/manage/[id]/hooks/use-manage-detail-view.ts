// frontend/src/views/app/admin/manage/[id]/hooks/use-manage-detail-view.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { manageService } from "@/services/managePublicationService";
import { adminPublicationService } from "@/services/adminPublicationService";
import type { PublicationDetailsForAdmin } from "@/models/responses";

type ActionType = "close_publication" | "cancel_publication";

export const useAdminPublicationDetailView = (id: number) => {
  const router = useRouter();
  const [detail, setDetail] = useState<PublicationDetailsForAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await manageService.getPublicationDetailsByIdForAdmin(id);
      setDetail(response.data.data);
    } catch (err: any) {
      const status = err.response?.status;
      const message =
        status === 404
          ? "No se encontró la publicación que buscas."
          : status === 403
          ? "No tienes permiso para ver esta publicación."
          : "Hubo un error al cargar los datos. Por favor, intenta de nuevo.";
      setError(message);
      console.error("Error fetching publication detail:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id, fetchDetail]);

  const handleClosePublication = useCallback(async (reason: string) => {
    if (!detail) throw new Error("Publicación no cargada.");

    setIsMutating(true);
    try {
      await manageService.closePublicationById(detail.publicationId, reason);
      router.push("/admin/publications/manage");
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        throw new Error("El estado actual de la publicación no permite el cierre.");
      }
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [detail, router]);

  const handleCancelPublication = useCallback(async () => {
    if (!detail) throw new Error("Publicación no cargada.");

    setIsMutating(true);
    try {
      await adminPublicationService.cancelPublication(detail.publicationId);
      router.push("/admin/publications/manage");
    } catch (err: any) {
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [detail, router]);

  const handleAction = (action: ActionType, data?: { reason?: string }) => {
    if (action === "close_publication") {
      handleClosePublication(data?.reason!);
    } else if (action === "cancel_publication") {
      handleCancelPublication();
    }
  };

  const handleRetry = () => {
    fetchDetail();
  };

  return {
    detail,
    loading,
    error,
    isMutating,
    handleAction,
    handleRetry,
    handleClosePublication
  };
}