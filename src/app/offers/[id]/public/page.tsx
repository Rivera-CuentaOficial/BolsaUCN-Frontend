// frontend/src/app/offers/[id]/public/page.tsx (REPLACE ENTIRE FILE)

"use client";

import { useEffect } from "react";
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
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError, cn, isLoggedIn } from "@/lib";
import { useGetOfferDetails } from "@/hooks/api/use-offer-details";

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

export default function OfferDetailPublicPage() {
  const params = useParams();
  const router = useRouter();
  const publicationId = parseInt(params.id as string);

  // Redirect authenticated users to the regular page
  useEffect(() => {
    if (isLoggedIn()) {
      router.replace(`/offers/${publicationId}`);
    }
  }, [publicationId, router]);

  // Force public view
  const {
    data: offer,
    isFetching: isLoading,
    error: apiError,
  } = useGetOfferDetails(publicationId, true);

  const isVolunteer = offer?.offerType === "Voluntariado";

  // Show loading while checking auth or fetching data
  if (isLoading || isLoggedIn()) {
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
            </div>
          </div>
        </header>

        {/* Main White Card */}
        <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Key Info Section */}
          <div className="p-6 md:p-8 border-b border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

            {/* Login Prompt */}
            <div className="pt-6 border-t border-slate-200">
              <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-purple-900 mb-2">
                      Inicia sesión para ver más detalles
                    </p>
                    <p className="text-xs text-purple-700 mb-4">
                      Debes iniciar sesión como estudiante para ver información
                      de contacto, fechas límite y postular a esta oferta.
                    </p>
                    <Link
                      href={`/auth/login?returnTo=/offers/${publicationId}`}
                    >
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold px-6">
                        Iniciar Sesión
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}