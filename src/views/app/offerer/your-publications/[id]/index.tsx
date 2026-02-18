"use client";
import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, ShoppingBag, Heart, Users, Trash2, ArrowRight, XCircle } from 'lucide-react';
import { useYourPublicationDetailView } from './hooks/use-publication-detail-view'; 
import { useNotification } from '@/hooks/common/use-notification'; 
import { 
    PublicationDetailSection, 
    ApplicantsDialog, 
    StatusReasonBanner,
    AppealFormDialog
} from './components'; 
import { NotificationBanner } from "@/components/ui/notification";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from 'sonner';
import { cn } from 'src/lib';
import { Button } from '@/components/ui';

const PUBLICATION_TYPES = [
    { value: "Oferta", text: "Oferta de Trabajo", icon: Briefcase, iconClass: "text-indigo-500" },
    { value: "CompraVenta", text: "Compra/Venta", icon: ShoppingBag, iconClass: "text-purple-500" },
];

const APPROVAL_STATUS = [
    { value: "Aceptada", text: "Aprobada", classes: "bg-green-500 text-white" },
    { value: "Pendiente", text: "Pendiente", classes: "bg-yellow-400 text-slate-900 border border-yellow-500/50" },
    { value: "Rechazada", text: "Rechazada", classes: "bg-red-500 text-white" },
    { value: "Cerrada", text: "Cerrada", classes: "bg-gray-500 text-white" },
];

const OFFER_STATUS = [
    { value: "EnRevision", text: "En Revisión", classes: "bg-gray-500 text-white", description: "Esperando aprobación administrativa" },
    { value: "RecibiendoPostulaciones", text: "Recibiendo Postulaciones", classes: "bg-blue-500 text-white", description: "Abierta para postulaciones" },
    { value: "RealizandoTrabajo", text: "Realizando Trabajo", classes: "bg-indigo-500 text-white", description: "Trabajo en progreso" },
    { value: "CalificacionesEnProceso", text: "Calificaciones en Proceso", classes: "bg-purple-500 text-white", description: "Período de calificaciones" },
    { value: "Finalizada", text: "Finalizada", classes: "bg-green-600 text-white", description: "Oferta completada" },
    { value: "CanceladaAntesDelTrabajo", text: "Cancelada", classes: "bg-red-600 text-white", description: "Oferta cancelada antes del trabajo" },
];

