"use client";

import { Suspense, useEffect } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { handleApiError } from "@/lib";
import { NotificationBanner } from "@/components/ui";
import { ValidationCard, ValidationCardLoading, ValidationRowLink, ValidationListLoading, FilterBar} from "./components"
import { useNotification } from "@/hooks/common/use-notification";
import { useValidationView } from "./hooks";

export default function ValidationView() {
  const {
    pendingPublications,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    error,
    hasOffers,
    viewMode,
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
        "¡Publicación Aceptada con éxito!",
        "La oferta ha sido validada y ahora es visible para todos los usuarios.",
        "success"
      );
      router.replace("/admin/publications/validate", { scroll: false });
    }
    else if (notificationParam === "rejected") {
      show(
        "Publicación Descartada con éxito",
        "La publicación ha sido rechazada y eliminada de la lista de pendientes.",
        "error"
      );
      router.replace("/admin/publications/validate", { scroll: false });
    }
  }, [searchParams, show, router]);
  
  const apiErrorDetails = error ? handleApiError(error).details : null;
  
  const renderContent = () => {
    if (pendingPublications === null || isLoading) {
      return viewMode === "grid" ? (
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {Array.from({ length: 6 }).map((_, index) => (
            <ValidationCardLoading key={index} />
          ))}
        </section>
      ) : (
        <section className="mt-8 space-y-3 pb-20">
          {Array.from({ length: 5 }).map((_, index) => (
            <ValidationListLoading key={index} />
          ))}
        </section>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-white shadow-2xl">
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

    if (viewMode === "grid") {
      return (
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {pendingPublications.map((o: any) => (
            <ValidationCard
              key={o.id}
              itemId={o.id}
              item={o.item as any}
            />
          ))}
        </section>
      );
    }

    return (
      <section className="mt-8 space-y-3 pb-20">
        {pendingPublications.map((o: any) => (
          <ValidationRowLink
            key={o.id}
            itemId={o.id}
            item={o.item as any}
          />
        ))}
      </section>
    );
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#6D5EF7]" />}>
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

        <NotificationBanner
          data={notification}
          isVisible={isVisible}
          onClose={close}
        />

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header */}
          <header className="pt-12 pb-6 px-5">
            <div className="max-w-7xl mx-auto">
              <Link 
                href="/landing/admin" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white font-bold transition-colors mb-6 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Volver al inicio
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-5xl font-black tracking-tight mb-2">
                    Validar Publicaciones
                  </h1>
                  <p className="text-lg text-purple-200 font-medium">
                    {totalCount} {totalCount === 1 ? "publicación pendiente" : "publicaciones pendientes"}
                  </p>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex gap-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-full p-1">
                  <button
                    onClick={() => actions.setViewMode("grid")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                      viewMode === "grid"
                        ? "bg-white text-purple-900 shadow-lg"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Tarjetas</span>
                  </button>
                  <button
                    onClick={() => actions.setViewMode("list")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                      viewMode === "list"
                        ? "bg-white text-purple-900 shadow-lg"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Lista</span>
                  </button>
                </div>
              </div>

              <FilterBar
                text={filters.text}
                setText={actions.setText}
                type={filters.type as any}
                setType={actions.setType as any}
                sort={filters.sort as any}
                setSort={actions.setSort as any}
                sortOrder={filters.sortOrder}
                toggleSortOrder={actions.toggleSortOrder}
              />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-5 max-w-7xl mx-auto w-full">
            {renderContent()}
          </main>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="py-8 px-5">
              <div className="max-w-7xl mx-auto flex justify-center items-center gap-2 flex-wrap">
                {/* Previous Button */}
                <button
                  onClick={() => actions.handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-full font-bold transition-all ${
                    currentPage === 1
                      ? "bg-white/5 text-white/30 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  ←
                </button>

                {/* First Page + Left Ellipsis */}
                {currentPage > 3 && totalPages > 5 && (
                  <>
                    <button
                      onClick={() => actions.handlePageChange(1)}
                      className="px-4 py-2 rounded-full font-bold transition-all bg-white/10 text-white hover:bg-white/20"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="px-2 text-white/50">...</span>
                    )}
                  </>
                )}

                {/* Page Numbers (current ± 2) */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageOffset = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  const page = pageOffset + i;
                  
                  if (page < 1 || page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => actions.handlePageChange(page)}
                      className={`px-4 py-2 rounded-full font-bold transition-all ${
                        page === currentPage
                          ? "bg-white text-purple-900"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Right Ellipsis + Last Page */}
                {currentPage < totalPages - 2 && totalPages > 5 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="px-2 text-white/50">...</span>
                    )}
                    <button
                      onClick={() => actions.handlePageChange(totalPages)}
                      className="px-4 py-2 rounded-full font-bold transition-all bg-white/10 text-white hover:bg-white/20"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* Next Button */}
                <button
                  onClick={() => actions.handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-full font-bold transition-all ${
                    currentPage === totalPages
                      ? "bg-white/5 text-white/30 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}