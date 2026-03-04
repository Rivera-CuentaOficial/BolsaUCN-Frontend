"use client";

import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApplicantCard } from "./components/applicant-card";
import { ApplicantInfoForm } from "./components/applicant-info-form";
import { ApplicantDetailSkeleton } from "./components/applicant-detail-skeleton";
import { ConfirmDialog } from "@/components/ui";
import { NotificationBanner } from "@/components/ui";
import { useNotification } from "@/hooks/common/use-notification";
import {
  useOffererGetPostulantDetailQuery,
  useAcceptApplicationMutation,
  useRejectApplicationMutation
} from "@/hooks/api/use-manage-service";

export default function ApplicantDetailViewOfferer({
  id,
  postulantId,
}: {
  id: string;
  postulantId: string;
}) {
  const router = useRouter();
  const backRoute = `/offerer/your-publications/${id}/applicants`;
  const { notification, isVisible, show, close } = useNotification();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { data: postulant, isLoading, error } = useOffererGetPostulantDetailQuery(id, postulantId);
  const acceptMutation = useAcceptApplicationMutation();
  const rejectMutation = useRejectApplicationMutation();
  const isMutating = acceptMutation.isPending || rejectMutation.isPending;
  const handleAccept = () => {
    if (!postulant?.id) return;

    acceptMutation.mutate(postulant.id, {
      onSuccess: () => {
        setIsApproveDialogOpen(false);
        show(
          "¡Postulante Aceptado!",
          `Has aceptado correctamente a ${postulant.studentName}.`,
          "success"
        );
      },
      onError: () => {
        setIsApproveDialogOpen(false);
        show("Error", "No se pudo aceptar al postulante.", "error");
      }
    });
  };

  const handleReject = () => {
    if (!postulant?.id) return;

    rejectMutation.mutate(postulant.id, {
      onSuccess: () => {
        setIsRejectDialogOpen(false);
        show(
          "Postulación Rechazada",
          "El postulante ha sido descartado de esta oferta.",
          "success"
        );
      },
      onError: () => {
        setIsRejectDialogOpen(false);
        show("Error", "No se pudo rechazar al postulante.", "error");
      }
    });
  };

  if (isLoading || !postulant) return <ApplicantDetailSkeleton />;
  if (error) return <div className="text-white text-center p-10">Error al cargar datos.</div>;

  return (
    <div className="flex flex-col min-h-screen relative text-white bg-ucn-purple overflow-hidden">

      <NotificationBanner 
        data={notification} 
        isVisible={isVisible} 
        onClose={close} 
      />

      <main className="flex-grow container mx-auto px-4 py-6 relative z-10">
        <button
          onClick={() => router.push(backRoute)}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10"
        >
          <ChevronLeft className="h-4 w-4" /> Volver
        </button>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-lg mb-6">
          Detalles del Postulante
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 space-y-6">
            <div className="bg-white text-slate-900 rounded-xl shadow-xl overflow-hidden p-1">
              <ApplicantCard postulant={postulant} />
            </div>

            {postulant.status === "Pendiente" && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-lg flex flex-col gap-3">
                <p className="text-sm font-semibold text-white/80 text-center uppercase tracking-wider">
                  Acciones disponibles
                </p>
                <button
                  onClick={() => setIsApproveDialogOpen(true)}
                  disabled={isMutating}
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Aceptar
                </button>
                <button
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={isMutating}
                  className="w-full py-3 px-4 bg-red-500/80 hover:bg-red-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 border border-red-400/30 disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Rechazar
                </button>
              </div>
            )}

            {postulant.status !== "Pendiente" && (
              <div className={`p-4 rounded-xl text-center font-bold border shadow-sm transition-all ${
                postulant.status === 'Aceptada' 
                  ? 'bg-green-100 text-green-800 border-green-500' 
                  : 'bg-red-100 text-red-800 border-red-500'
              }`}>
                <div className="flex flex-col items-center gap-2">
                   {postulant.status === 'Aceptada' 
                      ? <CheckCircle2 className="w-8 h-8 text-green-700"/> 
                      : <XCircle className="w-8 h-8 text-red-700"/>
                   }
                   <span className="text-lg">
                     {postulant.status === 'Aceptada' 
                       ? "Postulante Aceptado" 
                       : "Postulante Rechazado"}
                   </span>
                </div>
              </div>
            )}
          </div>

          <div className="col-span-2 bg-white text-slate-900 rounded-xl shadow-xl overflow-hidden p-1">
            <ApplicantInfoForm postulant={postulant} />
          </div>
        </div>

        <ConfirmDialog
            open={isApproveDialogOpen}
            onOpenChange={setIsApproveDialogOpen}
            title="¿Aceptar Postulación?"
            description={`¿Estás seguro de que deseas aceptar a ${postulant.studentName}?`}
            confirmText={acceptMutation.isPending ? "Procesando..." : "Sí, Aceptar"}
            cancelText="Cancelar"
            onConfirm={handleAccept}
            onCancel={() => setIsApproveDialogOpen(false)}
        />

        <ConfirmDialog
            open={isRejectDialogOpen}
            onOpenChange={setIsRejectDialogOpen}
            title="¿Rechazar Postulación?"
            description="Esta acción descartará al postulante de esta oferta."
            confirmText={rejectMutation.isPending ? "Procesando..." : "Sí, Rechazar"}
            cancelText="Cancelar"
            onConfirm={handleReject}
            onCancel={() => setIsRejectDialogOpen(false)}
        />
      </main>
    </div>
  );
}