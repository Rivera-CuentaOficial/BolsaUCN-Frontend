"use client";
import { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, ShoppingBag, Heart, Users, Trash2 } from 'lucide-react';
import { useYourPublicationDetailView } from './hooks/use-publication-detail-view'; 
import { useNotification } from '@/hooks/common/use-notification'; 
import { PublicationDetailSection, ApplicantsDialog } from './components'; 
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
        handleClosePublication, 
    } = useYourPublicationDetailView(publicationId);

    const { notification, isVisible, close, show } = useNotification();
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
    const [isApplicantsDialogOpen, setIsApplicantsDialogOpen] = useState(false);


    const handleCloseConfirm = async () => {
        setIsCloseDialogOpen(false);
        const toastId = toast.loading("Cerrando publicación...");
        try {
            await handleClosePublication();
            toast.dismiss(toastId);
            router.push(`/offerer/your-publications?notification=closed`); 
        } catch (e: any) {
            toast.dismiss(toastId);
            const errorMessage = e?.message || "Hubo un error desconocido al intentar cerrar la publicación.";
            show("¡Error al Cerrar Publicación!", errorMessage, "error");
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
                open={isCloseDialogOpen}
                onOpenChange={() => setIsCloseDialogOpen(false)}
                onConfirm={handleCloseConfirm}
                title="¿Cerrar Publicación?"
                description="Esta acción cerrará la publicación permanentemente. No se podrán recibir más postulaciones."
                confirmText="Cerrar Publicación"
                cancelText="Cancelar"
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
                            
                            {/* Status Badge */}
                            <div className="flex items-center gap-3 mt-2">
                                <div className={publicationStatus.classes}>
                                    {publicationStatus.text}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isPublished && isJobOffer && (
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsApplicantsDialogOpen(true)}
                                    className="w-full sm:w-auto px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white rounded-full font-bold transition shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <Users className="w-5 h-5 flex-shrink-0" />
                                    <span>Postulantes ({publication.applicationsCount || 0})</span>
                                </button>
                                
                                <button
                                    onClick={() => setIsCloseDialogOpen(true)}
                                    disabled={isMutating}
                                    className="w-full sm:w-auto px-6 py-3 bg-red-600/80 hover:bg-red-600 backdrop-blur-md border border-red-500/50 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white rounded-full font-bold transition shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-5 h-5 flex-shrink-0" />
                                    <span>{isMutating ? "Cerrando..." : "Cerrar Publicación"}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main White Card - Same as Profile */}
                <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 md:p-8">
                    <PublicationDetailSection publication={publication} />
                </div>

                {/* Applicants Dialog */}
                {publication?.publicationType == "Oferta" && (
                    <ApplicantsDialog
                        isOpen={isApplicantsDialogOpen}
                        onClose={() => setIsApplicantsDialogOpen(false)}
                        offerId={publicationId}
                        totalApplicants={publication?.applicationsCount || 0}
                    />
                )}
            </main>
        </div>
    );
}