"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Clock,
  DollarSign,
  Tag,
  Package,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError, cn, isLoggedIn, getUserFromToken } from "@/lib";
import { useGetBuySellDetails } from "@/hooks/api/use-buysell-details";
import type { BuySellDetailsForApplicant, BuySellDetailsForPublic } from "@/models/responses";

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

export default function BuySellDetailPage() {
  const params = useParams();
  const router = useRouter();
  const publicationId = parseInt(params.id as string);
  const [logged, setLogged] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    data: buySell,
    isFetching: isLoading,
    error: apiError,
  } = useGetBuySellDetails(publicationId, !shouldFetchAuthenticated);

  // Type guard to check if it's authenticated buySell details
  const isAuthenticatedBuySell = (
    buySell: BuySellDetailsForPublic | BuySellDetailsForApplicant | undefined
  ): buySell is BuySellDetailsForApplicant => {
    return buySell ? "chosenContactEmail" in buySell : false;
  };

  const authenticatedBuySell = isAuthenticatedBuySell(buySell) ? buySell : null;
  
  // Only students can see full details
  const canSeeFullDetails = userType === "Estudiante";

  const images = buySell?.imageUrls || [];
  const hasImages = images.length > 0;

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-5xl">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-12 bg-white/20 rounded-3xl w-48" />
            <Skeleton className="h-96 bg-white/20 rounded-3xl" />
            <Skeleton className="h-64 bg-white/20 rounded-3xl" />
          </div>
        </main>
      </div>
    );
  }

  if (apiError || !buySell) {
    const errorDetails = apiError
      ? handleApiError(apiError).details
      : "No se pudo cargar la publicación";

    return (
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-5xl">
          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-purple-300" />
            <h2 className="text-3xl font-black mb-4">Error</h2>
            <p className="text-lg mb-6">{errorDetails}</p>
            <Link href="/offers?exploreType=buysells">
              <Button className="bg-white text-purple-900 hover:bg-purple-100 rounded-full font-bold px-6">
                Volver a Compra/Venta
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-ucn-purple">

      <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-6xl">
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
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30 bg-cyan-500/30 text-white text-xs font-black uppercase tracking-wider shadow-lg">
              <ShoppingBag className="w-4 h-4" />
              {buySell.category}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight">
              {buySell.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-purple-100 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="font-medium">Por: {buySell.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">
                  {formatDate(buySell.createdAt)}
                </span>
              </div>
              {authenticatedBuySell && authenticatedBuySell.isAvailable && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/30 border border-green-400/50">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold">Disponible</span>
                </div>
              )}
              {authenticatedBuySell && !authenticatedBuySell.isAvailable && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/30 border border-red-400/50">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-bold">No disponible</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main White Card */}
        <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Image Gallery Section */}
          {hasImages && (
            <div className="relative w-full bg-slate-100">
              <div className="relative w-full aspect-video md:aspect-[21/9]">
                <Image
                  src={images[currentImageIndex]}
                  alt={`${buySell.title} - Imagen ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority={currentImageIndex === 0}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/generic.png";
                  }}
                />
              </div>

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="w-6 h-6 text-slate-900" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="w-6 h-6 text-slate-900" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          index === currentImageIndex
                            ? "bg-white w-8"
                            : "bg-white/50 hover:bg-white/75"
                        )}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-slate-900/75 backdrop-blur-sm text-white text-xs font-bold">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          )}

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                      index === currentImageIndex
                        ? "border-purple-500 ring-2 ring-purple-200"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`Miniatura ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/generic.png";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Key Info Section */}
          <div className="p-6 md:p-8 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Descripción
              </h2>
              <div className="prose max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-base">
                  {buySell.description}
                </p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-100">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Precio</p>
                  <p className="text-lg font-black text-slate-900">
                    {formatCurrency(buySell.price)}
                  </p>
                </div>
              </div>

              {/* Condition */}
              {authenticatedBuySell && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-100">
                    <Tag className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Estado</p>
                    <p className="text-lg font-black text-slate-900">
                      {authenticatedBuySell.condition}
                    </p>
                  </div>
                </div>
              )}

              {/* Quantity */}
              {authenticatedBuySell && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Cantidad
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {authenticatedBuySell.quantity}
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              {authenticatedBuySell && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Ubicación
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {authenticatedBuySell.location}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Info (only if authenticated as student) */}
            {authenticatedBuySell && canSeeFullDetails && (
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-xl font-black text-slate-900 mb-4">
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {authenticatedBuySell.chosenContactEmail && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                      <Mail className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-xs font-medium text-slate-600">
                          Email
                        </p>
                        <a
                          href={`mailto:${authenticatedBuySell.chosenContactEmail}`}
                          className="text-sm font-bold text-indigo-600 hover:underline break-all"
                        >
                          {authenticatedBuySell.chosenContactEmail}
                        </a>
                      </div>
                    </div>
                  )}
                  {authenticatedBuySell.chosenContactPhoneNumber && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                      <Phone className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-xs font-medium text-slate-600">
                          Teléfono
                        </p>
                        <a
                          href={`tel:${authenticatedBuySell.chosenContactPhoneNumber}`}
                          className="text-sm font-bold text-indigo-600 hover:underline"
                        >
                          {authenticatedBuySell.chosenContactPhoneNumber}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If not logged in or not a student - show message */}
            {(!logged || !canSeeFullDetails) && (
              <div className="pt-6 border-t border-slate-200">
                <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-purple-900 mb-1">
                        Inicia sesión para ver la información de contacto
                      </p>
                      <p className="text-xs text-purple-700 mb-4">
                        Necesitas una cuenta de estudiante para ver los detalles
                        completos y contactar al vendedor.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() =>
                            router.push(
                              `/auth/login?returnTo=/buysells/${publicationId}`
                            )
                          }
                          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                        >
                          Iniciar Sesión
                        </Button>
                        <Button
                          onClick={() =>
                            router.push(
                              `/auth/register?returnTo=/buysells/${publicationId}`
                            )
                          }
                          className="px-6 py-2.5 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                        >
                          Registrarse
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
