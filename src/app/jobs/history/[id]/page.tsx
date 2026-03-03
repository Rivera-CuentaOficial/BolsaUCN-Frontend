'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GetApplicationDetailsDTO } from "@/models/responses";
import { applicationService } from "@/services/applicationService";
import { toast } from "sonner";
import { 
  ArrowLeft, AlertCircle, Settings2, FileText, 
  Calendar, DollarSign, Mail, Phone, 
  Clock, Tag, Briefcase, User, Building2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui";
import { useCancelApplication } from "@/hooks/api/use-application-service";

function formatCLDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(+d)
    ? "—"
    : d.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function thousandSeparator(num: number) {
  return num.toLocaleString("es-CL");
}

const STATUS_OPTIONS = [
  { value: "Pendiente", text: "Pendiente", classes: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "Aceptada", text: "Aceptada", classes: "bg-green-100 text-green-800 border-green-200" },
  { value: "Rechazada", text: "Rechazada", classes: "bg-red-100 text-red-800 border-red-200" },
  { value: "CanceladaPorPostulante", text: "Cancelada", classes: "bg-gray-100 text-gray-800 border-gray-200" },
];

const getStatusBadge = (status: string) => {
  const baseClasses = "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border";
  const info = STATUS_OPTIONS.find(s => s.value === status) || 
    { text: "Pendiente", classes: "bg-yellow-100 text-yellow-800 border-yellow-200" };
  return { text: info.text, classes: `${baseClasses} ${info.classes}` };
};

const DetailSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 bg-slate-200" />
      <Skeleton className="h-32 w-full bg-slate-200" />
    </div>
    <div className="grid grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="p-4 bg-slate-50 rounded-2xl">
          <Skeleton className="h-4 w-20 mb-2 bg-slate-200" />
          <Skeleton className="h-5 w-full bg-slate-200" />
        </div>
      ))}
    </div>
  </div>
);

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = Number(params.id);

  const [application, setApplication] = useState<GetApplicationDetailsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const cancelMutation = useCancelApplication();


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await applicationService.getApplicationDetailsForApplicant(applicationId);
        
        if (mounted) {
          const data = res.data.data ?? null;
          setApplication(data);
          if (data?.coverLetter) {
            setEditedCoverLetter(data.coverLetter);
          }
        }
      } catch (e: any) {
        console.error("Error loading application details:", e);
        
        if (mounted) {
          setError(
            e.response?.data?.message || "No pudimos cargar los detalles. Inicia sesión nuevamente si el problema persiste."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  const handleSaveCoverLetter = async () => {
    if (!editedCoverLetter.trim()) {
      toast.error("La carta de presentación no puede estar vacía");
      return;
    }

    if (editedCoverLetter.length > 1000) {
      toast.error("La carta de presentación no puede exceder los 1000 caracteres");
      return;
    }

    setIsSaving(true);
    try {
      await applicationService.updateApplicationDetails(applicationId, { coverLetter: editedCoverLetter });
      
      // Update local state
      if (application) {
        setApplication({ ...application, coverLetter: editedCoverLetter });
      }
      
      setIsEditing(false);
      toast.success("Carta de presentación actualizada exitosamente");
    } catch (e: any) {
      console.error("Error updating cover letter:", e);
      toast.error(
        e.response?.data?.message || "No se pudo actualizar la carta de presentación"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedCoverLetter(application?.coverLetter || "");
    setIsEditing(false);
  };

  const handleCancelApplication = async () => {
    setIsCancelDialogOpen(false);
    const toastId = toast.loading("Cancelando postulación...");
    
    try {
        await cancelMutation.mutateAsync(applicationId);
        toast.success("Postulación cancelada exitosamente", { id: toastId });
        router.push("/jobs/history?notification=cancelled");
    } catch (e: any) {
        toast.dismiss(toastId);
        const errorMessage = e?.response?.data?.message || e?.message || "Hubo un error al cancelar la postulación.";
        toast.error(errorMessage);
    }
  };
  const canCancel = application?.status === "Pendiente";

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-5xl">
          <header className="mb-10">
            <Link href="/jobs/history">
              <button className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10">
                <ArrowLeft className="h-4 w-4" />
                Volver al Historial
              </button>
            </Link>
          </header>
          
          <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl p-6 md:p-8">
            <DetailSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-5xl">
          <header className="mb-10">
            <Link href="/jobs/history">
              <button className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10">
                <ArrowLeft className="h-4 w-4" />
                Volver al Historial
              </button>
            </Link>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg leading-tight">
              Detalles de Postulación
            </h1>
          </header>

          <div className="flex justify-center items-center p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-white shadow-2xl">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-400" />
              <div className="font-extrabold text-xl mb-2">Error al cargar detalles</div>
              <div className="text-white/80 mb-4">{error}</div>
              <Link href="/jobs/history">
                <Button className="bg-white text-purple-900 hover:bg-purple-100 rounded-full font-bold px-6">
                  Volver al Historial
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const statusInfo = getStatusBadge(application.status);
  const isCompany = application.offerorUserType === "Empresa";

  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-5xl">
        <header className="mb-8">
          <Link href="/jobs/history">
            <button className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                <Briefcase className="w-3 h-3" /> 
                Postulación
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight">
                {application.offerTitle}
              </h1>
              
              <div className="flex items-center gap-3 mt-2">
                <div className={statusInfo.classes}>{statusInfo.text}</div>

                {canCancel && (
                  <Button
                      onClick={() => setIsCancelDialogOpen(true)}
                      disabled={cancelMutation.isPending}
                      className="mt-4 bg-red-600/80 hover:bg-red-600 text-white rounded-full font-bold px-6 py-3 flex items-center gap-2 shadow-lg transition-all"
                  >
                      <XCircle className="w-5 h-5" />
                      {cancelMutation.isPending ? "Cancelando..." : "Cancelar Postulación"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Status Message Banner */}
        {application.statusMessage && (
          <div className="mb-6 p-4 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-2xl text-white">
            <p className="font-medium">{application.statusMessage}</p>
          </div>
        )}

        {/* Main White Card - All content in one block */}
        <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 md:p-8">
          <div className="space-y-8">
            
            {/* Offeror Section */}
            <section className="pb-6 border-b border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                {isCompany ? <Building2 className="w-6 h-6 text-purple-600" /> : <User className="w-6 h-6 text-purple-600" />}
                {isCompany ? "Empresa" : "Oferente"}
              </h2>
              <div className="flex items-center gap-4">
                {application.profilePhotoUrl && (
                  <img 
                    src={application.profilePhotoUrl} 
                    alt={application.offerorName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                  />
                )}
                <div>
                  <p className="text-slate-900 text-xl font-bold">{application.offerorName}</p>
                  <p className="text-slate-500 text-sm font-medium">{application.offerorUserType}</p>
                </div>
              </div>
            </section>

            {/* Offer Description */}
            <section className="pb-6 border-b border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                Descripción de la Oferta
              </h2>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-base">
                {application.description}
              </p>
            </section>

            {/* Dates and Remuneration Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
              
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Fecha de Publicación
                  </h3>
                  <p className="text-slate-900 font-medium">{formatCLDate(application.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Límite de Postulación
                  </h3>
                  <p className="text-slate-900 font-medium">{formatCLDate(application.applicationDeadline)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Fecha de Término
                  </h3>
                  <p className="text-slate-900 font-medium">{formatCLDate(application.endDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-green-50 p-4 rounded-2xl">
                <div className="bg-green-100 p-2 rounded-xl">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Remuneración
                  </h3>
                  <p className="text-slate-900 font-bold text-lg">
                    ${thousandSeparator(application.remuneration)}
                  </p>
                </div>
              </div>
            </section>

            {/* Cover Letter Section - Editable */}
            <section className="pb-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                  Tu Carta de Presentación
                </h2>
                {!isEditing && application.status?.toLowerCase() === "pendiente" && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors font-bold"
                  >
                    Editar
                  </button>
                )}
                {application.status?.toLowerCase() !== "pendiente" && !isEditing && (
                  <span className="text-xs text-slate-400 italic font-medium">
                    Solo puedes editar postulaciones pendientes
                  </span>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editedCoverLetter}
                    onChange={(e) => setEditedCoverLetter(e.target.value)}
                    placeholder="Escribe tu carta de presentación aquí..."
                    className="w-full min-h-[200px] p-4 border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y text-slate-800"
                    maxLength={1000}
                    disabled={isSaving}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {editedCoverLetter.length}/1000 caracteres
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm border-2 border-slate-300 rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50 font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveCoverLetter}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 font-bold"
                      >
                        {isSaving ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                  {application.coverLetter || "No has agregado una carta de presentación."}
                </p>
              )}
            </section>

            {/* Contact Information Section */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Mail className="w-6 h-6 text-purple-600" />
                Información de Contacto
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Primary Email */}
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                      Email
                    </h3>
                    <a 
                      href={`mailto:${application.contactEmail}`}
                      className="text-slate-900 font-medium hover:text-purple-600 transition-colors"
                    >
                      {application.contactEmail}
                    </a>
                  </div>
                </div>

                {/* Primary Phone */}
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                      Teléfono
                    </h3>
                    <a 
                      href={`tel:${application.contactPhoneNumber}`}
                      className="text-slate-900 font-medium hover:text-purple-600 transition-colors"
                    >
                      {application.contactPhoneNumber}
                    </a>
                  </div>
                </div>

                {/* Additional Email */}
                {application.additionalContactEmail && (
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                        Email Adicional
                      </h3>
                      <a 
                        href={`mailto:${application.additionalContactEmail}`}
                        className="text-slate-900 font-medium hover:text-purple-600 transition-colors"
                      >
                        {application.additionalContactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {/* Additional Phone */}
                {application.additionalContactPhoneNumber && (
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                        Teléfono Adicional
                      </h3>
                      <a 
                        href={`tel:${application.additionalContactPhoneNumber}`}
                        className="text-slate-900 font-medium hover:text-purple-600 transition-colors"
                      >
                        {application.additionalContactPhoneNumber}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <ConfirmDialog
            open={isCancelDialogOpen}
            onOpenChange={setIsCancelDialogOpen}
            onConfirm={handleCancelApplication}
            title="¿Cancelar Postulación?"
            description="Esta acción cancelará tu postulación a esta oferta. Podrás volver a postular más tarde si la oferta sigue disponible. ¿Deseas continuar?"
            confirmText="Sí, Cancelar Postulación"
            cancelText="No Cancelar"
          />
          
        </div>
      </main>
    </div>
  );
}