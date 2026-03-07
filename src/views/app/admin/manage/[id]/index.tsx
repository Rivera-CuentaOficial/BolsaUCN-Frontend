"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Sparkles, Users, Trash2, XCircle } from "lucide-react";
import React, { useState } from "react";
import {
  ManageDetailSection,
  ManageProfileSection,
  ApplicantsDialog,
  ManageDetailSkeleton,
  ClosePublicationDialog
} from "./components";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAdminPublicationDetailView } from "./hooks";
import { handleApiError, getPresentationType } from "@/lib";
import { toast } from "sonner";

export interface ManageDetailViewProps {
  id: number;
}

export default function ManageDetailView({ id }: ManageDetailViewProps) {
  const router = useRouter();
  const { detail, loading, error, isMutating, handleAction, handleRetry } =
    useAdminPublicationDetailView(id);

  const backRoute = "/admin/publications/manage";
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isApplicantsDialogOpen, setIsApplicantsDialogOpen] = useState(false);

  const handleCloseConfirm = async (reason?: string) => {
    setIsCloseDialogOpen(false);
    const toastId = toast.loading("Cerrando publicación...");
    try {
      await handleAction("close_publication", { reason });
      toast.dismiss(toastId);
      router.push(`${backRoute}?notification=closed`);
    } catch (e) {
      toast.error("Error al cerrar publicación", {
        id: toastId,
        description: "No se pudo completar la acción. Revisa la consola.",
      });
    }
  };

  const handleCancelConfirm = async () => {
    setIsCancelDialogOpen(false);
    const toastId = toast.loading("Cancelando oferta...");
    try {
      await handleAction("cancel_publication");
      toast.success("Oferta cancelada exitosamente", { id: toastId });
      router.push(`${backRoute}?notification=cancelled`);
    } catch (e) {
      toast.error("Error al cancelar oferta", {
        id: toastId,
        description: "No se pudo completar la acción. Revisa la consola.",
      });
    }
  };

  const isJobOffer = detail?.publicationType === "Oferta";
  const applicantsCount = (detail as any)?.applicantsCount || 0;
  const canCancelOffer = isJobOffer && detail?.currentStatus === "RecibiendoPostulaciones";
  const canCloseBuySell = !isJobOffer && detail?.availability === "Disponible";

  // 1. ESTADO DE CARGA
  if (loading || !detail) {
    return (
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-ucn-purple">
        <ManageDetailSkeleton />
      </div>
    );
  }

  // 2. ESTADO DE ERROR
  if (error) {
    const errorDetails = error
      ? handleApiError(error).details || error
      : "Error desconocido.";
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 to-slate-900" />

        <div className="relative z-10 max-w-xl mx-auto p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-center text-white shadow-2xl">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold mb-2">Error al cargar</h2>
          <p className="text-white/80 mb-6">{errorDetails}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-white text-purple-900 rounded-full font-bold hover:bg-purple-100 transition shadow-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // 3. VISTA PRINCIPAL
  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-ucn-purple">

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => router.push(backRoute)}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Panel
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                <Sparkles className="w-3 h-3" />
                {getPresentationType(detail.publicationType) || "Tipo Desconocido"}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight">
                {detail.title || "Sin Título"}
              </h1>
            </div>

            {/* Action Buttons */}
            {isJobOffer && (
              <button
                onClick={() => setIsApplicantsDialogOpen(true)}
                className="w-full md:w-auto px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white rounded-full font-bold transition shadow-lg flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                <span>Postulantes ({applicantsCount})</span>
              </button>
            )}
          </div>
        </header>

        {/* Tarjeta Principal */}
        <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Columna Izquierda: Perfil + Imágenes */}
            <div className="w-full lg:w-1/3">
              <ManageProfileSection detail={detail} />
            </div>
            {/* Columna Derecha: Información Principal */}
            <div className="w-full lg:w-2/3 space-y-8">
              <ManageDetailSection detail={detail} />

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                {canCancelOffer && (
                  <button
                    onClick={() => setIsCancelDialogOpen(true)}
                    disabled={isMutating}
                    className="flex-1 px-6 py-4 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl font-bold hover:bg-orange-100 transition disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    {isMutating ? "Procesando..." : "Cancelar Oferta"}
                  </button>
                )}
                {canCloseBuySell && (
                <button
                  onClick={() => setIsCloseDialogOpen(true)}
                  disabled={isMutating}
                  className="flex-1 px-6 py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  {isMutating ? "Procesando..." : "Cerrar Publicación"}
                </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DIÁLOGOS */}
        <ClosePublicationDialog
          open={isCloseDialogOpen}
          onOpenChange={setIsCloseDialogOpen}
          onConfirm={handleCloseConfirm}
          onCancel={() => setIsCloseDialogOpen(false)}
        />

        <ConfirmDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          onConfirm={handleCancelConfirm}
          title="¿Cancelar Oferta de Trabajo?"
          description="Esta acción cancelará permanentemente esta oferta de trabajo antes de que comience el trabajo. Esta acción se usa en casos de emergencia cuando no se puede cumplir con el compromiso. Los postulantes aceptados serán notificados. Esta acción no se puede deshacer. ¿Estás seguro de que deseas continuar?"
          confirmText="Sí, Cancelar Oferta"
          cancelText="No Cancelar"
        />

        {isJobOffer && (
          <ApplicantsDialog
            isOpen={isApplicantsDialogOpen}
            onClose={() => setIsApplicantsDialogOpen(false)}
            offerId={id}
            totalApplicants={applicantsCount}
          />
        )}
      </main>
    </div>
  );
}