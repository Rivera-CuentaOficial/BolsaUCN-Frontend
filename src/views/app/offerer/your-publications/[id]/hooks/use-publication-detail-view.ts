import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { offererPublicationService } from "src/services/offererPublicationService";
import type { MyPublicationDetails } from "src/models/responses";

export type PublicationAction = "postulantes" | "close_publication";

export const useYourPublicationDetailView = (id: number) => {
  const router = useRouter();
  const [detail, setDetail] = useState<MyPublicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [isAppealing, setIsAppealing] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await offererPublicationService.getMyPublicationDetails(id);
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

  const handleAction = async (action: PublicationAction) => {
    if (!detail) return;

    setIsMutating(true);
    try {
      if (action === "postulantes") {
        router.push(`/offerer/your-publications/${id}/applicants`);
      }
    } catch (err: any) {
      alert("Error al realizar la acción: " + (err.response?.data?.message || err.message));
    } finally {
      setIsMutating(false);
    }
  };
    
  const handleClosePublication = useCallback(async () => {
    if (!detail) throw new Error("Publicación no cargada.");

    setIsMutating(true);
    try {
      await offererPublicationService.closePublicationById(detail.id);
      router.push(`/offerer/your-publications`);
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        throw new Error("El estado actual de la publicación (Pendiente o Rechazada) no permite el cierre.");
      }
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [detail]);

  const handleAppealPublication = useCallback(async (appealData: any) => {
    if (!detail) throw new Error("Publicación no cargada.");

    setIsAppealing(true);
    try {
      await offererPublicationService.appealRejectedPublication(detail.id, appealData);
      await fetchDetail();
    } catch (err: any) {
      throw err;
    } finally {
      setIsAppealing(false);
    }
  }, [detail, fetchDetail]);

  const handleRetry = () => {
    fetchDetail();
  };

  return {
    detail,
    loading,
    error,
    isMutating,
    isAppealing,
    handleAction,
    handleRetry,
    handleClosePublication,
    handleAppealPublication,
  };
};