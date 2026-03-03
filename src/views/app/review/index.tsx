"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useMyReviews, useMyReviewDetails, useSubmitApplicantReview, useSubmitOfferorReview, useDownloadMyReviewsPdf } from "@/hooks/common/use-reviews";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NotificationBanner } from "@/components/ui/notification";
import { useNotification } from "@/hooks/common/use-notification";
import type { MyReviewDTO, MyReviewDetailsDTO, ApplicantReviewForOfferorDTO, OfferorReviewForApplicantDTO } from "@/models/responses";
import { getUserFromToken } from "@/lib/auth";
import { cn } from "@/lib";
import { Search, ArrowUpDown, ArrowRight } from "lucide-react";

// Role within a specific review (not system role)
type ReviewRole = "applicant" | "offeror" | null;

export function ReviewsPage() {
  // ========================================
  // Current User ID
  // ========================================
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const user = getUserFromToken();
    if (user?.userId) {
      setCurrentUserId(Number(user.userId));
    }
  }, []);

  // ========================================
  // Query State
  // ========================================
  const [searchParams, setSearchParams] = useState({
    pageNumber: 1,
    pageSize: 10,
    sortOrder: "desc",
    publicationTitle: undefined as string | undefined,
    reviewStatus: undefined as string | undefined,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const { data: reviewsData, isLoading, error, refetch } = useMyReviews(searchParams);

  // ========================================
  // UI State
  // ========================================
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Notification
  const { notification, isVisible: isNotificationVisible, show, close } = useNotification();

  // Form state for applicant review (when user is the applicant)
  const [applicantComment, setApplicantComment] = useState("");
  const [applicantRating, setApplicantRating] = useState(0);

  // Form state for offeror review (when user is the offeror)
  const [offerorComment, setOfferorComment] = useState("");
  const [offerorRating, setOfferorRating] = useState(0);
  const [isOnTime, setIsOnTime] = useState(false);
  const [isPresentable, setIsPresentable] = useState(false);
  const [isRespectful, setIsRespectful] = useState(false);

  const MAX_COMMENT_LENGTH = 500;

  // ========================================
  // Selected Review Details
  // ========================================
  const { data: reviewDetails, isLoading: isLoadingDetails } = useMyReviewDetails(
    selectedReviewId ?? 0
  );

  // ========================================
  // Determine user's role within the selected review
  // ========================================
  const getReviewRole = (details: MyReviewDetailsDTO | undefined): ReviewRole => {
    if (!details || !currentUserId) return null;

    if (details.applicantId === currentUserId) {
      return "applicant";
    }
    if (details.offerorId === currentUserId) {
      return "offeror";
    }
    return null;
  };

  const selectedReviewRole = useMemo(() => {
    return getReviewRole(reviewDetails);
  }, [reviewDetails, currentUserId]);

  // ========================================
  // Mutations
  // ========================================
  const submitApplicantReview = useSubmitApplicantReview();
  const submitOfferorReview = useSubmitOfferorReview();
  const downloadPdf = useDownloadMyReviewsPdf();

  // ========================================
  // Computed Values
  // ========================================
  const reviews = reviewsData?.reviews ?? [];
  const totalPages = reviewsData?.totalPages ?? 1;

  const canSubmitApplicantReview = useMemo(() => {
    return applicantComment.trim().length > 0 &&
      applicantComment.length <= MAX_COMMENT_LENGTH &&
      applicantRating > 0;
  }, [applicantComment, applicantRating]);

  const canSubmitOfferorReview = useMemo(() => {
    return offerorComment.trim().length > 0 &&
      offerorComment.length <= MAX_COMMENT_LENGTH &&
      offerorRating > 0;
  }, [offerorComment, offerorRating]);

  // ========================================
  // Handlers
  // ========================================
  const openDetailsModal = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    resetForm();
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReviewId(null);
    resetForm();
  };

  const openReviewModal = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    resetForm();
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedReviewId(null);
    resetForm();
  };

  const resetForm = () => {
    setApplicantComment("");
    setApplicantRating(0);
    setOfferorComment("");
    setOfferorRating(0);
    setIsOnTime(false);
    setIsPresentable(false);
    setIsRespectful(false);
  };

  const handleOpenConfirm = () => {
    if (selectedReviewRole === "applicant" && canSubmitApplicantReview) {
      setShowConfirmModal(true);
    } else if (selectedReviewRole === "offeror" && canSubmitOfferorReview) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!selectedReviewId || !selectedReviewRole) return;

    try {
      if (selectedReviewRole === "applicant") {
        const data: ApplicantReviewForOfferorDTO = {
          rating: applicantRating,
          comment: applicantComment.trim(),
        };
        await submitApplicantReview.mutateAsync({ reviewId: selectedReviewId, data });
      } else if (selectedReviewRole === "offeror") {
        const data: OfferorReviewForApplicantDTO = {
          rating: offerorRating,
          comment: offerorComment.trim(),
          isOnTime,
          isPresentable,
          isRespectful,
        };
        await submitOfferorReview.mutateAsync({ reviewId: selectedReviewId, data });
      }

      show(
        "Evaluacion enviada",
        "Tu evaluacion fue enviada correctamente.",
        "success"
      );

      setShowConfirmModal(false);
      closeDetailsModal();
      closeReviewModal();
      refetch();
    } catch {
      setShowConfirmModal(false);
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
      reviewStatus: status === "all" ? undefined : status,
      pageNumber: 1,
    }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSearchParams((prev) => ({ ...prev, publicationTitle: value || undefined, pageNumber: 1 }));
  };

  // ========================================
  // Helper Functions
  // ========================================
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border";
    const mapping: Record<string, { text: string; classes: string }> = {
      Pendiente: { text: "Pendiente", classes: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      OferenteEvaluoEstudiante: { text: "Oferente ha evaluado", classes: "bg-blue-100 text-blue-800 border-blue-200" },
      EstudianteEvaluoOferente: { text: "Postulante ha evaluado", classes: "bg-blue-100 text-blue-800 border-blue-200" },
      Completada: { text: "Completada", classes: "bg-green-100 text-green-700 border-green-200" },
      Cerrada: { text: "Cerrada", classes: "bg-gray-100 text-gray-700 border-gray-200" },
    };

    const info = mapping[status] ?? { text: status, classes: "bg-gray-100 text-gray-800" };
    return <span className={`${baseClasses} ${info.classes}`}>{info.text}</span>;
  };

  const getRoleBadge = (review: MyReviewDTO) => {
    if (!currentUserId) return null;

    const isApplicant = review.applicantId === currentUserId;
    const baseClasses = "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border";

    if (isApplicant) {
      return <span className={`${baseClasses} bg-purple-100 text-purple-800 border-purple-200`}>Tu rol: Postulante</span>;
    } else {
      return <span className={`${baseClasses} bg-indigo-100 text-indigo-800 border-indigo-200`}>Tu rol: Oferente</span>;
    }
  };

  /**
   * Determines if the current user can submit a review for a given review.
   * This depends on:
   * 1. The review status (not closed/expired)
   * 2. Whether the user's side of the review has already been completed
   * 
   * We need the full review details to determine user's role in THAT specific review
   */
  const canUserReviewBasedOnStatus = (review: MyReviewDTO): boolean => {
    // Cannot review if closed or expired
    if (review.reviewStatus === "Cerrada" || review.reviewStatus === "Completada") {
      return false;
    }

    // For Pending status, either party can review
    if (review.reviewStatus === "Pendiente") {
      return true;
    }

    // For OfferorCompleted, only applicant can still review
    // For ApplicantCompleted, only offeror can still review
    // But we need the details to know which one the user is
    // This will be refined when opening the modal
    return review.reviewStatus === "OferenteEvaluoEstudiante" || review.reviewStatus === "EstudianteEvaluoOferente";
  };

  /**
   * Check if user can submit based on their role in this specific review
   */
  const canUserSubmitReview = (details: MyReviewDetailsDTO): boolean => {
    const role = getReviewRole(details);
    if (!role) return false;

    const status = details.reviewStatus;

    if (status === "Cerrada" || status === "Completada") {
      return false;
    }

    if (status === "Pendiente") {
      return true;
    }

    // OfferorCompleted means offeror already submitted, only applicant can submit
    if (status === "OferenteEvaluoEstudiante" && role === "applicant") {
      return true;
    }

    // ApplicantCompleted means applicant already submitted, only offeror can submit
    if (status === "EstudianteEvaluoOferente" && role === "offeror") {
      return true;
    }

    return false;
  };

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            className={`text-2xl transition ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
              } ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const getRoleLabel = (role: ReviewRole): string => {
    if (role === "applicant") return "Postulante";
    if (role === "offeror") return "Oferente";
    return "";
  };

  // ========================================
  // Computed UI Values
  // ========================================
  const isViewLoading = isLoading && !reviewsData;
  const user = getUserFromToken();

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
                <div className="h-6 w-48 rounded-lg bg-slate-200" />
                <div className="h-4 w-32 rounded-lg bg-slate-200" />
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
            <p className="text-white/80">Hubo un problema al obtener tus evaluaciones</p>
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
              No tienes evaluaciones que coincidan con los filtros seleccionados.
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <section className="mt-8 flex flex-col gap-6 pb-12 w-full">
          {reviews.map((review) => {
            const isApplicant = currentUserId === review.applicantId;
            const otherPartyName = isApplicant ? review.offerorFullName : review.applicantFullName;
            const otherPartyRole = isApplicant ? "Oferente" : "Postulante";

            return (
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
                    {getRoleBadge(review)}
                    <div>{getStatusBadge(review.reviewStatus)}</div>
                  </div>

                  <h3 className="font-black text-2xl md:text-3xl text-slate-900 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all mb-1">
                    {review.jobOfferTitle}
                  </h3>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">{otherPartyRole}:</span> {otherPartyName}
                    </p>
                    {review.hasReviewBeenActionedByAdmin && (
                      <p className="text-amber-600 font-medium">
                        Revisada por administrador
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg">
                  {review.reviewStatus !== "Cerrada" && review.reviewStatus !== "Completada" && (
                  <div className="flex flex-col leading-tight">
                    <p className="text-[10px] font-bold uppercase tracking-wide">
                      Abierta hasta
                    </p>
                    <p className="text-sm font-black whitespace-nowrap">
                      {new Date(review.openUntil).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                  )}

                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </article>
            );
          })}
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
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              Mis Evaluaciones
            </h1>
          </div>

          {/* Filters */}
          <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-10 w-full">
            <div className="flex flex-col xl:flex-row gap-4 items-stretch">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none w-5 h-5 group-focus-within:text-purple-500" />
                <input
                  type="text"
                  placeholder="Buscar por titulo..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60 rounded-full pl-12 pr-5 py-3.5 text-sm font-bold focus:bg-white focus:text-purple-900 focus:placeholder:text-purple-300 focus:ring-4 focus:ring-white/20 transition-all outline-none shadow-lg hover:bg-white/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full xl:w-auto">
                <div className="relative w-full group">
                  <select
                    value={searchParams.reviewStatus ?? "all"}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60 rounded-full px-5 py-3.5 text-sm font-bold focus:bg-white focus:text-purple-900 focus:placeholder:text-purple-300 focus:ring-4 focus:ring-white/20 transition-all outline-none shadow-lg hover:bg-white/20"
                  >
                    <option value="all" className="text-slate-800">Todos los estados</option>
                    <option value="Pendiente" className="text-slate-800">Pendientes</option>
                    <option value="Completada" className="text-slate-800">Completadas</option>
                    <option value="Cerrada" className="text-slate-800">Cerradas</option>
                  </select>
                </div>

                <button
                  onClick={() => setSearchParams((prev) => ({ ...prev, sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" }))}
                  className="w-full h-[53px] bg-white/20 text-white hover:bg-white/30 border-white/50 text-sm font-black rounded-full flex items-center justify-center gap-2"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {searchParams.sortOrder === "asc" ? "Ascendente" : "Descendente"}
                </button>

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSearchParams({
                      pageNumber: 1,
                      pageSize: 10,
                      sortOrder: "desc",
                      publicationTitle: undefined,
                      reviewStatus: undefined,
                    });
                  }}
                  className="w-full h-[53px] bg-white/20 text-white hover:bg-white/30 border-white/50 text-sm font-black rounded-full"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </main>
      </div>

      {/* Details Modal */}
      {
        showDetailsModal && reviewDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {canUserSubmitReview(reviewDetails)
                      ? (selectedReviewRole === "applicant" ? "Evaluar al Oferente" : "Evaluar al Postulante")
                      : "Detalles de la Evaluacion"
                    }
                  </h2>
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
                  {selectedReviewRole && (
                    <p className="text-sm text-gray-600 mt-2">
                      {canUserSubmitReview(reviewDetails)
                        ? (selectedReviewRole === "applicant"
                          ? `Evaluando a: ${reviewDetails.offerorFullName}`
                          : `Evaluando a: ${reviewDetails.applicantFullName}`)
                        : `Tu rol en esta evaluacion: ${getRoleLabel(selectedReviewRole)}`
                      }
                    </p>
                  )}
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  x
                </button>
              </div>

              <div className="space-y-6">
                {/* Review Form - Show prominently if user can submit */}
                {canUserSubmitReview(reviewDetails) && selectedReviewRole && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
                      <h3 className="font-bold text-lg text-purple-900">Tu Evaluacion Pendiente</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Calificacion *
                        </label>
                        {renderStars(
                          selectedReviewRole === "applicant" ? applicantRating : offerorRating,
                          true,
                          selectedReviewRole === "applicant" ? setApplicantRating : setOfferorRating
                        )}
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comentario *
                        </label>
                        <textarea
                          value={selectedReviewRole === "applicant" ? applicantComment : offerorComment}
                          onChange={(e) =>
                            selectedReviewRole === "applicant"
                              ? setApplicantComment(e.target.value)
                              : setOfferorComment(e.target.value)
                          }
                          className="w-full border rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-purple-500"
                          placeholder={
                            selectedReviewRole === "applicant"
                              ? "Describe tu experiencia trabajando con este oferente..."
                              : "Describe tu experiencia con este postulante..."
                          }
                          maxLength={MAX_COMMENT_LENGTH}
                        />
                        <p
                          className={`text-xs text-right mt-1 ${(selectedReviewRole === "applicant" ? applicantComment : offerorComment).length >
                            MAX_COMMENT_LENGTH
                            ? "text-red-500"
                            : "text-gray-500"
                            }`}
                        >
                          {(selectedReviewRole === "applicant" ? applicantComment : offerorComment).length}/
                          {MAX_COMMENT_LENGTH}
                        </p>
                      </div>

                      {/* Offeror-specific checkboxes */}
                      {selectedReviewRole === "offeror" && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">
                            Caracteristicas del postulante
                          </p>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isOnTime}
                              onChange={(e) => setIsOnTime(e.target.checked)}
                              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span>Fue puntual</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isPresentable}
                              onChange={(e) => setIsPresentable(e.target.checked)}
                              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span>Buena presentacion personal</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isRespectful}
                              onChange={(e) => setIsRespectful(e.target.checked)}
                              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span>Fue respetuoso</span>
                          </label>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        onClick={handleOpenConfirm}
                        disabled={
                          selectedReviewRole === "applicant" ? !canSubmitApplicantReview : !canSubmitOfferorReview
                        }
                        className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Enviar Evaluacion
                      </button>
                    </div>
                  </div>
                )}

                {/* Divider when review form is shown */}
                {canUserSubmitReview(reviewDetails) && (
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Informacion de la Evaluacion</span>
                    </div>
                  </div>
                )}
                {/* Job Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{reviewDetails.jobOfferTitle}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Postulante:</span>
                      <p className={`font-medium ${reviewDetails.applicantId === currentUserId ? "text-purple-600" : ""}`}>
                        {reviewDetails.applicantFullName}
                        {reviewDetails.applicantId === currentUserId && " (Tu)"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Oferente:</span>
                      <p className={`font-medium ${reviewDetails.offerorId === currentUserId ? "text-purple-600" : ""}`}>
                        {reviewDetails.offerorFullName}
                        {reviewDetails.offerorId === currentUserId && " (Tu)"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <p>{getStatusBadge(reviewDetails.reviewStatus)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Abierta hasta:</span>
                      <p className="font-medium">
                        {new Date(reviewDetails.openUntil).toLocaleDateString("es-CL")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Offeror's Review of Applicant */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Evaluacion del Oferente al Postulante</h4>
                  {reviewDetails.isOfferorReviewForApplicantHidden ? (
                    <p className="text-amber-600">Esta evaluacion ha sido ocultada por un administrador</p>
                  ) : reviewDetails.offerorRatingOfApplicant ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Calificacion:</span>
                        {renderStars(reviewDetails.offerorRatingOfApplicant)}
                      </div>
                      <p className="text-gray-700">{reviewDetails.offerorCommentForApplicant}</p>
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
                          Completada el {new Date(reviewDetails.offerorReviewCompletedAt).toLocaleDateString("es-CL")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aun no ha sido evaluado</p>
                  )}
                </div>

                {/* Applicant's Review of Offeror */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Evaluacion del Postulante al Oferente</h4>
                  {reviewDetails.isApplicantReviewForOfferorHidden ? (
                    <p className="text-amber-600">Esta evaluacion ha sido ocultada por un administrador</p>
                  ) : reviewDetails.applicantRatingOfOfferor ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Calificacion:</span>
                        {renderStars(reviewDetails.applicantRatingOfOfferor)}
                      </div>
                      <p className="text-gray-700">{reviewDetails.applicantCommentForOfferor}</p>
                      {reviewDetails.applicantReviewCompletedAt && (
                        <p className="text-xs text-gray-500">
                          Completada el {new Date(reviewDetails.applicantReviewCompletedAt).toLocaleDateString("es-CL")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aun no ha sido evaluado</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeDetailsModal}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Review Modal */}
      {
        showReviewModal && reviewDetails && selectedReviewRole && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedReviewRole === "applicant" ? "Evaluar al Oferente" : "Evaluar al Postulante"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedReviewRole === "applicant"
                      ? `Evaluando a: ${reviewDetails.offerorFullName}`
                      : `Evaluando a: ${reviewDetails.applicantFullName}`
                    }
                  </p>
                </div>
                <button
                  onClick={closeReviewModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  x
                </button>
              </div>

              <div className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificacion *
                  </label>
                  {renderStars(
                    selectedReviewRole === "applicant" ? applicantRating : offerorRating,
                    true,
                    selectedReviewRole === "applicant" ? setApplicantRating : setOfferorRating
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario *
                  </label>
                  <textarea
                    value={selectedReviewRole === "applicant" ? applicantComment : offerorComment}
                    onChange={(e) =>
                      selectedReviewRole === "applicant"
                        ? setApplicantComment(e.target.value)
                        : setOfferorComment(e.target.value)
                    }
                    className="w-full border rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-purple-500"
                    placeholder={
                      selectedReviewRole === "applicant"
                        ? "Describe tu experiencia trabajando con este oferente..."
                        : "Describe tu experiencia con este postulante..."
                    }
                    maxLength={MAX_COMMENT_LENGTH}
                  />
                  <p
                    className={`text-xs text-right mt-1 ${(selectedReviewRole === "applicant" ? applicantComment : offerorComment).length >
                      MAX_COMMENT_LENGTH
                      ? "text-red-500"
                      : "text-gray-500"
                      }`}
                  >
                    {(selectedReviewRole === "applicant" ? applicantComment : offerorComment).length}/
                    {MAX_COMMENT_LENGTH}
                  </p>
                </div>

                {/* Offeror-specific checkboxes (only when user is the offeror) */}
                {selectedReviewRole === "offeror" && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">
                      Caracteristicas del postulante
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOnTime}
                        onChange={(e) => setIsOnTime(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Fue puntual</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPresentable}
                        onChange={(e) => setIsPresentable(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Buena presentacion personal</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRespectful}
                        onChange={(e) => setIsRespectful(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Fue respetuoso</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3 justify-end">
                <button
                  onClick={closeReviewModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleOpenConfirm}
                  disabled={
                    selectedReviewRole === "applicant" ? !canSubmitApplicantReview : !canSubmitOfferorReview
                  }
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar Evaluacion
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Loading state for review modal */}
      {
        showReviewModal && isLoadingDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
              <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
          </div>
        )
      }

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmModal}
        title="Confirmar envio"
        description="Una vez enviada la evaluacion no podras modificarla. Deseas continuar?"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirmModal(false)}
        confirmText="Enviar"
        cancelText="Cancelar"
        onOpenChange={(open) => setShowConfirmModal(open)}
      />
    </Suspense>
  );
}