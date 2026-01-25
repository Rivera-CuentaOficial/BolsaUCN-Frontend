"use client";

import { Suspense, useEffect } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { handleApiError } from "@/lib";
import { NotificationBanner } from "@/components/ui";
import { useValidationView } from "./hooks/use-validation-view";
import FilterBar from "./components/filter-bar";
import ValidationRowLink from "./components/validation-row-link";
import { useNotification } from "@/hooks/common/use-notification";
import { Skeleton } from "@/components/ui/skeleton";

function ListSkeleton() {
  return (
    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/10 border border-white/20 h-24 w-full animate-pulse">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-32 bg-white/20" />
        <Skeleton className="h-6 w-3/4 bg-white/30" />
      </div>
      <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
    </div>
  );
}

export default function ValidationView() {
  const {
    pendingPublications,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    error,
    hasOffers,
    filters,
    actions,
  } = useValidationView();

  const searchParams = useSearchParams();
  const router = useRouter();
  const { notification, isVisible, show, close } = useNotification();

  useEffect(() => {
    const notificationParam = searchParams.get("notification");
    if (notificationParam === "published") {
      show(
        "¡Publicación Aceptada con exito!",
        "La oferta ha sido validada y ahora es visible para todos los usuarios.",
        "success"
      );
      router.replace("/admin/publications/validate", { scroll: false });
    }
    else if (notificationParam === "rejected") {
      show(
        "Publicación Descartada con exito",
        "La publicación ha sido rechazada y eliminada de la lista de pendientes.",
        "error"
      );
      router.replace("/admin/publications/validate", { scroll: false });
    }
  }, [searchParams, show, router]);
  
  const apiErrorDetails = error ? handleApiError(error).details : null;
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <nav className="flex items-center justify-between text-sm gap-4 mt-8">
        <Button
          size="sm"
          variant="outline"
          onClick={() => actions.handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-white/20 text-white hover:bg-white/30 border-white/50"
        >
          <ChevronLeft size={16} /> Anterior
        </Button>

        <span className="text-white font-medium text-sm">
          Página {currentPage} de {totalPages}
        </span>

        <Button
          size="sm"
          variant="outline"
          onClick={() => actions.handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-white/20 text-white hover:bg-white/30 border-white/50"
        >
          Siguiente <ChevronRight size={16} />
        </Button>
      </nav>
    );
  };
  
  const renderContent = () => {
    if (pendingPublications === null || isLoading) {
      return (
        <section className="mt-8 grid gap-4 pb-20">
          {Array.from({ length: 5 }).map((_, index) => (
            <ListSkeleton key={index} />
          ))}
        </section>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] mx-5 text-white shadow-2xl">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-4 text-purple-300" />
            <div className="font-extrabold text-xl mb-2">
              Ups, algo salió mal
            </div>
            <div className="text-white/80 mb-4">{apiErrorDetails}</div>
            <Button
              onClick={() => actions.handleRetry()}
              className="bg-white text-purple-900 hover:bg-purple-100 rounded-full font-bold px-6"
            >
              Reintentar conexión
            </Button>
          </div>
        </div>
      );
    }

    if (!hasOffers && totalCount === 0) {
      return (
        <div className="mt-12 p-12 text-center bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 text-white shadow-xl">
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-black mb-2">¡Todo al día!</h3>
          <p className="text-lg text-purple-200">
            No hay publicaciones pendientes de revisión.
          </p>
        </div>
      );
    }

    return (
      <>
        <section className="mt-8 grid gap-4">
          {pendingPublications.map((o: any) => (
            <ValidationRowLink
              key={o.id}
              itemId={o.id}
              item={o.item as any}
            />
          ))}
        </section>
        {renderPagination()}
      </>
    );
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#6D5EF7]" />}>
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-slate-900">
        <div className="fixed inset-0 z-0">
          <img
            src="/fondo.png"
            alt="Fondo UCN"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-800/90 to-fuchsia-800/80 mix-blend-hard-light" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-950/90" />
        </div>

        <NotificationBanner
          data={notification}
          isVisible={isVisible}
          onClose={close}
        />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 pb-20">
          <header className="mb-10">
            <Link href="/admin/publications">
              <button className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10">
                <ArrowLeft className="h-4 w-4" />
                Volver al Panel
              </button>
            </Link>

            <div className="flex flex-col items-start gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg transform -rotate-1">
                <Sparkles className="w-3.5 h-3.5" /> Zona de Control
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg leading-tight mt-2">
                Validar <br className="md:hidden" /> Publicaciones
              </h1>
              <p className="text-purple-100 text-lg md:text-xl font-medium mt-3 max-w-2xl drop-shadow-md">
                Revisa y aprueba las oportunidades enviadas por la comunidad.
                Tienes{" "}
                <span className="text-yellow-300 font-black text-2xl align-middle">
                  {totalCount}
                </span>{" "}
                pendientes.
              </p>
            </div>
          </header>

          <div className="mb-8">
            <FilterBar
              text={filters.text}
              setText={actions.setText}
              type={filters.type as any}
              setType={actions.setType as any}
              sort={filters.sort as any}
              setSort={actions.setSort as any}
            />
          </div>

          {renderContent()}
        </main>
      </div>
    </Suspense>
  );
}