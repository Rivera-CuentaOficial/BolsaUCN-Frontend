// Updated /jobs/history/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  AlertCircle, ArrowLeft, ClockIcon, 
  Search, ListFilter, ArrowUpDown, ArrowRight,
  CheckCircle2, Settings2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError, cn, getUserFromToken } from "@/lib";
import { useGetMyApplications } from "@/hooks/api/use-application-service";
import type { ApplicationForApplicantDTO } from "@/models/responses";

type ApplicationStatus = "Todos" | "Pendiente" | "Aceptada" | "Rechazada";
type SortBy = "OfferTitle" | "CreatedAt";
type SortOrder = "asc" | "desc";

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

interface ApplicationCardProps {
  app: ApplicationForApplicantDTO;
  onClick: () => void;
}

const ApplicationCard = ({ app, onClick }: ApplicationCardProps) => {
  const statusInfo = getStatusBadge(app.status);
  const date = new Date(app.createdAt).toLocaleDateString("es-CL");

  return (
    <article 
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-between p-6 rounded-[2rem] transition-all duration-300 cursor-pointer w-full",
        "bg-white text-slate-800 shadow-xl",
        "hover:scale-[1.01] hover:shadow-2xl hover:bg-white",
        "border-4 border-transparent hover:border-purple-300"
      )}
    >
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className={statusInfo.classes}>{statusInfo.text}</div>
        </div>
        
        <h3 className="font-black text-2xl md:text-3xl text-slate-900 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all mb-1">
          {app.offerTitle || "Sin título"}
        </h3>

        <div className="flex items-center gap-2 text-slate-400 pl-1">
          <ClockIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">Postulada el {date}</span>
        </div>
      </div>

      <div className="flex items-center pl-4 border-l border-slate-100">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300 shadow-sm">
          <ArrowRight className="text-slate-400 w-6 h-6 group-hover:text-white transition-colors duration-300" />
        </div>
      </div>
    </article>
  );
};

const CardSkeleton = () => (
  <div className="w-full relative flex items-center justify-between p-6 rounded-[2rem] bg-white shadow-xl border-4 border-transparent overflow-hidden animate-pulse h-[130px]">
    <div className="flex-1 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
      </div>
      <Skeleton className="h-9 w-1/2 rounded-lg bg-slate-200" />
      <Skeleton className="h-4 w-40 rounded-lg bg-slate-200" />
    </div>
    <div className="pl-4 border-l border-slate-100">
      <Skeleton className="h-12 w-12 rounded-full bg-slate-200" />
    </div>
  </div>
);

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: ApplicationStatus;
  setFilterStatus: (status: ApplicationStatus) => void;
  sort: SortBy;
  setSort: (sort: SortBy) => void;
  sortOrder: "asc" | "desc";
  toggleSortOrder: () => void;
  clearFilters: () => void;
}

const FilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  sort,
  setSort,
  sortOrder,
  toggleSortOrder,
  clearFilters
}: FilterBarProps) => {
  const baseClass = "w-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60 rounded-full px-5 py-3.5 text-sm font-bold focus:bg-white focus:text-purple-900 focus:placeholder:text-purple-300 focus:ring-4 focus:ring-white/20 transition-all outline-none shadow-lg hover:bg-white/20";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none";

  return (
    <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-10 w-full">
      <div className="flex flex-col xl:flex-row gap-4 items-stretch">
        
        <div className="flex-1 relative group">
          <Search className={`${iconClass} w-5 h-5 group-focus-within:text-purple-500`} />
          <input
            type="text"
            placeholder="Buscar por título de oferta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${baseClass} pl-12`} 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto">
          
          <div className="relative w-full group">
            <ListFilter className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus)}
              className={`${baseClass} pl-10 cursor-pointer appearance-none`}
            >
              <option value="Todos" className="text-slate-800">Todos los estados</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value} className="text-slate-800">{s.text}</option>
              ))}
            </select>
          </div>
          
          <div className="relative w-full group">
            <ArrowUpDown className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortBy)}
              className={`${baseClass} pl-10 cursor-pointer appearance-none`}
            >
              <option value="CreatedAt" className="text-slate-800">Por fecha</option>
              <option value="OfferTitle" className="text-slate-800">Por título</option>
            </select>
          </div>

          <Button 
            variant="outline"
            onClick={toggleSortOrder}
            className="w-full h-[53px] bg-white/20 text-white hover:bg-white/30 border-white/50 text-sm font-black rounded-full"
          >
            {sortOrder === "asc" ? "↑ A-Z" : "↓ Z-A"}
          </Button>

          <Button 
            variant="outline"
            onClick={clearFilters}
            className="w-full h-[53px] bg-white/20 text-white hover:bg-white/30 border-white/50 text-sm font-black rounded-full"
          >
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
};

function JobsHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus>((searchParams.get("status") as ApplicationStatus) || "Todos");
  const [sort, setSort] = useState<SortBy>((searchParams.get("sort") as SortBy) || "CreatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">((searchParams.get("order") as "asc" | "desc") || "desc");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 9;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (filterStatus !== "Todos") params.set("status", filterStatus);
    if (sort !== "CreatedAt") params.set("sort", sort);
    if (sortOrder !== "desc") params.set("order", sortOrder);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/jobs/history${newUrl}`, { scroll: false });
  }, [searchTerm, filterStatus, sort, sortOrder, currentPage, router]);

  const user = getUserFromToken();

  const {
    data,
    isFetching,
    error: apiError,
    refetch,
  } = useGetMyApplications({
    searchTerm: searchTerm || undefined,
    statusFilter: filterStatus !== "Todos" ? filterStatus : undefined,
    sortBy: sort,
    sortOrder,
    pageNumber: currentPage,
    pageSize,
  });

  const isViewLoading = isFetching && !data;
  const applications = data?.applications || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const handleViewDetail = (app: ApplicationForApplicantDTO) => {
    router.push(`/jobs/history/${app.id}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('Todos');
    setSort('CreatedAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const apiErrorDetails = apiError ? handleApiError(apiError).details : null;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 flex-wrap">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
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
              onClick={() => handlePageChange(1)}
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
              onClick={() => handlePageChange(page)}
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
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-2 rounded-full font-bold transition-all bg-white/10 text-white hover:bg-white/20"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
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
    );
  };

  const renderContent = () => {
    if (isViewLoading) {
      return (
        <section className="mt-8 flex flex-col gap-6 pb-20">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </section>
      );
    }

    if (apiError) {
      return (
        <div className="flex justify-center items-center p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-white shadow-2xl">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-4 text-purple-300" />
            <div className="font-extrabold text-xl mb-2">Error de conexión</div>
            <div className="text-white/80 mb-4">{apiErrorDetails}</div>
            <Button 
              onClick={() => refetch()} 
              className="bg-white text-purple-900 hover:bg-purple-100 rounded-full font-bold px-6"
            >
              Reintentar
            </Button>
          </div>
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="mt-12 p-12 text-center bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 text-white shadow-xl w-full">
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            {totalCount === 0 ? (
              <CheckCircle2 className="w-10 h-10 text-white" />
            ) : (
              <Settings2 className="w-10 h-10 text-white" />
            )}
          </div>
          <h3 className="text-2xl font-black mb-2">
            {totalCount === 0 ? "Sin postulaciones" : "Sin resultados"}
          </h3>
          <p className="text-lg text-purple-200">
            {totalCount === 0 
              ? "Aún no has aplicado a ninguna oferta laboral."
              : "No hay postulaciones que coincidan con los filtros seleccionados."}
          </p>
          {totalCount > 0 && (
            <Button 
              onClick={clearFilters} 
              className="mt-4 bg-yellow-400 text-slate-900 hover:bg-yellow-300 rounded-full font-bold px-6"
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      );
    }

    return (
      <>
        <section className="mt-8 flex flex-col gap-6 pb-12 w-full">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onClick={() => handleViewDetail(app)}
            />
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

  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-7xl">
        <header className="mb-10">
          <Link href="/offers">
            <button className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10">
              <ArrowLeft className="h-4 w-4" />
              Volver a Explorar
            </button>
          </Link>
          
          <div className="flex flex-col items-start gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg transform">
              <Settings2 className="w-3.5 h-3.5" /> 
              Panel del Estudiante
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg leading-tight mt-2">
              Historial de <br className="md:hidden"/> Postulaciones
            </h1>
            <p className="text-purple-100 text-lg md:text-xl font-medium mt-3 drop-shadow-md">
              Tienes un total de <span className="text-yellow-300 font-black text-2xl align-middle">{totalCount}</span> postulaciones registradas.
            </p>
          </div>
        </header>
        
        <FilterBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sort={sort}
          setSort={setSort}
          sortOrder={sortOrder}
          toggleSortOrder={toggleSortOrder}
          clearFilters={clearFilters}
        />

        {renderContent()}
      </main>
    </div>
  );
}

export default function JobsHistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <JobsHistoryContent />
    </Suspense>
  );
}