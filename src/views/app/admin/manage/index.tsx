"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  AlertCircle, ArrowLeft, Settings2, ClockIcon, 
  Briefcase, ShoppingBag, Search, ListFilter, 
  ArrowUpDown, ArrowRight, CheckCircle2, User, Mail 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NotificationBanner } from "@/components/ui/notification";
import { useNotification } from "@/hooks/common/use-notification";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError, cn } from "@/lib";
import { useGetManagePublications } from "./hooks";
import type { PublicationForAdmin } from "@/models/responses";

type SortType = "Title" | "CreatedAt";
type PublicationType = "Oferta" | "CompraVenta" | "Todos";
type ApprovalStatus = "Pendiente" | "Aprobada" | "Rechazada" | "Cerrada" | "Todos";

const PUBLICATION_TYPES = [
  { value: "Oferta", text: "Oferta de Trabajo", icon: Briefcase, iconClass: "text-indigo-500", bg: "bg-indigo-100", textCol: "text-indigo-800" },
  { value: "CompraVenta", text: "Compra/Venta", icon: ShoppingBag, iconClass: "text-purple-500", bg: "bg-purple-100", textCol: "text-purple-800" },
];

const APPROVAL_STATUS_OPTIONS = [
  { value: "Aprobada", text: "Aprobada" },
  { value: "Pendiente", text: "Pendiente" },
  { value: "Rechazada", text: "Rechazada" },
  { value: "Cerrada", text: "Cerrada" },
];

