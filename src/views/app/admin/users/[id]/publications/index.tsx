"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertCircle, ArrowLeft, ClockIcon, 
  Briefcase, ShoppingBag, Search, ListFilter, 
  ArrowUpDown, ArrowRight, FileWarning
} from "lucide-react";
import { NotificationBanner } from "@/components/ui/notification";
import { useNotification } from "@/hooks/common/use-notification";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib";
import { useQuery } from "@tanstack/react-query";
import { AdminUsersService } from "@/services/adminUserService";
import type { UserPublicationForAdmin, UserPublicationsSearchParams } from "@/models/responses";

type SortType = "Title" | "CreatedAt";
type PublicationType = "Oferta" | "CompraVenta" | "Todos";
type PublicationStatus = "Aceptada" | "Rechazada" | "Pendiente" | "Todos";

const PUBLICATION_TYPES = [
  { value: "Oferta", text: "Oferta de Trabajo", icon: Briefcase, iconClass: "text-indigo-500", bg: "bg-indigo-100", textCol: "text-indigo-800" },
  { value: "CompraVenta", text: "Compra/Venta", icon: ShoppingBag, iconClass: "text-purple-500", bg: "bg-purple-100", textCol: "text-purple-800" },
];

const PUBLICATION_STATUS = [
  { value: "Aceptada", text: "Aprobada", classes: "bg-green-100 text-green-700 border-green-200" },
  { value: "Pendiente", text: "Pendiente", classes: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "Rechazada", text: "Rechazada", classes: "bg-red-100 text-red-700 border-red-200" },
];

const getPublicationTypeInfo = (type: string) => {
  return PUBLICATION_TYPES.find(t => t.value === type) || 
    { text: "Otro", icon: Briefcase, iconClass: "text-gray-500", bg: "bg-gray-100", textCol: "text-gray-800" };
};

const getStatusBadge = (status: string) => {
  const baseClasses = "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border";
  const info = PUBLICATION_STATUS.find(s => s.value === status) || 
    { text: "Desconocido", classes: "bg-gray-100 text-gray-800" };
  return { text: info.text, classes: `${baseClasses} ${info.classes}` };
};

interface PublicationCardProps {
  pub: UserPublicationForAdmin;
  onClick: () => void;
}

