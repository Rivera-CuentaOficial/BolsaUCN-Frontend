"use client";

import { useState, Suspense } from "react";
import {
  useAdminReviews,
  useAdminReviewDetails,
  useHideReviewInfo,
  useDownloadSystemReviewsPdf,
} from "@/hooks/common/use-reviews";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NotificationBanner } from "@/components/ui/notification";
import { useNotification } from "@/hooks/common/use-notification";
import type { GetReviewDTO, HideReviewInfoDTO } from "@/models/responses/review";
import { Search, ArrowUpDown, ArrowRight, Download, Shield } from "lucide-react";
import { cn } from "@/lib";
import type { GetReviewsSearchParamsDTO } from "@/models/responses";

export function AdminReviewsPage() {
  // ========================================
  // Query State
  // ========================================
  const [searchParams, setSearchParams] = useState<GetReviewsSearchParamsDTO>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: "OpenUntil",
    sortOrder: "desc",
  });

  const { data: reviewsData, isLoading, error, refetch } = useAdminReviews(searchParams);

  // ========================================
  // UI State
  // ========================================
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHideModal, setShowHideModal] = useState(false);

  // Notification
  const { notification, isVisible: isNotificationVisible, show, close } = useNotification();

  // Hide form state
  const [hideOfferorReview, setHideOfferorReview] = useState(false);
  const [hideApplicantReview, setHideApplicantReview] = useState(false);
  const [offerorHideReason, setOfferorHideReason] = useState("");
  const [applicantHideReason, setApplicantHideReason] = useState("");

  // ========================================
  // Selected Review Details
  // ========================================
  const { data: reviewDetails, isLoading: isLoadingDetails } = useAdminReviewDetails(
    selectedReviewId ?? 0
  );

  // ========================================
  // Mutations
  // ========================================
  const hideReviewInfo = useHideReviewInfo();
  const downloadPdf = useDownloadSystemReviewsPdf();

  // ========================================
  // Computed Values
  // ========================================
  const reviews = reviewsData?.reviews ?? [];
  const totalPages = reviewsData?.totalPages ?? 1;

  // ========================================
  // Handlers
  // ========================================
  const openDetailsModal = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReviewId(null);
  };

  const openHideModal = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    resetHideForm();
    setShowHideModal(true);
  };

  const closeHideModal = () => {
    setShowHideModal(false);
    resetHideForm();
  };

  const resetHideForm = () => {
    setHideOfferorReview(false);
    setHideApplicantReview(false);
    setOfferorHideReason("");
    setApplicantHideReason("");
  };

  const handleHideSubmit = async () => {
    if (!selectedReviewId) return;
    if (!hideOfferorReview && !hideApplicantReview) return;

    const data: HideReviewInfoDTO = {};

    if (hideOfferorReview) {
      data.hideOfferorReviewForApplicant = true;
      data.offerorReviewHiddenReason = offerorHideReason.trim() || "Contenido inapropiado";
    }

    if (hideApplicantReview) {
      data.hideApplicantReviewForOfferor = true;
      data.applicantReviewHiddenReason = applicantHideReason.trim() || "Contenido inapropiado";
    }

    try {
      await hideReviewInfo.mutateAsync({ reviewId: selectedReviewId, data });

      show(
        "Evaluacion ocultada",
        "La informacion de la evaluacion ha sido ocultada correctamente.",
        "success"
      );

      closeHideModal();
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDownloadPdf = () => {
    downloadPdf.mutate();
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const handleStatusFilter = (status: string) => {
    setSearchParams((prev) => ({
      ...prev,
      filterByReviewStatus: status === "all" ? undefined : status,
      pageNumber: 1,
    }));
  };

  // ========================================
  // Helper Functions
  // ========================================
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border";
    const statusConfig: Record<string, { label: string; classes: string }> = {
      Pendiente: { label: "Pendiente", classes: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      OferenteEvaluoEstudiante: { label: "Oferente evaluo", classes: "bg-blue-100 text-blue-800 border-blue-200" },
      EstudianteEvaluoOferente: { label: "Postulante evaluo", classes: "bg-blue-100 text-blue-800 border-blue-200" },
      Completada: { label: "Completada", classes: "bg-green-100 text-green-700 border-green-200" },
      Cerrada: { label: "Cerrada", classes: "bg-gray-100 text-gray-700 border-gray-200" },
    };

    const config = statusConfig[status] ?? { label: status, classes: "bg-gray-100 text-gray-800 border-gray-200" };

    return (
      <span className={`${baseClasses} ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400">Sin calificacion</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5, 6].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // ========================================
  // Computed UI Values
  // ========================================
  const isViewLoading = isLoading && !reviewsData;

  // ========================================
  // Render Content
  // ========================================
  const renderContent = () => {
    if (isViewLoading) {
      return (
        <section className="mt-8 flex flex-col gap-6 pb-20">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-full relative flex items-center justify-between p-6 rounded-[2rem] bg-white shadow-xl border-4 border-transparent overflow-hidden animate-pulse h-[130px]">
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <div className="h-6 w-32 rounded-full bg-slate-200" />
                  <div className="h-6 w-20 rounded-full bg-slate-200" />
                </div>
                <div className="h-9 w-1/2 rounded-lg bg-slate-200" />
                <div className="h-4 w-40 rounded-lg bg-slate-200" />
              </div>
            </div>
          ))}
        </section>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-white shadow-2xl">
          <div className="text-center space-y-4">
            <p className="text-xl font-bold">Error al cargar las evaluaciones</p>
            <p className="text-white/80">Hubo un problema al obtener las evaluaciones</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full transition-all"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    if (reviews.length === 0) {
      return (
        <div className="mt-12 p-12 text-center bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 text-white shadow-xl w-full">
          <div className="space-y-4">
            <p className="text-2xl font-black">No hay evaluaciones</p>
            <p className="text-white/80">
              No hay evaluaciones que coincidan con los filtros seleccionados.
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <section className="mt-8 flex flex-col gap-6 pb-12 w-full">
          {reviews.map((review) => (
            <article
              key={review.reviewId}
              onClick={() => openDetailsModal(review.reviewId)}
              className={cn(
                "group relative flex items-center justify-between p-6 rounded-[2rem] transition-all duration-300 cursor-pointer w-full",
                "bg-white text-slate-800 shadow-xl",
                "hover:scale-[1.01] hover:shadow-2xl hover:bg-white",
                "border-4 border-transparent hover:border-purple-300"
              )}
            >
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div>{getStatusBadge(review.reviewStatus)}</div>
                  {review.hasReviewBeenActionedByAdmin && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Moderada
                    </span>
                  )}
                </div>

                <h3 className="font-black text-2xl md:text-3xl text-slate-900 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all mb-1">
                  {review.jobOfferTitle}
                </h3>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Postulante:</span> {review.applicantFullName}
                  </p>
                  <p>
                    <span className="font-medium">Oferente:</span> {review.offerorFullName}
                  </p>
                  <p>
                    <span className="font-medium">Fecha de cierre:</span> {new Date(review.openUntil).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID de Evaluacion: #{review.reviewId}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 pl-6 border-l border-slate-100">
                <ArrowRight className="text-slate-400 w-6 h-6 group-hover:text-white transition-colors duration-300" />
              </div>
            </article>
          ))}
        </section>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            {renderPagination()}
          </div>
        )}
      </>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 flex-wrap">
        <button
          onClick={() => handlePageChange(searchParams.pageNumber - 1)}
          disabled={searchParams.pageNumber === 1}
          className={`px-4 py-2 rounded-full font-bold transition-all ${searchParams.pageNumber === 1
            ? "bg-white/5 text-white/30 cursor-not-allowed"
            : "bg-white/10 text-white hover:bg-white/20"
            }`}
        >
          ←
        </button>

        {searchParams.pageNumber > 3 && totalPages > 5 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-2 rounded-full font-bold transition-all bg-white/10 text-white hover:bg-white/20"
            >
              1
            </button>
            {searchParams.pageNumber > 4 && <span className="px-2 text-white/50">...</span>}
          </>
        )}

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageOffset = Math.max(1, Math.min(searchParams.pageNumber - 2, totalPages - 4));
          const page = pageOffset + i;
          if (page < 1 || page > totalPages) return null;

          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${page === searchParams.pageNumber
                ? "bg-white text-purple-900"
                : "bg-white/10 text-white hover:bg-white/20"
                }`}
            >
              {page}
            </button>
          );
        })}

        {searchParams.pageNumber < totalPages - 2 && totalPages > 5 && (
          <>
            {searchParams.pageNumber < totalPages - 3 && <span className="px-2 text-white/50">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-2 rounded-full font-bold transition-all bg-white/10 text-white hover:bg-white/20"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(searchParams.pageNumber + 1)}
          disabled={searchParams.pageNumber === totalPages}
          className={`px-4 py-2 rounded-full font-bold transition-all ${searchParams.pageNumber === totalPages
            ? "bg-white/5 text-white/30 cursor-not-allowed"
            : "bg-white/10 text-white hover:bg-white/20"
            }`}
        >
          →
        </button>
      </div>
    );
  };

  // ========================================
  // Render
  // ========================================
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

        <NotificationBanner data={notification} isVisible={isNotificationVisible} onClose={close} />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                Administracion de Evaluaciones
              </h1>
              <p className="text-white/80 text-lg">
                Gestiona y modera las evaluaciones del sistema
              </p>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadPdf.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full transition-all disabled:opacity-50 border border-white/30"
            >
              <Download className="w-4 h-4" />
              {downloadPdf.isPending ? "Generando..." : "Descargar PDF"}
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="relative group">
                <label className="block text-sm font-bold text-white mb-2">
                  Estado
                </label>
                <select
                  value={searchParams.filterByReviewStatus ?? "all"}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60 rounded-full px-5 py-3.5 text-sm font-bold focus:bg-white focus:text-purple-900 focus:placeholder:text-purple-300 focus:ring-4 focus:ring-white/20 transition-all outline-none shadow-lg hover:bg-white/20"
                >
                  <option value="all" className="text-slate-800">Todos</option>
                  <option value="Pendiente" className="text-slate-800">Pendientes</option>
                  <option value="Completada" className="text-slate-800">Completadas</option>
                  <option value="Cerrada" className="text-slate-800">Cerradas</option>
                </select>
              </div>

              <div className="relative group">
                <label className="block text-sm font-bold text-white mb-2">
                  Ordenar por
                </label>
                <select
                  value={searchParams.sortBy}
                  onChange={(e) =>
                    setSearchParams((prev) => ({ ...prev, sortBy: e.target.value }))
                  }
                  className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60 rounded-full px-5 py-3.5 text-sm font-bold focus:bg-white focus:text-purple-900 focus:placeholder:text-purple-300 focus:ring-4 focus:ring-white/20 transition-all outline-none shadow-lg hover:bg-white/20"
                >
                  <option value="OpenUntil" className="text-slate-800">Fecha limite</option>
                  <option value="JobOfferTitle" className="text-slate-800">Titulo del trabajo</option>
                </select>
              </div>

              <button
                onClick={() =>
                  setSearchParams((prev) => ({ ...prev, sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" }))
                }
                className="w-full h-[53px] bg-white/20 text-white hover:bg-white/30 border-white/50 text-sm font-black rounded-full flex items-center justify-center gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                {searchParams.sortOrder === "asc" ? "Ascendente" : "Descendente"}
              </button>

              <button
                onClick={() => {
                  setSearchParams({
                    pageNumber: 1,
                    pageSize: 10,
                    sortBy: "OpenUntil",
                    sortOrder: "desc",
                  });
                }}
                className="w-full h-[53px] bg-white/20 text-white hover:bg-white/30 border-white/50 text-sm font-black rounded-full"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </main>
      </div>

      {/* Details Modal */}
      {showDetailsModal && reviewDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Detalles de la Evaluacion #{reviewDetails.reviewId}</h2>
                <div className="mt-2 inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-md">
                  <p className="text-xs font-bold uppercase tracking-wide">Abierta hasta</p>
                  <p className="text-sm font-black">
                    {new Date(reviewDetails.openUntil).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                x
              </button>
            </div>

            <div className="space-y-6">
              {/* Job Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">{reviewDetails.jobOfferTitle}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Postulante:</span>
                    <p className="font-medium">{reviewDetails.applicantFullName}</p>
                    <p className="text-xs text-gray-500">ID: {reviewDetails.applicantId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Oferente:</span>
                    <p className="font-medium">{reviewDetails.offerorFullName}</p>
                    <p className="text-xs text-gray-500">ID: {reviewDetails.offerorId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Estado:</span>
                    <p>{getStatusBadge(reviewDetails.reviewStatus)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Trabajo ID:</span>
                    <p className="font-medium">{reviewDetails.jobOfferId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Postulacion ID:</span>
                    <p className="font-medium">{reviewDetails.applicationId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Abierta hasta:</span>
                    <p className="font-medium">
                      {new Date(reviewDetails.openUntil).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Offeror's Review */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  Evaluacion del Oferente hacia el Postulante
                  {reviewDetails.isOfferorReviewForApplicantHidden && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Oculta
                    </span>
                  )}
                </h4>
                {reviewDetails.offerorRatingOfApplicant ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Calificacion:</span>
                      {renderStars(reviewDetails.offerorRatingOfApplicant)}
                    </div>
                    <div>
                      <span className="text-gray-600">Comentario:</span>
                      <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded">
                        {reviewDetails.offerorCommentForApplicant || "Sin comentario"}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className={reviewDetails.isOnTime ? "text-green-600" : "text-gray-400"}>
                        {reviewDetails.isOnTime ? "Puntual" : "No puntual"}
                      </span>
                      <span className={reviewDetails.isPresentable ? "text-green-600" : "text-gray-400"}>
                        {reviewDetails.isPresentable ? "Buena presentacion" : "Presentacion regular"}
                      </span>
                      <span className={reviewDetails.isRespectful ? "text-green-600" : "text-gray-400"}>
                        {reviewDetails.isRespectful ? "Respetuoso" : "Poco respetuoso"}
                      </span>
                    </div>
                    {reviewDetails.offerorReviewCompletedAt && (
                      <p className="text-xs text-gray-500">
                        Completada: {new Date(reviewDetails.offerorReviewCompletedAt).toLocaleString("es-CL")}
                      </p>
                    )}
                    {reviewDetails.isOfferorReviewForApplicantHidden && reviewDetails.offerorReviewHiddenAt && (
                      <p className="text-xs text-amber-600">
                        Ocultada: {new Date(reviewDetails.offerorReviewHiddenAt).toLocaleString("es-CL")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Aun no ha evaluado</p>
                )}
              </div>

              {/* Applicant's Review */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  Evaluacion del Postulante hacia el Oferente
                  {reviewDetails.isApplicantReviewForOfferorHidden && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Oculta
                    </span>
                  )}
                </h4>
                {reviewDetails.applicantRatingOfOfferor ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Calificacion:</span>
                      {renderStars(reviewDetails.applicantRatingOfOfferor)}
                    </div>
                    <div>
                      <span className="text-gray-600">Comentario:</span>
                      <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded">
                        {reviewDetails.applicantCommentForOfferor || "Sin comentario"}
                      </p>
                    </div>
                    {reviewDetails.applicantReviewCompletedAt && (
                      <p className="text-xs text-gray-500">
                        Completada: {new Date(reviewDetails.applicantReviewCompletedAt).toLocaleString("es-CL")}
                      </p>
                    )}
                    {reviewDetails.isApplicantReviewForOfferorHidden && reviewDetails.applicantReviewHiddenAt && (
                      <p className="text-xs text-amber-600">
                        Ocultada: {new Date(reviewDetails.applicantReviewHiddenAt).toLocaleString("es-CL")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Aun no ha evaluado</p>
                )}
              </div>

              {/* Closed info */}
              {reviewDetails.reviewClosedAt && (
                <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600">
                  Evaluacion cerrada el {new Date(reviewDetails.reviewClosedAt).toLocaleString("es-CL")}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              {(reviewDetails.offerorRatingOfApplicant || reviewDetails.applicantRatingOfOfferor) && (
                <button
                  onClick={() => {
                    closeDetailsModal();
                    openHideModal(reviewDetails.reviewId);
                  }}
                  className="px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50"
                >
                  Moderar
                </button>
              )}
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide Modal */}
      {showHideModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Moderar Evaluacion</h2>
              <button
                onClick={closeHideModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                x
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Selecciona que partes de la evaluacion deseas ocultar. Esta accion no se puede deshacer.
            </p>

            <div className="space-y-6">
              {/* Hide Offeror Review */}
              <div className="border rounded-lg p-4">
                {!reviewDetails?.isOfferorReviewForApplicantHidden ? (
                <label className={`flex items-center gap-3 ${reviewDetails?.offerorRatingOfApplicant ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} mb-3`}>
                  <input
                    type="checkbox"
                    checked={hideOfferorReview}
                    onChange={(e) => setHideOfferorReview(e.target.checked)}
                    disabled={!reviewDetails?.offerorRatingOfApplicant}
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 disabled:cursor-not-allowed"
                  />
                  <span className="font-medium">Ocultar evaluacion del oferente</span>
                </label>
                ) : <p className="text-sm text-gray-500 mb-2">La evaluacion del oferente ya esta oculta</p> }

                {!reviewDetails?.offerorRatingOfApplicant && (
                  <p className="text-sm text-gray-500 mb-2">El oferente aun no ha enviado su evaluacion</p>
                )}
                {hideOfferorReview && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Razon (opcional)
                    </label>
                    <input
                      type="text"
                      value={offerorHideReason}
                      onChange={(e) => setOfferorHideReason(e.target.value)}
                      placeholder="Contenido inapropiado"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Hide Applicant Review */}
              <div className="border rounded-lg p-4">
                {!reviewDetails?.isApplicantReviewForOfferorHidden ? (
                <label className={`flex items-center gap-3 ${reviewDetails?.applicantRatingOfOfferor ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} mb-3`}>
                  <input
                    type="checkbox"
                    checked={hideApplicantReview}
                    onChange={(e) => setHideApplicantReview(e.target.checked)}
                    disabled={!reviewDetails?.applicantRatingOfOfferor}
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 disabled:cursor-not-allowed"
                  />
                  <span className="font-medium">Ocultar evaluacion del postulante</span>
                </label>
                ) : <p className="text-sm text-gray-500 mb-2">La evaluacion del postulante ya esta oculta</p> }
                {!reviewDetails?.applicantRatingOfOfferor && (
                  <p className="text-sm text-gray-500 mb-2">El postulante aun no ha enviado su evaluacion</p>
                )}
                {hideApplicantReview && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Razon (opcional)
                    </label>
                    <input
                      type="text"
                      value={applicantHideReason}
                      onChange={(e) => setApplicantHideReason(e.target.value)}
                      placeholder="Contenido inapropiado"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={closeHideModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleHideSubmit}
                disabled={(!hideOfferorReview && !hideApplicantReview) || hideReviewInfo.isPending}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hideReviewInfo.isPending ? "Procesando..." : "Ocultar Seleccionados"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
}