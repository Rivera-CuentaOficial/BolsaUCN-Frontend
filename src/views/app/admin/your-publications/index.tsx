"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { adminPublicationService } from 'src/services/adminPublicationService';
import { buildLoginUrl, handleApiError, cn } from 'src/lib';
import {
    ChevronLeft, ChevronRight, Settings2, AlertCircle, ClockIcon, Briefcase,
    ShoppingBag, Heart, ArrowLeft, Search, ListFilter, ArrowUpDown, ArrowRight
} from "lucide-react";
import { MyPublishedPublication } from '@/models/responses';
import { Button } from '@/components/ui/Button';
import { NotificationBanner } from "@/components/ui/notification";
import { useNotification } from "@/hooks/common/use-notification";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';

// Cantidad de elementos por página
const ITEMS_PER_PAGE = 9;

// --- Constantes de Filtro y Mapeo ---

const PUBLICATION_TYPES = [
    { value: 0, text: "Oferta de Trabajo", icon: Briefcase, iconClass: "text-indigo-500", bg: "bg-indigo-100", textCol: "text-indigo-800" },
    { value: 1, text: "Compra/Venta", icon: ShoppingBag, iconClass: "text-purple-500", bg: "bg-purple-100", textCol: "text-purple-800" },
    { value: 2, text: "Voluntariado", icon: Heart, iconClass: "text-pink-500", bg: "bg-pink-100", textCol: "text-pink-800" },
];

const PUBLICATION_STATUS = [
    { value: 0, text: "Activa", classes: "bg-green-100 text-green-700 border-green-200" }
];

type SortType = "recientes" | "titulo";

// --- Componentes auxiliares ---

const getPublicationTypeInfo = (type: number) => {
    return PUBLICATION_TYPES.find(t => t.value === type) || { text: "Otro", icon: Briefcase, iconClass: "text-gray-500", bg: "bg-gray-100", textCol: "text-gray-800" };
};

const getStatusBadge = (status: number) => {
  const baseClasses = "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border";
  const info = PUBLICATION_STATUS.find(s => s.value === status) || { text: "Desconocido", classes: "bg-gray-100 text-gray-800" };
  return { text: info.text, classes: `${baseClasses} ${info.classes}` };
};

interface PublicationCardProps {
    pub: MyPublishedPublication;
    onClick: () => void;
}

// --- NUEVO DISEÑO HORIZONTAL (Card Full Width) ---
const PublicationCard = ({ pub, onClick }: PublicationCardProps) => {
    const statusInfo = getStatusBadge(pub.statusValidation);
    const typeInfo = getPublicationTypeInfo(pub.types);
    const date = pub.publicationDate && new Date(pub.publicationDate).getTime() > 0
        ? new Date(pub.publicationDate).toLocaleDateString("es-CL")
        : "—";

    return (
        <article
            onClick={onClick}
            className={cn(
                "group relative flex items-center justify-between p-6 rounded-[2rem] transition-all duration-300 cursor-pointer w-full",
                "bg-white text-slate-800 shadow-xl", // Fondo blanco sólido
                "hover:scale-[1.01] hover:shadow-2xl hover:bg-white", // Efecto hover sutil
                "border-4 border-transparent hover:border-purple-300" // Borde al hover
            )}
        >
            <div className="flex-1 min-w-0 pr-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                    {/* Badge de Tipo con Icono */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${typeInfo.bg}`}>
                        <typeInfo.icon className={`w-4 h-4 ${typeInfo.iconClass}`} />
                        <span className={`text-xs font-black uppercase tracking-wider ${typeInfo.textCol}`}>
                            {typeInfo.text}
                        </span>
                    </div>

                    {/* Badge de Estado */}
                    <div className={statusInfo.classes}>
                        {statusInfo.text}
                    </div>
                </div>

                {/* Título Grande que ocupa el espacio */}
                <h3 className="font-black text-2xl md:text-3xl text-slate-900 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all mb-1">
                    {pub.title || "Sin título"}
                </h3>

                {/* Fecha */}
                <div className="flex items-center gap-2 text-slate-400 pl-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Publicado el {date}</span>
                </div>
            </div>

            {/* Botón Flecha a la derecha */}
            <div className="flex items-center pl-4 border-l border-slate-100">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300 shadow-sm">
                    <ArrowRight className="text-slate-400 w-6 h-6 group-hover:text-white transition-colors duration-300" />
                </div>
            </div>
        </article>
    );
};

