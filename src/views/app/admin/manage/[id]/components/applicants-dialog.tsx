"use client";

import { useState } from "react";
import { 
  X, Mail, Calendar, FileText, ChevronLeft, ChevronRight, 
  User, ChevronDown, ChevronUp, Eye
} from "lucide-react";
import type { ApplicationForAdmin } from "@/models/responses";
import { formatDate, cn } from "@/lib";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetApplicationsByOfferIdForAdmin } from "../hooks/use-get-applications";

interface ApplicantsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: number;
  totalApplicants: number;
}

export function ApplicantsDialog({ 
  isOpen, 
  onClose, 
  offerId,
  totalApplicants 
}: ApplicantsDialogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"FirstName" | "ApplicationDate" | "Status">("ApplicationDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const pageSize = 10;

  const {
    data,
    isFetching,
    error,
  } = useGetApplicationsByOfferIdForAdmin(offerId, {
    sortBy,
    sortOrder,
    pageNumber: currentPage,
    pageSize,
  });

  const applications = data?.applications || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || totalApplicants;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setExpandedId(null);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setCurrentPage(1);
    setExpandedId(null);
  };

  const handleToggleExpand = (applicationId: number) => {
    setExpandedId(prev => prev === applicationId ? null : applicationId);
  };

  if (!isOpen) return null;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 pt-4 border-t border-slate-200">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "px-3 py-1.5 rounded-lg font-bold transition-all text-sm",
            currentPage === 1
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-slate-700 font-medium text-sm px-3">
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "px-3 py-1.5 rounded-lg font-bold transition-all text-sm",
            currentPage === totalPages
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderContent = () => {
    if (isFetching && !data) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600 font-medium">Error al cargar postulaciones</p>
          <button
            onClick={() => setCurrentPage(1)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No hay postulaciones aún</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {applications.map((app) => (
          <ApplicationCard 
            key={app.applicationId} 
            application={app}
            isExpanded={expandedId === app.applicationId}
            onToggleExpand={() => handleToggleExpand(app.applicationId)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black">Postulaciones</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-purple-100">
            Total: <span className="font-bold text-white">{totalCount}</span> postulaciones
          </p>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as "FirstName" | "ApplicationDate");
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="ApplicationDate">Ordenar por Fecha</option>
              <option value="FirstName">Ordenar por Nombre</option>
            </select>

            <button
              onClick={toggleSortOrder}
              className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold text-sm transition"
            >
              {sortOrder === "asc" ? "↑ A-Z / Antiguo" : "↓ Z-A / Reciente"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50">
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
}

interface ApplicationCardProps {
  application: ApplicationForAdmin;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function ApplicationCard({ 
  application, 
  isExpanded, 
  onToggleExpand,
}: ApplicationCardProps) {
  const fullName = `${application.applicantFirstName} ${application.applicantLastName}`;
  const initials = `${application.applicantFirstName[0]}${application.applicantLastName[0]}`.toUpperCase();

  return (
    <div className="bg-slate-50 rounded-xl border-2 border-slate-200 transition-all overflow-hidden">
      {/* Main Card - Clickable */}
      <button
        onClick={onToggleExpand}
        className="w-full p-4 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-start gap-4">
          
          {/* Avatar with Profile Photo */}
          <div className="relative w-12 h-12 flex-shrink-0">
            {application.applicantPhotoUrl ? (
              <img
                src={application.applicantPhotoUrl}
                alt={fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.fallback-avatar')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white fallback-avatar';
                    fallback.textContent = initials;
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-lg truncate">{fullName}</h3>
            
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{application.applicantEmail}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(application.applicationDate)}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-2">
              <span className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold",
                application.status === "Aceptada" && "bg-green-100 text-green-800",
                application.status === "Rechazada" && "bg-red-100 text-red-800",
                application.status === "Pendiente" && "bg-yellow-100 text-yellow-800"
              )}>
                {application.status}
              </span>
            </div>
          </div>

          {/* Expand Icon */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {application.cvUrl && (
              <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold">
                CV
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-white p-4 space-y-4">
          
          {/* Two Column Layout */}
          <div className={cn(
            "grid gap-4",
            application.coverLetter ? "md:grid-cols-2" : "md:grid-cols-1"
          )}>
            
            {/* Left Column: Contact Info */}
            <div className="space-y-3">
              {/* Full Email (clickable) */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
                    Email de Contacto
                  </span>
                </div>
                <a 
                  href={`mailto:${application.applicantEmail}`}
                  className="text-purple-600 hover:text-purple-700 font-medium transition break-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  {application.applicantEmail}
                </a>
              </div>

              {/* Application Date */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
                    Fecha de Postulación
                  </span>
                </div>
                <p className="text-slate-900 font-medium">
                  {new Date(application.applicationDate).toLocaleDateString("es-CL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* CV View Button */}
              {application.cvUrl && (
                <a
                  href={application.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition w-full"
                >
                  <Eye className="w-5 h-5" />
                  Ver CV
                </a>
              )}
            </div>

            {/* Right Column: Cover Letter */}
            {application.coverLetter && (
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-lg min-h-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
                      Carta de Motivación
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {application.coverLetter}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}