// src/views/app/offerer/your-publications/[id]/index.tsx
"use client";
import { useMemo, useState } from "react"; // ADDED useState
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  ShoppingBag,
  Heart,
  Users,
  Trash2,
} from "lucide-react"; // ADDED Users, Trash2, removed unused AlertCircle, Settings2
import { useYourPublicationDetailView } from "./hooks/use-publication-detail-view";
import { useNotification } from "@/hooks/common/use-notification";
import PublicationDetailSection from "./components/PublicationDetailSection";
// REMOVIDO: import PublicationActionSection from './components/PublicationActionSection';
import { NotificationBanner } from "@/components/ui/notification";
import { ConfirmDialog } from "@/components/ui/confirm-dialog"; // Importado para el diálogo
import { toast } from "sonner"; // Importado para las notificaciones
import { cn, formatDate, thousandSeparatorPipe } from "src/lib";
import type { OfferDetail, MyBuySell } from "src/models/responses";

interface PublicationDetailViewAdminProps {
  id?: number;
}
// --- Constantes de Mapeo (Asegurando consistencia) ---
const PUBLICATION_TYPES = [
  {
    value: 0,
    text: "Oferta de Trabajo",
    icon: Briefcase,
    iconClass: "text-indigo-500",
  },
  {
    value: 1,
    text: "Compra/Venta",
    icon: ShoppingBag,
    iconClass: "text-purple-500",
  }, // 1 = Compra/Venta para corregir bug
  { value: 2, text: "Voluntariado", icon: Heart, iconClass: "text-pink-500" },
];
const PUBLICATION_STATUS = [
  { value: 0, text: "Activa", classes: "bg-green-500 text-white" },
  {
    value: 1,
    text: "Pendiente",
    classes: "bg-yellow-400 text-slate-900 border border-yellow-500/50",
  },
  { value: 2, text: "Rechazada", classes: "bg-red-500 text-white" },
];
// --------------------------------------------------------

