import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { offererPublicationService } from "@/services/offererPublicationService";
import type { MyPublicationDetails } from "@/models/responses";

export type PublicationAction = "postulantes" | "close_publication" | "advance_offer";

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
    
  const handleCancelOffer = useCallback(async () => {
    if (!detail) throw new Error("Publicación no cargada.");
    if (detail.offerStatus !== "RecibiendoPostulaciones") {
      throw new Error("El estado actual de la publicación no permite cancelar la oferta.");
    }

    setIsMutating(true);
    try {
      await offererPublicationService.cancelOfferById(detail.id);
      await fetchDetail();
    } catch (err: any) {
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [detail, fetchDetail]);

  const handleAdvanceOffer = useCallback(async () => {
    if (!detail) throw new Error("Publicación no cargada.");

    // Solo se permite avanzar si la oferta está en "RecibiendoPostulaciones" o "RealizandoTrabajo"
    if (detail.offerStatus !== 'RecibiendoPostulaciones' && detail.offerStatus !== 'RealizandoTrabajo') {
      throw new Error("Solo se puede avanzar durante las etapas de Recibiendo Postulaciones o Realizando Trabajo.");
    }

    setIsMutating(true);
    try {
      await offererPublicationService.advanceOfferById(detail.id);
      await fetchDetail();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '';
      if (errorMessage.includes('postulantes aceptados')) {
        throw new Error("No puedes avanzar sin haber aceptado al menos un postulante. Por favor acepta al menos un postulante antes de avanzar, o cancela la oferta si ya no puedes cumplir con los requisitos.");
      }
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [detail, fetchDetail]);

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

  const refetch = () => {
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
    handleCancelOffer,
    handleAdvanceOffer,
    handleAppealPublication,
    refetch,
  };
};