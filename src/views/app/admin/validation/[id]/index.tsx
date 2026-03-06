"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePublicationDetailsForApproval } from "./hooks";
import { handleApiError, getPresentationType } from "@/lib";
import { ValidationDetailSection } from "./components/validation-detail-section";
import { ValidationActionSection } from "./components/validation-profile-section"; 
import { ConfirmDialog } from "@/components/ui";
import { toast } from "sonner";
import { ValidationDetailSkeleton } from "./components/validation-detail-skeleton"; 
import { RejectPublicationDialog } from "./components/reject-publication-dialog";

export interface ValidationDetailViewProps {
  id: string;
}

export default function ValidationDetailView({ id }: ValidationDetailViewProps) {
  const router = useRouter();
  const { details, isLoading, error, isMutating, handleAction, handleRetry } =
    usePublicationDetailsForApproval(id);

  // Ruta exacta a la que volveremos
  const backRoute = "/admin/publications/validate";
  
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (error && /no está pendiente de aprobación/i.test(error)) {
      toast.error("Publicación ya revisada", {
        description: "Esta publicación ya fue aprobada o rechazada.",
      });
      router.push(backRoute);
    }
  }, [error, router, backRoute]);

  const handlePublishConfirm = async () => {
    setIsPublishDialogOpen(false);
    const toastId = toast.loading("Publicando oferta...");
    
    try {
      await handleAction("publish");
      toast.dismiss(toastId);
      router.push(`${backRoute}`);
    } catch (e) {
      const apiError = handleApiError(e);
      toast.error("Error al publicar", {
        id: toastId,
        description: apiError.details || "No se pudo completar la acción.",
      });
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    setIsRejectDialogOpen(false);
    const toastId = toast.loading("Rechazando oferta...");
    
    try {
      await handleAction("reject", reason);
      toast.dismiss(toastId);
      router.push(`${backRoute}`)
    } catch (e) {
      toast.error("Error al rechazar", {
        id: toastId,
        description: "No se pudo completar la acción.",
      });
    }
  };

  // 1. ESTADO DE CARGA
  if (isLoading || !details) {
    return (
      <div className="flex flex-col min-h-screen relative bg-ucn-purple overflow-hidden">
         <ValidationDetailSkeleton />
      </div>
    );
  }

  // 2. ESTADO DE ERROR
  if (error && !/no está pendiente de aprobación/i.test(error)) {
    const errorDetails = error || "Error desconocido.";
    return (
      <div className="min-h-screen flex items-center justify-center bg-ucn-purple relative text-white">
         <div className="absolute inset-0 bg-linear-to-br from-violet-900 to-slate-900" />
         <div className="relative z-10 max-w-xl mx-auto p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-center shadow-2xl">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-2xl font-bold mb-2">Error al cargar</h2>
            <p className="text-white/80 mb-6">{errorDetails}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={handleRetry} 
                className="px-6 py-3 bg-white text-purple-900 rounded-full font-bold hover:bg-purple-100 transition shadow-lg"
              >
                Reintentar
              </button>
              <button 
                onClick={() => router.push(backRoute)} 
                className="px-6 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition shadow-lg"
              >
                Volver
              </button>
            </div>
         </div>
      </div>
    );
  }

  // 3. CONTENIDO PRINCIPAL
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

          <div className="flex flex-col gap-2">
             <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                <Sparkles className="w-3 h-3" />
                {getPresentationType(details.publicationType)}
             </div>
             <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight">
                {details.title || "Sin Título"}
             </h1>
          </div>
        </header>

        {/* Tarjeta Principal Blanca */}
        <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Columna Izquierda: Información */}
            <div className="w-full lg:w-2/3 space-y-8 order-2 lg:order-none">
              <ValidationDetailSection detail={details} />

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                <button
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={isMutating}
                  className="flex-1 px-6 py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Rechazar publicacion
                </button>

                <button
                  onClick={() => setIsPublishDialogOpen(true)}
                  disabled={isMutating}
                  className="flex-1 sm:flex-2 px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-green-200 flex justify-center items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {isMutating ? "Procesando..." : "Validar publicacion"}
                </button>
              </div>
            </div>

            {/* Columna Derecha: Perfil */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-8 space-y-6 order-1 lg:order-none">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <ValidationActionSection detail={details} handleAction={handleAction} isMutating={isMutating} />
              </div>
            </div>
          </div>
        </div>

        {/* Diálogos */}
        <ConfirmDialog
            open={isPublishDialogOpen}
            onOpenChange={setIsPublishDialogOpen}
            title="¿Publicar esta oferta?"
            description="La oferta será visible inmediatamente para todos los usuarios."
            confirmText="Validar"
            cancelText="Cancelar"
            onConfirm={handlePublishConfirm}
            onCancel={() => setIsPublishDialogOpen(false)}
        />

        <RejectPublicationDialog
            open={isRejectDialogOpen}
            onOpenChange={setIsRejectDialogOpen}
            onConfirm={handleRejectConfirm}
            onCancel={() => setIsRejectDialogOpen(false)}
        />
      </main>
    </div>
  );
}