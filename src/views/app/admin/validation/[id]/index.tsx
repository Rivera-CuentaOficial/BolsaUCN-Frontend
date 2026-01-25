"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import React, { useState } from "react";
import { useAdminPublicationDetailView } from "./hooks/use-validation-detail-view";
import { handleApiError, getPresentationType } from "@/lib";
import { ValidationDetailSection } from "./components/validation-detail-section";
import { ValidationActionSection } from "./components/validation-profile-section"; 
import { ConfirmDialog } from "@/components/ui";
import { toast } from "sonner";
import { ValidationDetailSkeleton } from "./components/validation-detail-skeleton"; 

export interface ValidationDetailViewProps {
  id: string;
}

export default function ValidationDetailView({ id }: ValidationDetailViewProps) {
  const router = useRouter();
  const { detail, loading, error, isMutating, handleAction, handleRetry } =
    useAdminPublicationDetailView(id);

  // Ruta exacta a la que volveremos
  const backRoute = "/admin/publications/validate";
  
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const handlePublishConfirm = async () => {
    setIsPublishDialogOpen(false);
    const toastId = toast.loading("Publicando oferta...");
    
    try {
      await handleAction("publish");
      toast.dismiss(toastId);
      router.push(`${backRoute}?notification=published`);
    } catch (e) {
      const apiError = handleApiError(e);
      toast.error("Error al publicar", {
        id: toastId,
        description: apiError.details || "No se pudo completar la acción.",
      });
    }
  };

  const handleRejectConfirm = async () => {
    setIsRejectDialogOpen(false);
    const toastId = toast.loading("Rechazando oferta...");
    
    try {
      await handleAction("reject");
      toast.dismiss(toastId);
      // Redirección explícita con el parámetro de notificación
      router.push(`${backRoute}?notification=rejected`);
    } catch (e) {
      toast.error("Error al rechazar", {
        id: toastId,
        description: "No se pudo completar la acción.",
      });
    }
  };

  // 1. ESTADO DE CARGA
  if (loading || !detail) {
    return (
      <div className="flex flex-col min-h-screen relative bg-slate-900 overflow-hidden">
         <div className="fixed inset-0 z-0 pointer-events-none">
             <img src="/fondo.png" alt="Fondo" className="w-full h-full object-cover opacity-60"/>
             <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 via-purple-800/90 to-fuchsia-800/80 mix-blend-hard-light" />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-950/90" />
         </div>
         <ValidationDetailSkeleton />
      </div>
    );
  }

  // 2. ESTADO DE ERROR
  if (error) {
    const errorDetails = error ? handleApiError(error).details : "Error desconocido.";
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 relative text-white">
         <div className="absolute inset-0 bg-gradient-to-br from-violet-900 to-slate-900" />
         <div className="relative z-10 max-w-xl mx-auto p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-center shadow-2xl">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-2xl font-bold mb-2">Error al cargar</h2>
            <p className="text-white/80 mb-6">{errorDetails}</p>
            <button onClick={handleRetry} className="px-6 py-3 bg-white text-purple-900 rounded-full font-bold hover:bg-purple-100 transition shadow-lg">
              Reintentar
            </button>
         </div>
      </div>
    );
  }

  // 3. CONTENIDO PRINCIPAL
  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-slate-900">
      
      {/* Fondo Morado Fijo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <img src="/fondo.png" alt="Fondo" className="w-full h-full object-cover opacity-60"/>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 via-purple-800/90 to-fuchsia-800/80 mix-blend-hard-light" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-950/90" />
      </div>

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
                {getPresentationType(detail.type)}
             </div>
             <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight">
                {detail.title || "Sin Título"}
             </h1>
          </div>
        </header>

        {/* Tarjeta Principal Blanca */}
        <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Columna Izquierda: Información */}
                <div className="w-full md:w-3/4 space-y-8">
                    <ValidationDetailSection detail={detail} />

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
                            className="flex-2 px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-green-200 flex justify-center items-center gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            {isMutating ? "Procesando..." : "Validar publicacion"}
                        </button>
                    </div>
                </div>

                {/* Columna Derecha: Perfil */}
                <div className="w-full md:w-1/4 space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <ValidationActionSection detail={detail} handleAction={handleAction} isMutating={isMutating} />
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

        <ConfirmDialog
            open={isRejectDialogOpen}
            onOpenChange={setIsRejectDialogOpen}
            title="¿Rechazar publicación?"
            description="La oferta será descartada y el usuario será notificado. Esta acción no se puede deshacer."
            confirmText="Sí, Rechazar"
            cancelText="Cancelar"
            onConfirm={handleRejectConfirm}
            onCancel={() => setIsRejectDialogOpen(false)}
        />
      </main>
    </div>
  );
}