export default function PublicationDetailViewAdmin({
  id: propId,
}: PublicationDetailViewAdminProps) {
  const params = useParams();
  const router = useRouter();
  const id = propId || Number(params.id) || 0;

  const searchParams = useSearchParams();
  const typeQuery = searchParams.get("type");
  const statusQuery = searchParams.get("status");

  const publicationTypeParam = typeQuery ? parseInt(typeQuery) : 0;

  const {
    detail: publication,
    loading: isLoading,
    error,
    isMutating,
    handleClosePublication,
  } = useYourPublicationDetailView(id, publicationTypeParam);

  const { notification, isVisible, close, show } = useNotification();

  // ESTADO: Para el diálogo de confirmación de cierre
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  // HANDLER: Para la acción de cierre (usa la función del hook)
  const handleCloseConfirm = async () => {
    setIsCloseDialogOpen(false);
    const toastId = toast.loading("Cerrando publicación...");
    try {
      await handleClosePublication();

      toast.dismiss(toastId);

      // ÉXITO: Redirigir para que la página de lista muestre el banner de éxito
      router.push(`/admin/your-publications?notification=closed`);
    } catch (e: any) {
      toast.dismiss(toastId); // Quitar el toast de carga

      // Obtener el mensaje de error (será el mensaje del 409 si aplica)
      const errorMessage =
        e?.message ||
        "Hubo un error desconocido al intentar cerrar la publicación.";

      // FALLO: USAR EL BANNER DE NOTIFICACIÓN
      show(
        "¡Error al Cerrar Publicación!",
        errorMessage,
        "error" // Tipo de notificación de error
      );
    }
  };

  const publicationTitle = publication?.title || "Cargando Publicación...";
  const publicationType = useMemo(() => {
    const typeValue =
      (publication as any)?.types ||
      (typeQuery ? parseInt(typeQuery) : undefined);
    return (
      PUBLICATION_TYPES.find((t) => t.value === typeValue) || {
        text: "Desconocido",
        icon: Briefcase,
        iconClass: "text-gray-400",
      }
    );
  }, [publication, typeQuery]);

  const publicationStatus = useMemo(() => {
    const statusValue =
      (publication as any)?.statusValidation ??
      (statusQuery ? parseInt(statusQuery) : undefined);
    const statusInfo = PUBLICATION_STATUS.find(
      (s) => s.value === statusValue
    ) || { text: "Desconocido", classes: "bg-gray-500 text-white" };
    const baseClasses =
      "px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm";
    return {
      text: statusInfo.text,
      classes: `${baseClasses} ${statusInfo.classes}`,
    };
  }, [publication, statusQuery]);

  // Lógica para visibilidad de botones
  const isJobOffer =
    publication &&
    ("remuneration" in publication || "companyName" in publication);
  const isPublished = publication && publication.statusValidation === 0;

  // Handler para navegación a postulantes
  const handleViewApplicants = () => {
    if (publication) {
      router.push(`/admin/your-publications/${publication.id}/applicants`);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-20 text-white">Cargando detalles...</div>
    );
  }

  if (error) {
    return <div className="text-center p-20 text-red-500">Error: {error}</div>;
  }

  const detail = publication as OfferDetail | MyBuySell;

  const renderContent = () => {
    if (!detail) return null;

    // Define si la publicación está en un estado que permite acciones (Activa: 0, Pendiente: 1, Rechazada: 2).
    // Si la publicación está en alguno de estos estados, el bloque de acciones se mostrará,
    // asegurando que el botón "Cerrar Publicación" esté visible para todas ellas.
    const isActionable =
      detail.statusValidation === 0 ||
      detail.statusValidation === 1 ||
      detail.statusValidation === 2;

    return (
      <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 md:p-8">
        {/* ESTRUCTURA DE COLUMNA ÚNICA */}
        <div className="flex flex-col space-y-8">
          {/* SECCIÓN DE DETALLES */}
          <PublicationDetailSection
            detail={detail}
            typeInfo={publicationType}
            statusInfo={publicationStatus}
          />

          {/* SECCIÓN DE BOTONES DE ACCIÓN */}
          {isActionable ? (
            <div className="pt-8 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* ** Botón Ver Postulantes ** - Condición: Solo si es Oferta/Voluntariado (isJobOffer)
                                - Resultado: Ahora aparece en estados Activa, Pendiente o Rechazada para Ofertas/Voluntariado.
                                */}
                {isJobOffer && (
                  <button
                    onClick={handleViewApplicants}
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200 flex justify-center items-center gap-2 text-lg"
                    disabled={isMutating}
                  >
                    <Users className="w-5 h-5" />
                    Ver Postulantes
                  </button>
                )}

                {/* ** Botón Cerrar Publicación ** - Condición: Se muestra siempre que la publicación sea 'Actionable' (Activa, Pendiente o Rechazada).
                 */}
                <button
                  onClick={() => setIsCloseDialogOpen(true)}
                  disabled={isMutating}
                  // Estilos para que se parezca al botón de la imagen
                  className="flex-1 px-6 py-4 bg-red-50 text-red-600 border border-red-300 rounded-xl font-bold hover:bg-red-100 transition disabled:opacity-50 flex justify-center items-center gap-2 text-lg shadow-lg"
                >
                  <Trash2 className="w-5 h-5" />
                  {isMutating ? "Cerrando..." : "Cerrar Publicación"}
                </button>
              </div>
            </div>
          ) : null}

          {/* DIÁLOGO DE CONFIRMACIÓN */}
          <ConfirmDialog
            open={isCloseDialogOpen}
            onOpenChange={setIsCloseDialogOpen}
            title="¿Cerrar esta publicación?"
            description="Esta acción hará que la publicación deje de estar disponible para los usuarios y no podrá recibir más postulaciones."
            confirmText="Cerrar"
            cancelText="Cancelar"
            onConfirm={handleCloseConfirm}
            onCancel={() => setIsCloseDialogOpen(false)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

      <NotificationBanner
        data={notification}
        isVisible={isVisible}
        onClose={close}
      />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <header className="mb-10">
          <Link href="/admin/your-publications">
            <button className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10">
              <ArrowLeft className="h-4 w-4" />
              Volver a Publicaciones
            </button>
          </Link>

          <div className="flex flex-col items-start gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg transform">
              <publicationType.icon
                className={cn("w-3.5 h-3.5", publicationType.iconClass)}
              />
              {publicationType.text}
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg leading-tight mt-2 text-white">
              {publicationTitle}
            </h1>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}