// --- Skeleton Horizontal Full Width ---
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
    filterStatus: number | 'all';
    setFilterStatus: (status: number | 'all') => void;
    filterType: number | 'all';
    setFilterType: (type: number | 'all') => void;
    sort: SortType;
    setSort: (sort: SortType) => void;
    clearFilters: () => void;
}

// --- FilterBar Estilo Admin ---
const FilterBar = ({
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    sort,
    setSort,
    clearFilters
}: FilterBarProps) => {
    const baseClass = "w-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60 rounded-full px-5 py-3.5 text-sm font-bold focus:bg-white focus:text-purple-900 focus:placeholder:text-purple-300 focus:ring-4 focus:ring-white/20 transition-all outline-none shadow-lg hover:bg-white/20";
    const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none";

    return (
        <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-10 w-full">
            <div className="flex flex-col xl:flex-row gap-4 items-stretch">

                {/* Buscador de Título */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto">

                    {/* Selector Estado */}
                    <div className="relative w-full group">
                        <ListFilter className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className={`${baseClass} pl-10 cursor-pointer appearance-none`}
                        >
                            <option value="all" className="text-slate-800">Todos los estados</option>
                            {PUBLICATION_STATUS.map(s => (
                                <option key={s.value} value={s.value} className="text-slate-800">{s.text}</option>
                            ))}
                        </select>
                    </div>

                    {/* Selector Tipo */}
                    <div className="relative w-full group">
                        <Briefcase className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className={`${baseClass} pl-10 cursor-pointer appearance-none`}
                        >
                            <option value="all" className="text-slate-800">Todos los tipos</option>
                            {PUBLICATION_TYPES.map(t => (
                                <option key={t.value} value={t.value} className="text-slate-800">{t.text}</option>
                            ))}
                        </select>
                    </div>

                    {/* Selector Orden */}
                    <div className="relative w-full group">
                        <ArrowUpDown className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`} />
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortType)}
                            className={`${baseClass} pl-10 cursor-pointer appearance-none`}
                        >
                            <option value="recientes" className="text-slate-800">Más recientes</option>
                            <option value="titulo" className="text-slate-800">A-Z</option>
                        </select>
                    </div>

                    {/* Botón Limpiar */}
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


// --- Main Component ---

export default function YourPublicationsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [publications, setPublications] = useState<MyPublishedPublication[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- Estados de Filtro y Ordenamiento ---
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all');
  const [filterType, setFilterType] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<SortType>('recientes'); 

  // --- Estados de Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notification, isVisible, show, close } = useNotification();


  const loadData = useCallback(async () => {
      const token = Cookies.get("token");
      if (!token) {
        const currentPath = window.location.pathname + (window.location.search || "");
        window.location.href = buildLoginUrl(currentPath, "login_required");
        return;
      }

      try {
        const [publishedRes] = await Promise.all([
          adminPublicationService.getMyPublishedPublications(),
        ]);

        const published = publishedRes.data.data || [];

        // Combinamos y asignamos el statusValidation basado en el origen
        const allPublications = [
          ...published.map((p: any) => ({ ...p, statusValidation: 0 })), // 0: Activa/Publicada
        ];
        setPublications(allPublications);

      } catch (err) {
        const apiErrorDetails = handleApiError(err).details;
        setError(apiErrorDetails || "No se pudieron cargar tus publicaciones.");
      } finally {
        setIsLoading(false);
      }
    }, [setError, setIsLoading, setPublications]);

  useEffect(() => {
    const successParam = searchParams.get("success");
    const closeNotificationParam = searchParams.get("notification");

    let notificationProcessed = false;

    if (successParam === "true") {
      show(
        "¡Publicación Enviada!",
        "success"
      );
      router.replace("/admin/your-publications", { scroll: false });
      notificationProcessed = true;
    }
    else if (closeNotificationParam === "closed") {
      show(
        "Publicación Cerrada",
        "La publicación ha sido cerrada y ya no está disponible para postulaciones.",
        "success"
      );
      router.replace("/admin/your-publications", { scroll: false });
      notificationProcessed = true;
    }

    if (!notificationProcessed) {
        loadData();
    } else {
        const timeout = setTimeout(loadData, 100);
        return () => clearTimeout(timeout);
    }

  }, [router, searchParams, show, loadData]);;

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    loadData();
  }

  const clearFilters = useCallback(() => {
    setFilterStatus('all');
    setFilterType('all');
    setSearchTerm('');
    setSort('recientes');
    setCurrentPage(1);
  }, []);

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const filteredPublications = useMemo(() => {
    let filtered = publications;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(pub => pub.statusValidation === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(pub => pub.types === filterType);
    }

    if (searchTerm.trim() !== '') {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(pub => 
        pub.title?.toLowerCase().includes(lowerCaseSearchTerm) ||
        false 
      );
    }

    filtered.sort((a, b) => {
        if (sort === 'recientes') {
            return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
        }
        if (sort === 'titulo') {
            const titleA = a.title || "";
            const titleB = b.title || "";
            return titleA.localeCompare(titleB);
        }
        return 0;
    });

    return filtered;
  }, [publications, filterStatus, filterType, searchTerm, sort]);


  // --- LÓGICA DE PAGINACIÓN ---
  const totalPages = Math.ceil(filteredPublications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPublications = filteredPublications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
      if (totalPages <= 1) return null;
      return (
        <nav className="flex items-center justify-between text-sm gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-white/20 text-white hover:bg-white/30 border-white/50"
          >
            Siguiente <ChevronRight size={16} />
          </Button>
        </nav>
      );
  };

  const handleViewDetail = (pub: MyPublishedPublication) => {
      router.push(`/admin/your-publications/${pub.idPublication}?type=${pub.types}&status=${pub.statusValidation}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        // Flex col para que los esqueletos también ocupen todo el ancho
        <section className="mt-8 flex flex-col gap-6 pb-20">
            {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
            ))}
        </section>
      );
    }

    if (error) { 
        return (
            <div className="flex justify-center items-center p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] mx-5 text-white shadow-2xl">
              <div className="text-center">
                <AlertCircle className="h-10 w-10 mx-auto mb-4 text-purple-300" />
                <div className="font-extrabold text-xl mb-2">Error de conexión</div>
                <div className="text-white/80 mb-4">{error}</div>
                <Button onClick={handleRetry} className="bg-white text-purple-900 hover:bg-purple-100 rounded-full font-bold px-6">
                  Reintentar
                </Button>
              </div>
            </div>
        );
    }

    if (filteredPublications.length === 0) {
        return (
            <div className="mt-12 p-12 text-center bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 text-white shadow-xl w-full">
              <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2">Sin resultados</h3>
              <p className="text-lg text-purple-200">No hay publicaciones que coincidan con los filtros seleccionados.</p>
              {publications.length > 0 && ( 
                <Button onClick={clearFilters} className="mt-4 bg-yellow-400 text-slate-900 hover:bg-yellow-300 rounded-full font-bold px-6">
                    Limpiar Filtros
                </Button>
              )}
            </div>
        );
    }

    return (
        <>
            {/* Lista Vertical Full Width: Usamos flex-col para apilar */}
            <section className="mt-8 flex flex-col gap-6 pb-12 w-full">
                {currentPublications.map((pub) => (
                    <PublicationCard
                        key={pub.idPublication}
                        pub={pub}
                        onClick={() => handleViewDetail(pub)}
                    />
                ))}
            </section>

            {/* Pagination */}
            {filteredPublications.length > 0 && (
                <div className="mt-8 flex justify-center sm:justify-end">
                    {renderPagination()}
                </div>
            )}
        </>
    );
  };


  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

        {/* Notification Banner */}
        <NotificationBanner data={notification} isVisible={isVisible} onClose={close} />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-7xl">
            <header className="mb-10">
                <Link href="/offers"> 
                    <button className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10">
                        <ArrowLeft className="h-4 w-4" />
                        Volver a Explorar
                    </button>
                </Link>

                <div className="flex flex-col items-start gap-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg transform ">
                        <Settings2 className="w-3.5 h-3.5" /> Panel del administrador
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg leading-tight mt-2">
                        Mis <br className="md:hidden"/> Publicaciones
                    </h1>
                    <p className="text-purple-100 text-lg md:text-xl font-medium mt-3 drop-shadow-md">
                        Tienes un total de <span className="text-yellow-300 font-black text-2xl align-middle">{publications.length}</span> publicaciones registradas.
                    </p>
                </div>
            </header>

            {/* Componente de Filtro */}
            <FilterBar
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterType={filterType}
                setFilterType={setFilterType}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sort={sort}
                setSort={setSort}
                clearFilters={clearFilters}
            />

            {/* Contenido Principal */}
            {renderContent()}

        </main>
    </div>
  );
}