export default function OffererPublicationDetailView() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const publicationId = parseInt(id);
    
    const { 
        detail: publication, 
        loading: isLoading, 
        error,
        isMutating,
        handleCancelOffer,
        handleAdvanceOffer,
        handleAppealPublication,
        refetch
    } = useYourPublicationDetailView(publicationId);

    const { notification, isVisible, close, show } = useNotification();
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isAdvanceDialogOpen, setIsAdvanceDialogOpen] = useState(false);
    const [isApplicantsDialogOpen, setIsApplicantsDialogOpen] = useState(false);
    const [isAppealDialogOpen, setIsAppealDialogOpen] = useState(false);
    const [isAppealing, setIsAppealing] = useState(false);

    const handleCloseMenu = () => {
        setIsApplicantsDialogOpen(false);
        refetch(); // Refrescar los detalles de la publicación al cerrar el menú de postulantes
    }

    const handleCancelConfirm = async () => {
        setIsCancelDialogOpen(false);
        const toastId = toast.loading("Cancelando oferta...");
        try {
            await handleCancelOffer();
            toast.success("Oferta cancelada exitosamente", { id: toastId });
            //router.push(`/offerer/your-publications?notification=cancelled`); 
        } catch (e: any) {
            toast.dismiss(toastId);
            const errorMessage = e?.response?.data?.details || e?.details || "Hubo un error al cancelar la oferta.";
            show("Error al Cancelar Oferta", errorMessage, "error");
        }
    };

    const handleAdvanceConfirm = async () => {
        setIsAdvanceDialogOpen(false);
        const toastId = toast.loading("Avanzando estado de la oferta...");
        try {
            await handleAdvanceOffer();
            toast.success("Estado avanzado exitosamente", { id: toastId });
            refetch();
        } catch (e: any) {
            toast.dismiss(toastId);
            const errorMessage = e?.response?.data?.details || e?.details || "Hubo un error al avanzar el estado.";
            
            if (errorMessage.includes('postulantes aceptados') || errorMessage.includes('No puedes avanzar sin haber aceptado')) {
                show(
                    "No se puede avanzar", 
                    "Debes aceptar al menos un postulante antes de avanzar al siguiente estado. Revisa la lista de postulantes y acepta al menos uno, o cancela la oferta si ya no es necesaria.",
                    "error"
                );
            } else {
                show("Error al Avanzar Estado", errorMessage, "error");
            }
        }
    };

    // Determina si se pueden mostrar los botones de acción basados en el estado actual de la publicación
    const canCancel = publication?.publicationType === "Oferta" 
        && publication?.offerStatus === 'RecibiendoPostulaciones' 
        && publication?.approvalStatus === 'Aceptada';
    
    const canAdvance = publication?.publicationType === "Oferta" 
        && (publication?.offerStatus === 'RecibiendoPostulaciones' || publication?.offerStatus === 'RealizandoTrabajo')
        && publication?.approvalStatus === 'Aceptada';

    const getAdvanceDialogContent = () => {
        if (publication?.offerStatus === 'RecibiendoPostulaciones') {
            return {
                title: "¿Cerrar Postulaciones?",
                description: `Esta acción cerrará el periodo de postulaciones y avanzará la oferta a la etapa "Realizando Trabajo". Este proceso ocurriría automáticamente al llegar a la fecha límite de postulación (${publication.applicationDeadline ? new Date(publication.applicationDeadline).toLocaleDateString('es-CL') : 'no definida'}). ¿Deseas continuar?`
            };
        } else if (publication?.offerStatus === 'RealizandoTrabajo') {
            return {
                title: "¿Finalizar Trabajo?",
                description: `Esta acción marcará el trabajo como completado y avanzará la oferta a la etapa "Calificaciones en Proceso". Este proceso ocurriría automáticamente al llegar a la fecha de término (${publication.endDate ? new Date(publication.endDate).toLocaleDateString('es-CL') : 'no definida'}). ¿Deseas continuar?`
            };
        }
        return { title: "", description: "" };
    };

    const advanceDialogContent = getAdvanceDialogContent();

    const handleAppealSubmit = async (appealData: any) => {
        const toastId = toast.loading("Enviando apelación...");
        try {
            await handleAppealPublication(appealData);
            setIsAppealDialogOpen(false);
            toast.success("Apelación enviada exitosamente", {
                id: toastId,
                description: "Un administrador revisará tu caso pronto.",
            });
        } catch (e: any) {
            toast.dismiss(toastId);
            const errorMessage = e?.response?.data?.message || e?.message || "Error al enviar la apelación.";
            show("Error al Apelar", errorMessage, "error");
            throw e; // Re-lanzar para que el componente de apelación también pueda manejarlo si lo necesita
        }
    };

    const publicationTitle = publication?.title || "Cargando Publicación...";
    
    const publicationType = useMemo(() => {
        if (!publication) return { text: "Cargando...", icon: Briefcase, iconClass: "text-gray-400", gradient: "from-gray-500 to-slate-500" };
        return PUBLICATION_TYPES.find(t => t.value === publication.publicationType) || 
          { text: "Desconocido", icon: Briefcase, iconClass: "text-gray-400", gradient: "from-gray-500 to-slate-500" };
    }, [publication]);
    
    const publicationStatus = useMemo(() => {
        if (!publication) return { text: "Cargando...", classes: "bg-gray-500 text-white" };
        const statusInfo = APPROVAL_STATUS.find(s => s.value === publication.approvalStatus) || 
          { text: "Desconocido", classes: "bg-gray-500 text-white" };
        const baseClasses = "px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm";
        return { text: statusInfo.text, classes: `${baseClasses} ${statusInfo.classes}` };
    }, [publication]);

    const offerStatus = useMemo(() => {
        if (!publication || publication.publicationType !== "Oferta" || !publication.offerStatus) {
            return null;
        }
        const statusInfo = OFFER_STATUS.find(s => s.value === publication.offerStatus) || 
        { text: "Desconocido", classes: "bg-gray-500 text-white", description: "" };
        const baseClasses = "px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm";
        return { 
            text: statusInfo.text, 
            classes: `${baseClasses} ${statusInfo.classes}`,
            description: statusInfo.description
        };
    }, [publication]);

    const isJobOffer = publication?.publicationType === "Oferta";
    const isPublished = publication?.approvalStatus === "Aceptada";

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-slate-900">
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <img src="/fondo.png" alt="Fondo UCN" className="w-full h-full object-cover opacity-60"/>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-800/90 to-fuchsia-800/80 mix-blend-hard-light"/>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-950/90"/>
                </div>
                
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-7xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-12 bg-white/20 rounded-3xl w-48"></div>
                        <div className="h-64 bg-white/20 rounded-3xl"></div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !publication) {
        return (
            <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-slate-900">
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <img src="/fondo.png" alt="Fondo UCN" className="w-full h-full object-cover opacity-60"/>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-800/90 to-fuchsia-800/80 mix-blend-hard-light"/>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-950/90"/>
                </div>
                
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-7xl">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 text-center">
                        <h2 className="text-3xl font-black mb-4">Error</h2>
                        <p className="text-lg mb-6">{error || "No se pudo cargar la publicación"}</p>
                        <Link href="/offerer/your-publications">
                            <button className="px-6 py-3 bg-white text-purple-900 rounded-full font-bold hover:bg-purple-100 transition">
                                Volver a Mis Publicaciones
                            </button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const TypeIcon = publicationType.icon;

    return (
        <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-slate-900">
            
            {/* Background - Same as Profile */}
            <div className="absolute inset-0 z-0">
                <img src="/fondo.png" alt="Fondo UCN" className="w-full h-full object-cover opacity-60"/>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-800/90 to-fuchsia-800/80 mix-blend-hard-light"/>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-950/90"/>
            </div>

            <NotificationBanner data={notification} isVisible={isVisible} onClose={close} />
            
            <ConfirmDialog
                open={isAdvanceDialogOpen}
                onOpenChange={() => setIsAdvanceDialogOpen(false)}
                onConfirm={handleAdvanceConfirm}
                title={advanceDialogContent.title}
                description={advanceDialogContent.description}
                confirmText="Sí, Avanzar"
                cancelText="Cancelar"
            />

            <ConfirmDialog
                open={isCancelDialogOpen}
                onOpenChange={() => setIsCancelDialogOpen(false)}
                onConfirm={handleCancelConfirm}
                title="¿Cancelar Oferta Permanentemente?"
                description="Esta acción es IRREVERSIBLE y solo debe usarse en caso de emergencia o cuando sea imposible cumplir con el contrato laboral de los postulantes aceptados. Aunque no afectará tus estadísticas directamente (no habrá etapa de calificaciones), un patrón de cancelaciones podría resultar en intervención administrativa. ¿Estás seguro de que deseas continuar?"
                confirmText="Sí, Cancelar Oferta"
                cancelText="No Cancelar"
            />
            
            <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                
                {/* Header - Same style as Profile */}
                <header className="mb-8">
                    <Button
                        onClick={() => router.push('/offerer/your-publications')}
                        className="cursor-pointer mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            {/* Type Badge */}
                            <div className={cn(
                                "inline-flex items-center gap-2 self-start px-3 py-1 rounded-full",
                                "bg-linear-to-r backdrop-blur-md border border-white/30",
                                "text-white text-xs font-bold uppercase tracking-wider shadow-lg",
                                "from-gray-500 to-slate-500"
                            )}>
                                <TypeIcon className="w-3 h-3" />
                                {publicationType.text}
                            </div>
                            
                            {/* Title */}
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight">
                                {publicationTitle}
                            </h1>
                            
                            {/* Status Badges */}
                            <div className="flex items-center flex-wrap gap-3 mt-2">
                                {/* Approval Status */}
                                <div className={publicationStatus.classes}>
                                    {publicationStatus.text}
                                </div>
                                
                                {/* Offer Status (only for job offers) */}
                                {offerStatus && (
                                    <div className={offerStatus.classes} title={offerStatus.description}>
                                        {offerStatus.text}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isPublished && isJobOffer && (canCancel || canAdvance) && (
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsApplicantsDialogOpen(true)}
                                    className="w-full sm:w-auto px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white rounded-full font-bold transition shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <Users className="w-5 h-5 flex-shrink-0" />
                                    <span>Postulantes ({publication.applicationsCount || 0})</span>
                                </button>
                                
                                {canAdvance && (
                                    <button
                                        onClick={() => setIsAdvanceDialogOpen(true)}
                                        disabled={isMutating}
                                        className="w-full sm:w-auto px-6 py-3 bg-blue-600/80 hover:bg-blue-600 backdrop-blur-md border border-blue-500/50 disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white rounded-full font-bold transition shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <ArrowRight className="w-5 h-5 flex-shrink-0" />
                                        <span>{isMutating ? "Avanzando..." : "Avanzar Estado"}</span>
                                    </button>
                                )}
                                
                                {canCancel && (
                                    <button
                                        onClick={() => setIsCancelDialogOpen(true)}
                                        disabled={isMutating}
                                        className="w-full sm:w-auto px-6 py-3 bg-red-600/80 hover:bg-red-600 backdrop-blur-md border border-red-500/50 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white rounded-full font-bold transition shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>{isMutating ? "Cancelando..." : "Cancelar Oferta"}</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Status Reason Banner - Show for Rejected or Closed */}
                {publication && (publication.approvalStatus === "Rechazada" || publication.approvalStatus === "Cerrada") && (
                    <div className="mb-6">
                        <StatusReasonBanner
                            status={publication.approvalStatus}
                            reason={
                                publication.approvalStatus === "Rechazada" 
                                    ? publication.reasonForRejection 
                                    : publication.reasonForClosure
                            }
                            appealCount={publication.appealCount}
                            maxAppeals={3}
                            onAppeal={publication.approvalStatus === "Rechazada" ? () => setIsAppealDialogOpen(true) : undefined}
                            isAppealing={isAppealing}
                        />
                    </div>
                )}

                {/* Main White Card - Same as Profile */}
                <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 md:p-8">
                    <PublicationDetailSection publication={publication} />
                </div>

                {/* Applicants Dialog */}
                {publication?.publicationType == "Oferta" && (
                    <ApplicantsDialog
                        isOpen={isApplicantsDialogOpen}
                        onClose={handleCloseMenu}
                        offerId={publicationId}
                        totalApplicants={publication?.applicationsCount || 0}
                        availableSlots={publication?.remainingSlots || 0}
                    />
                )}

                {/* Appeal Form Dialog */}
                {publication?.approvalStatus === "Rechazada" && (
                    <AppealFormDialog
                        isOpen={isAppealDialogOpen}
                        onClose={() => setIsAppealDialogOpen(false)}
                        onSubmit={handleAppealSubmit}
                        isSubmitting={isAppealing}
                        publication={publication}
                    />
                )}  
            </main>
        </div>
    );
}