const APPROVAL_STATUS_BADGES: Record<string, { text: string; classes: string }> = {
  Aprobada: { text: "Aprobada", classes: "bg-green-100 text-green-700 border-green-200" },
  Aceptada: { text: "Aprobada", classes: "bg-green-100 text-green-700 border-green-200" },
  Pendiente: { text: "Pendiente", classes: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  Rechazada: { text: "Rechazada", classes: "bg-red-100 text-red-700 border-red-200" },
  Cerrada: { text: "Cerrada", classes: "bg-gray-100 text-gray-700 border-gray-200" },
};

const USER_TYPE_BADGES: Record<string, { text: string; classes: string }> = {
  Estudiante: { text: "Estudiante", classes: "bg-blue-100 text-blue-700" },
  Empresa: { text: "Empresa", classes: "bg-emerald-100 text-emerald-700" },
  Particular: { text: "Particular", classes: "bg-amber-100 text-amber-700" },
  Administrador: { text: "Admin", classes: "bg-purple-100 text-purple-700" },
};

const getPublicationTypeInfo = (type: string) => {
  return PUBLICATION_TYPES.find(t => type.includes(t.value)) || 
    { text: "Otro", icon: Briefcase, iconClass: "text-gray-500", bg: "bg-gray-100", textCol: "text-gray-800" };
};

const getStatusBadge = (status: string) => {
  const baseClasses = "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border";
  const info = APPROVAL_STATUS_BADGES[status] || { text: status, classes: "bg-gray-100 text-gray-800" };
  return { text: info.text, classes: `${baseClasses} ${info.classes}` };
};

const getUserTypeBadge = (userType: string) => {
  const baseClasses = "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide";
  const info = USER_TYPE_BADGES[userType] || { text: userType, classes: "bg-gray-100 text-gray-700" };
  return { text: info.text, classes: `${baseClasses} ${info.classes}` };
};

interface PublicationCardProps {
  pub: PublicationForAdmin;
  onClick: () => void;
}

const PublicationCard = ({ pub, onClick }: PublicationCardProps) => {
  const statusInfo = getStatusBadge(pub.approvalStatus);
  const typeInfo = getPublicationTypeInfo(pub.publicationType);
  const userTypeBadge = getUserTypeBadge(pub.userType);
  const date = new Date(pub.createdAt).toLocaleDateString("es-CL");

  return (
    <article 
      onClick={onClick}
      className={cn(
        "group relative flex items-stretch justify-between rounded-[2rem] transition-all duration-300 cursor-pointer w-full overflow-hidden",
        "bg-white text-slate-800 shadow-xl",
        "hover:scale-[1.01] hover:shadow-2xl",
        "border-4 border-transparent hover:border-purple-300"
      )}
    >
      {/* Left side - Publication Info */}
      <div className="flex-1 min-w-0 p-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${typeInfo.bg}`}>
            <typeInfo.icon className={`w-4 h-4 ${typeInfo.iconClass}`} />
            <span className={`text-xs font-black uppercase tracking-wider ${typeInfo.textCol}`}>
              {typeInfo.text}
            </span>
          </div>
          <div className={statusInfo.classes}>{statusInfo.text}</div>
          {pub.appealsCount > 0 && (
            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-orange-100 text-orange-700 border-orange-200">
              Apelada ({pub.appealsCount})
            </div>
          )}
        </div>
        
        <h3 className="font-black text-2xl md:text-3xl text-slate-900 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all mb-2">
          {pub.title || "Sin título"}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {pub.description}
        </p>

        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{date}</span>
          </div>
        </div>
      </div>

      {/* Right side - User Info */}
      <div className="flex flex-col items-center justify-between p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-l-2 border-slate-200 min-w-[200px] group-hover:from-purple-50 group-hover:to-pink-50 group-hover:border-purple-200 transition-all">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Profile Photo */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-white shadow-lg group-hover:ring-purple-200 transition-all">
            {pub.profilePhotoUrl ? (
              <Image
                src={pub.profilePhotoUrl}
                alt={pub.authorName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
              {pub.authorName}
            </h4>
            <div className={userTypeBadge.classes}>
              {userTypeBadge.text}
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Mail className="w-3 h-3" />
              <span className="text-[10px] font-medium line-clamp-1">
                {pub.authorEmail}
              </span>
            </div>
          </div>
        </div>

        {/* Action Arrow */}
        <div className="mt-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300 shadow-sm">
            <ArrowRight className="text-slate-500 w-5 h-5 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>
    </article>
  );
};

const CardSkeleton = () => (
  <div className="w-full relative flex items-stretch rounded-[2rem] bg-white shadow-xl border-4 border-transparent overflow-hidden animate-pulse h-[200px]">
    <div className="flex-1 p-6 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-32 rounded-full bg-slate-200" />
        <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
      </div>
      <Skeleton className="h-9 w-3/4 rounded-lg bg-slate-200" />
      <Skeleton className="h-4 w-full rounded-lg bg-slate-200" />
      <Skeleton className="h-4 w-40 rounded-lg bg-slate-200" />
    </div>
    <div className="p-6 bg-slate-50 border-l-2 border-slate-200 min-w-[200px] flex flex-col items-center justify-between">
      <div className="flex flex-col items-center space-y-3">
        <Skeleton className="h-16 w-16 rounded-full bg-slate-200" />
        <Skeleton className="h-4 w-24 rounded-lg bg-slate-200" />
        <Skeleton className="h-4 w-16 rounded-full bg-slate-200" />
        <Skeleton className="h-3 w-28 rounded-lg bg-slate-200" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
    </div>
  </div>
);

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: PublicationType;
  setFilterType: (type: PublicationType) => void;
  filterStatus: ApprovalStatus;
  setFilterStatus: (status: ApprovalStatus) => void;
  sort: SortType;
  setSort: (sort: SortType) => void;
  sortOrder: "asc" | "desc";
  toggleSortOrder: () => void;
  clearFilters: () => void;
}

const FilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  filterType, 
  setFilterType,
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
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${baseClass} pl-12`} 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full xl:w-auto">
          
          <div className="relative w-full group">
            <ListFilter className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ApprovalStatus)}
              className={`${baseClass} pl-10 cursor-pointer appearance-none`}
            >
              <option value="Todos" className="text-slate-800">Todos los estados</option>
              {APPROVAL_STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value} className="text-slate-800">{s.text}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full group">
            <Briefcase className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as PublicationType)}
              className={`${baseClass} pl-10 cursor-pointer appearance-none`}
            >
              <option value="Todos" className="text-slate-800">Todos los tipos</option>
              {PUBLICATION_TYPES.map(t => (
                <option key={t.value} value={t.value} className="text-slate-800">{t.text}</option>
              ))}
            </select>
          </div>
          
          <div className="relative w-full group">
            <ArrowUpDown className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className={`${baseClass} pl-10 cursor-pointer appearance-none`}
            >
              <option value="CreatedAt" className="text-slate-800">Por fecha</option>
              <option value="Title" className="text-slate-800">Por título</option>
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

export default function ManageView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notification, isVisible, show, close } = useNotification();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [filterType, setFilterType] = useState<PublicationType>((searchParams.get("type") as PublicationType) || "Todos");
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus>((searchParams.get("status") as ApprovalStatus) || "Todos");
  const [sort, setSort] = useState<SortType>((searchParams.get("sort") as SortType) || "CreatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">((searchParams.get("order") as "asc" | "desc") || "desc");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 9;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (filterType !== "Todos") params.set("type", filterType);
    if (filterStatus !== "Todos") params.set("status", filterStatus);
    if (sort !== "CreatedAt") params.set("sort", sort);
    if (sortOrder !== "desc") params.set("order", sortOrder);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/admin/publications/manage${newUrl}`, { scroll: false });
  }, [searchTerm, filterType, filterStatus, sort, sortOrder, currentPage, router]);

  const {
    data,
    isFetching,
    error: apiError,
    refetch,
  } = useGetManagePublications({
    searchTerm: searchTerm || undefined,
    filterByType: filterType !== "Todos" ? filterType : undefined,
    filterByApprovalStatus: filterStatus !== "Todos" ? filterStatus : undefined,
    sortBy: sort,
    sortOrder,
    pageNumber: currentPage,
    pageSize,
  });

  useEffect(() => {
    const notificationParam = searchParams.get("notification");
    if (notificationParam === "closed") {
      show("Publicación Cerrada", "La publicación ha sido cerrada exitosamente.", "success");
      router.replace("/admin/publications/manage", { scroll: false });
    }
  }, [searchParams, show, router]);

  const isViewLoading = isFetching && !data;
  const publications = data?.publications || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const handleViewDetail = (pub: PublicationForAdmin) => {
    if (pub.approvalStatus === "Pendiente") {
      router.push(`/admin/publications/validate/${pub.id}`);
    } else {
      router.push(`/admin/publications/manage/${pub.id}`);
    }
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
    setFilterType('Todos');
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

    if (publications.length === 0) {
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
            {totalCount === 0 ? "Sin publicaciones" : "Sin resultados"}
          </h3>
          <p className="text-lg text-purple-200">
            {totalCount === 0 
              ? "No hay publicaciones actualmente en el sistema."
              : "No hay publicaciones que coincidan con los filtros seleccionados."}
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
          {publications.map((pub) => (
            <PublicationCard
              key={pub.id}
              pub={pub}
              onClick={() => handleViewDetail(pub)}
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
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-slate-900">
        
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            src="/fondo.png" 
            alt="Fondo UCN" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-800/90 to-fuchsia-800/80 mix-blend-hard-light" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-950/90" />
        </div>
        
        <NotificationBanner data={notification} isVisible={isVisible} onClose={close} />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-7xl">
          <header className="mb-10">
            <Link href="/admin/publications">
              <button className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10">
                <ArrowLeft className="h-4 w-4" />
                Volver al Panel
              </button>
            </Link>
            
            <div className="flex flex-col items-start gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg transform rotate-1">
                <Settings2 className="w-3.5 h-3.5" /> 
                Panel de Administración
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg leading-tight mt-2">
                Administrar <br className="md:hidden"/> Publicaciones
              </h1>
              <p className="text-purple-100 text-lg md:text-xl font-medium mt-3 drop-shadow-md">
                Hay un total de <span className="text-yellow-300 font-black text-2xl align-middle">{totalCount}</span> publicaciones registradas.
              </p>
            </div>
          </header>
          
          <FilterBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
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
    </Suspense>
  );
}