const PublicationCard = ({ pub, onClick }: PublicationCardProps) => {
  const statusInfo = getStatusBadge(pub.publicationStatus);
  const typeInfo = getPublicationTypeInfo(pub.publicationType);
  const date = new Date(pub.createdAt).toLocaleDateString("es-CL");

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
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${typeInfo.bg}`}>
            <typeInfo.icon className={`w-4 h-4 ${typeInfo.iconClass}`} />
            <span className={`text-xs font-black uppercase tracking-wider ${typeInfo.textCol}`}>
              {typeInfo.text}
            </span>
          </div>
          <div className={statusInfo.classes}>{statusInfo.text}</div>
          {pub.hasBeenAppealed && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">
              <FileWarning className="w-3 h-3" />
              Apelada
            </span>
          )}
        </div>
        
        <h3 className="font-black text-2xl md:text-3xl text-slate-900 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all mb-1">
          {pub.title || "Sin título"}
        </h3>

        <div className="flex items-center gap-2 text-slate-400 pl-1">
          <ClockIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">Creada el {date}</span>
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
        <Skeleton className="h-6 w-32 rounded-full bg-slate-200" />
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
  filterStatus: PublicationStatus;
  setFilterStatus: (status: PublicationStatus) => void;
  filterType: PublicationType;
  setFilterType: (type: PublicationType) => void;
  sort: SortType;
  setSort: (sort: SortType) => void;
  sortOrder: "asc" | "desc";
  toggleSortOrder: () => void;
  clearFilters: () => void;
}

const FilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  filterType, 
  setFilterType, 
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative group">
            <ListFilter className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as PublicationType)}
              className={`${baseClass} pl-10 appearance-none cursor-pointer`}
            >
              <option value="Todos" className="text-slate-800">Todos los Tipos</option>
              <option value="Oferta" className="text-slate-800">Oferta de Trabajo</option>
              <option value="CompraVenta" className="text-slate-800">Compra/Venta</option>
            </select>
          </div>

          <div className="relative group">
            <ListFilter className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PublicationStatus)}
              className={`${baseClass} pl-10 appearance-none cursor-pointer`}
            >
              <option value="Todos" className="text-slate-800">Todos los Estados</option>
              <option value="Aceptada" className="text-slate-800">Aprobada</option>
              <option value="Pendiente" className="text-slate-800">Pendiente</option>
              <option value="Rechazada" className="text-slate-800">Rechazada</option>
            </select>
          </div>

          <div className="relative group">
            <ArrowUpDown className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className={`${baseClass} pl-10 appearance-none cursor-pointer`}
            >
              <option value="CreatedAt" className="text-slate-800">Fecha de Creación</option>
              <option value="Title" className="text-slate-800">Título</option>
            </select>
          </div>

          <button
            onClick={toggleSortOrder}
            className="px-5 py-3.5 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full text-sm font-bold hover:bg-white/20 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === "asc" ? "A - Z" : "Z - A"}
          </button>
        </div>

        <button
          onClick={clearFilters}
          className="px-6 py-3.5 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full text-sm font-bold hover:bg-white/20 transition-all shadow-lg"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export interface UserPublicationsViewProps {
  userId: string;
}

export function UserPublicationsView({ userId }: UserPublicationsViewProps) {
  const router = useRouter();
  const { notification, isVisible, show, close } = useNotification();

  // Fetch user details to get the name
  const { data: userDetail } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => AdminUsersService.getUserDetail(Number(userId)),
  });

  const userName = userDetail ? `${userDetail.firstName} ${userDetail.lastName}` : "Usuario";

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<PublicationType>('Todos');
  const [filterStatus, setFilterStatus] = useState<PublicationStatus>('Todos');
  const [sort, setSort] = useState<SortType>('CreatedAt');
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data,
    isFetching,
    error: apiError,
    refetch,
  } = useQuery({
    queryKey: ["admin-user-publications", userId, searchTerm, filterType, filterStatus, sort, sortOrder, currentPage],
    queryFn: () => AdminUsersService.getUserPublications(Number(userId), {
      searchByTitle: searchTerm || undefined,
      filterByPublicationType: filterType !== "Todos" ? filterType : undefined,
      filterByPublicationStatus: filterStatus !== "Todos" ? filterStatus : undefined,
      sortBy: sort,
      sortOrder,
      pageNumber: currentPage,
      pageSize,
    }),
  });

  const isViewLoading = isFetching && !data;
  const publications = data?.publications || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const handleViewDetail = (pub: UserPublicationForAdmin) => {
    router.push(`/admin/publications/manage/${pub.publicationId}`);
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

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

        <NotificationBanner data={notification} isVisible={isVisible} onClose={close} />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-7xl">
          <button
            onClick={() => router.push(`/admin/users/${userId}`)}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Perfil
          </button>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              Publicaciones de {userName}
            </h1>
            <p className="text-white/80 text-lg">
              {totalCount} publicación{totalCount !== 1 ? 'es' : ''} en total
            </p>
          </div>

          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterType={filterType}
            setFilterType={setFilterType}
            sort={sort}
            setSort={setSort}
            sortOrder={sortOrder}
            toggleSortOrder={toggleSortOrder}
            clearFilters={clearFilters}
          />

          {isViewLoading && (
            <section className="mt-8 flex flex-col gap-6 pb-12">
              {[...Array(3)].map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </section>
          )}

          {!isViewLoading && apiError && (
            <div className="flex justify-center items-center p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-white shadow-2xl">
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
                <p className="text-xl font-bold">Error al cargar las publicaciones</p>
                <p className="text-white/80">Hubo un problema al obtener las publicaciones del usuario</p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full transition-all"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {!isViewLoading && !apiError && publications.length === 0 && (
            <div className="mt-12 p-12 text-center bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 text-white shadow-xl w-full">
              <div className="space-y-4">
                <p className="text-2xl font-black">No hay publicaciones</p>
                <p className="text-white/80">
                  Este usuario no tiene publicaciones que coincidan con los filtros seleccionados.
                </p>
              </div>
            </div>
          )}

          {!isViewLoading && !apiError && publications.length > 0 && (
            <>
              <section className="mt-8 flex flex-col gap-6 pb-12">
                {publications.map((pub) => (
                  <PublicationCard
                    key={pub.publicationId}
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
          )}
        </main>
      </div>
    </Suspense>
  );
}
