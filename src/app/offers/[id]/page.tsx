"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError, cn, isLoggedIn, getUserFromToken } from "@/lib";
import { useGetOfferDetails } from "@/hooks/api/use-offer-details";
import { applicationService } from "@/services/applicationService";
import { cvService } from "@/services/cvService";
import { toast } from "sonner";
import type { OfferDetailsForApplicant, OfferDetailsForPublic } from "@/models/responses";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-CL", {
    month: "short",
    day: "numeric",
  });
};

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const publicationId = parseInt(params.id as string);
  const [logged, setLogged] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [hasCV, setHasCV] = useState(false);
  const [checkingCV, setCheckingCV] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const loggedIn = isLoggedIn();
    setLogged(loggedIn);
    
    if (loggedIn) {
      const user = getUserFromToken();
      setUserType(user?.userType || null);
    }
  }, []);

  // Only fetch authenticated endpoint if user is a student
  const shouldFetchAuthenticated = logged && userType === "Estudiante";

  const {
    data: offer,
    isFetching: isLoading,
    error: apiError,
    refetch,
  } = useGetOfferDetails(publicationId, !shouldFetchAuthenticated);

  // Type guard to check if it's authenticated offer details
  const isAuthenticatedOffer = (
    offer: OfferDetailsForPublic | OfferDetailsForApplicant | undefined
  ): offer is OfferDetailsForApplicant => {
    return offer ? "hasApplied" in offer : false;
  };

  const authenticatedOffer = isAuthenticatedOffer(offer) ? offer : null;
  const isVolunteer = offer?.offerType === "Voluntariado";
  
  // Only students can apply
  const canApply = userType === "Estudiante";

  // Update hasApplied when data changes
  useEffect(() => {
    if (authenticatedOffer) {
      setHasApplied(authenticatedOffer.hasApplied);
    }
  }, [authenticatedOffer]);

    useEffect(() => {
    const checkCV = async () => {
      if (!logged || !canApply || !offer?.isCVRequired) {
        return;
      }
      const user = getUserFromToken();
      if (!user?.userId) return;
      setCheckingCV(true);
      try {
        const response = await cvService.hasCV();
        setHasCV(response.data?.hasCV === true);
      } catch (e) {
        setHasCV(false);
      } finally {
        setCheckingCV(false);
      }
    };

    checkCV();
  }, [logged, canApply, offer?.isCVRequired]);

  const handleUploadCV = async () => {
    if (!cvFile) {
      toast.error("Selecciona un archivo primero");
      return;
    }

    setUploadingCV(true);
    try {
      await cvService.uploadCV(cvFile);
      toast.success("CV subido exitosamente");
      setCvFile(null);
      setHasCV(true);
    } catch (e: any) {
      const errorMsg = e?.response?.data?.details || "No se pudo subir el CV";
      toast.error(errorMsg);
    } finally {
      setUploadingCV(false);
    }
  };

  const handleApplyClick = () => {
    if (!logged) {
      // Redirect to login with return URL
      router.push(
        `/auth/login?returnTo=/offers/${publicationId}&msg=${encodeURIComponent(
          "Debes iniciar sesión para postular a esta oferta"
        )}`
      );
      return;
    }

    // If logged in, proceed with application
    handleApply();
  };

  const handleApply = async () => {
    if (!canApply) {
      toast.error("Solo los estudiantes pueden postular a ofertas");
      return;
    }

    if (hasApplied || (authenticatedOffer && authenticatedOffer.hasApplied)) {
      toast.info("Ya has postulado a esta oferta");
      return;
    }

    setApplyLoading(true);
    const toastId = toast.loading("Enviando postulación...");

    try {
      await applicationService.applyToOffer(publicationId, coverLetter.trim() || null);

      toast.dismiss(toastId);
      toast.success("¡Postulación enviada exitosamente!", {
        description: "Se te notificará cuando tu postulación sea revisada.",
      });

      setCoverLetter("");
      setHasApplied(true);

      // Refetch to get updated data
      refetch();
    } catch (e: any) {
      toast.dismiss(toastId);

      const raw =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo postular. Intenta más tarde.";

      const status = e?.response?.status;

      if (status === 409 || /ya has postulado/i.test(raw)) {
        setHasApplied(true);
        toast.info("Ya estás postulado", {
          description: "Ya tienes una postulación activa para esta oferta.",
        });
      } else if (/se requiere un cv/i.test(raw) || /cv requerido/i.test(raw)) {
        toast.error("CV requerido", {
          description: "Esta oferta requiere que tengas un CV cargado.",
        });
      } else if (/reseñas pendientes/i.test(raw)) {
        toast.error("Reseñas pendientes", {
          description: raw,
        });
      } else {
        toast.error("Error al postular", {
          description: raw,
        });
      }
    } finally {
      setApplyLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-5xl">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-12 bg-white/20 rounded-3xl w-48" />
            <Skeleton className="h-64 bg-white/20 rounded-3xl" />
          </div>
        </main>
      </div>
    );
  }

  if (apiError || !offer) {
    const errorDetails = apiError
      ? handleApiError(apiError).details
      : "No se pudo cargar la oferta";

    return (
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-5xl">
          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-purple-300" />
            <h2 className="text-3xl font-black mb-4">Error</h2>
            <p className="text-lg mb-6">{errorDetails}</p>
            <Link href="/offers">
              <Button className="bg-white text-purple-900 hover:bg-purple-100 rounded-full font-bold px-6">
                Volver a Ofertas
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const hasAppliedToOffer =
    hasApplied || (authenticatedOffer?.hasApplied ?? false);

  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-ucn-purple">

      <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <Button
            onClick={() => router.back()}
            className="cursor-pointer mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <div className="flex flex-col gap-3">
            {/* Type Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full",
                "backdrop-blur-md border border-white/30",
                "text-white text-xs font-black uppercase tracking-wider shadow-lg",
                isVolunteer ? "bg-purple-500/30" : "bg-indigo-500/30"
              )}
            >
              {isVolunteer ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <Briefcase className="w-4 h-4" />
              )}
              {offer.offerType}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight">
              {offer.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-purple-100 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">Por: {offer.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">
                  {formatDate(offer.createdAt)}
                </span>
              </div>
              {authenticatedOffer && authenticatedOffer.availableSlots > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/50">
                  <Users className="w-4 h-4" />
                  <span className="font-bold">
                    {authenticatedOffer.availableSlots}{" "}
                    {authenticatedOffer.availableSlots === 1
                      ? "cupo disponible"
                      : "cupos disponibles"}
                  </span>
                </div>
              )}
              {hasAppliedToOffer && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/30 border border-green-400/50">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold">Ya postulaste</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main White Card */}
        <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Key Info Section */}
          <div className="p-6 md:p-8 border-b border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Remuneration */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-100">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Remuneración
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    {isVolunteer || offer.remuneration === 0
                      ? "Voluntariado"
                      : formatCurrency(offer.remuneration)}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Ubicación
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    {offer.location}
                  </p>
                </div>
              </div>

              {/* Deadline (if authenticated) */}
              {authenticatedOffer && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Fecha límite
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {formatShortDate(authenticatedOffer.applicationDeadline)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Descripción
              </h2>
              <div className="prose max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-base">
                  {offer.description}
                </p>
              </div>
            </div>

            {/* Contact Info (only if authenticated as student) */}
            {authenticatedOffer && canApply && (
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-xl font-black text-slate-900 mb-4">
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                    <Mail className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        Email
                      </p>
                      <a
                        href={`mailto:${authenticatedOffer.contactEmail}`}
                        className="text-sm font-bold text-indigo-600 hover:underline"
                      >
                        {authenticatedOffer.contactEmail}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                    <Phone className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        Teléfono
                      </p>
                      <a
                        href={`tel:${authenticatedOffer.contactPhoneNumber}`}
                        className="text-sm font-bold text-indigo-600 hover:underline"
                      >
                        {authenticatedOffer.contactPhoneNumber}
                      </a>
                    </div>
                  </div>
                  {authenticatedOffer.additionalContactEmail && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                      <Mail className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-xs font-medium text-slate-600">
                          Email adicional
                        </p>
                        <a
                          href={`mailto:${authenticatedOffer.additionalContactEmail}`}
                          className="text-sm font-bold text-indigo-600 hover:underline"
                        >
                          {authenticatedOffer.additionalContactEmail}
                        </a>
                      </div>
                    </div>
                  )}
                  {authenticatedOffer.additionalContactPhoneNumber && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                      <Phone className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-xs font-medium text-slate-600">
                          Teléfono adicional
                        </p>
                        <a
                          href={`tel:${authenticatedOffer.additionalContactPhoneNumber}`}
                          className="text-sm font-bold text-indigo-600 hover:underline"
                        >
                          {authenticatedOffer.additionalContactPhoneNumber}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Application Section - Only for students or non-logged users */}
            {(canApply || !logged) && (
              <div className="pt-6 border-t border-slate-200 space-y-6">
                <h3 className="text-xl font-black text-slate-900">
                  {hasAppliedToOffer
                    ? "Tu Postulación"
                    : logged
                    ? "Postular a esta oferta"
                    : "Postular"}
                </h3>

                {/* If already applied */}
                {hasAppliedToOffer && (
                  <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-900">
                          Ya has postulado a esta oferta
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Puedes revisar el estado de tu postulación en tu{" "}
                          <Link
                            href="/jobs/history"
                            className="underline font-bold hover:text-green-900"
                          >
                            historial de postulaciones
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* If logged in as student and not applied yet */}
                {logged && canApply && !hasAppliedToOffer && (
                  <>
                    {/* Cover Letter */}
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-900">
                        Carta de presentación (opcional)
                      </label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Cuéntanos por qué te interesa esta oportunidad..."
                        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 min-h-[120px] resize-y transition-all"
                        maxLength={1000}
                      />
                      <p className="text-xs text-slate-600">
                        {coverLetter.length}/1000 caracteres
                      </p>
                    </div>

                    {/* CV Upload (if required) */}
                    {offer.isCVRequired && (
                      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-blue-900">
                              Esta oferta requiere CV
                            </p>
                            {checkingCV ? (
                              <p className="text-xs text-blue-700 mt-1">
                                Verificando tu CV...
                              </p>
                            ) : hasCV ? (
                              <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Ya tienes un CV cargado en tu perfil
                              </p>
                            ) : (
                              <p className="text-xs text-blue-700 mt-1">
                                Asegúrate de tener tu CV cargado en tu perfil, o
                                súbelo aquí.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Only show upload UI if user doesn't have CV */}
                        {!hasCV && !checkingCV && (
                          <>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-blue-300 bg-white px-4 py-2.5 text-sm font-bold text-blue-900 hover:bg-blue-50 transition">
                                Seleccionar CV
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) =>
                                    setCvFile(e.target.files?.[0] ?? null)
                                  }
                                  className="hidden"
                                />
                              </label>

                              {cvFile && (
                                <>
                                  <span className="text-sm text-blue-900 truncate font-medium">
                                    {cvFile.name}
                                  </span>
                                  <button
                                    onClick={handleUploadCV}
                                    disabled={uploadingCV}
                                    className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-bold"
                                  >
                                    {uploadingCV ? "Subiendo..." : "Subir CV"}
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}

                        <p className="text-xs text-blue-700">
                          También puedes gestionar tu CV en{" "}
                          <Link
                            href="/profile"
                            className="underline font-bold hover:text-blue-900"
                          >
                            tu perfil
                          </Link>
                          .
                        </p>
                      </div>
                    )}

                    {/* Apply Button */}
                    <Button
                      onClick={handleApply}
                      disabled={applyLoading}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {applyLoading ? "Enviando..." : "Enviar Postulación"}
                    </Button>
                  </>
                )}

                {/* If not logged in - show apply button that triggers login */}
                {!logged && !hasAppliedToOffer && (
                  <div className="space-y-4">
                    <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-purple-900 mb-1">
                            Inicia sesión para postular
                          </p>
                          <p className="text-xs text-purple-700">
                            Necesitas una cuenta de estudiante para postular a
                            esta oferta. Inicia sesión o regístrate para
                            continuar.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleApplyClick}
                        className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        Iniciar Sesión y Postular
                      </Button>
                      <Button
                        onClick={() =>
                          router.push(
                            `/auth/register?returnTo=/offers/${publicationId}`
                          )
                        }
                        className="flex-1 px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        Registrarse
                      </Button>
                    </div>
                  </div>
                )}

                {/* If logged in but not a student */}
                {logged && !canApply && (
                  <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-orange-900">
                          Solo estudiantes pueden postular
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Esta funcionalidad está disponible únicamente para
                          cuentas de estudiante.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}