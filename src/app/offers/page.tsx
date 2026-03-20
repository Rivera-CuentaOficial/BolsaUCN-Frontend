"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Settings2,
  ClockIcon,
  Briefcase,
  ShoppingBag,
  Search,
  ListFilter,
  ArrowUpDown,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError, cn, getUserFromToken, isLoggedIn } from "@/lib";
import { useGetExploreOffers } from "@/hooks/api/use-explore-offers";
import { useGetExploreBuySells } from "@/hooks/api/use-explore-buysells";
import type { OfferForApplicant, BuySellForApplicant } from "@/models/responses";
import Image from "next/image";

type SortType = "Title" | "CreatedAt" | "Remuneration";
type BuySellSortType = "Title" | "CreatedAt" | "Price";
type FilterType = "Trabajo" | "Voluntariado" | "Todos";
type BuySellFilterType = "Electronica" | "Ropa" | "Hogar" | "Vehiculos" | "Deportes" | "Libros" | "Musica" | "Juguetes" | "Mascotas" | "Otros" | "Todos";
type ExploreType = "offers" | "buysells";

const OFFER_TYPES = [
  {
    value: "Trabajo",
    text: "Trabajo",
    icon: Briefcase,
    iconClass: "text-indigo-500",
    bg: "bg-indigo-100",
    textCol: "text-indigo-800",
  },
  {
    value: "Voluntariado",
    text: "Voluntariado",
    icon: Sparkles,
    iconClass: "text-purple-500",
    bg: "bg-purple-100",
    textCol: "text-purple-800",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface OfferCardProps {
  offer: OfferForApplicant;
  onClick: () => void;
}

const OfferCard = ({ offer, onClick }: OfferCardProps) => {
  const isVolunteer = offer.offerType === "Voluntariado";

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
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
              isVolunteer ? "bg-purple-100" : "bg-indigo-100"
            }`}
          >
            {isVolunteer ? (
              <Sparkles className="w-4 h-4 text-purple-500" />
            ) : (
              <Briefcase className="w-4 h-4 text-indigo-500" />
            )}
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                isVolunteer ? "text-purple-800" : "text-indigo-800"
              }`}
            >
              {offer.offerType}
            </span>
          </div>
          {!isVolunteer && offer.remuneration > 0 && (
            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-green-100 text-green-700 border-green-200">
              {formatCurrency(offer.remuneration)}
            </div>
          )}
          {offer.availableSlots > 0 && (
            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-blue-100 text-blue-700 border-blue-200">
              {offer.availableSlots} {offer.availableSlots === 1 ? "cupo" : "cupos"}
            </div>
          )}
        </div>

        <h3 className="font-black text-2xl md:text-3xl text-slate-900 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all mb-1">
          {offer.title}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 mb-2">
          {offer.description}
        </p>

        <div className="flex items-center gap-4 text-slate-400 pl-1">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">
              {formatDate(offer.createdAt)}
            </span>
          </div>
          <div className="text-xs font-bold">Por: {offer.authorName}</div>
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

interface BuySellCardProps {
  buySell: BuySellForApplicant;
  onClick: () => void;
}

const BuySellCard = ({ buySell, onClick }: BuySellCardProps) => {
  const firstImage = buySell.imageUrls && buySell.imageUrls.length > 0 
    ? buySell.imageUrls[0] 
    : "/generic.png";

  return (
    <article
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-6 p-6 rounded-[2rem] transition-all duration-300 cursor-pointer w-full",
        "bg-white text-slate-800 shadow-xl",
        "hover:scale-[1.01] hover:shadow-2xl hover:bg-white",
        "border-4 border-transparent hover:border-purple-300"
      )}
    >
      <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100 shadow-md">
        <Image
          src={firstImage}
          alt={buySell.title}
          fill
          className="object-cover"
          sizes="128px"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/generic.png";
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100">
            <ShoppingBag className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-black uppercase tracking-wider text-cyan-800">
              {buySell.category}
            </span>
          </div>
          <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-green-100 text-green-700 border-green-200">
            {formatCurrency(buySell.price)}
          </div>
          <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-amber-100 text-amber-700 border-amber-200">
            {buySell.condition}
          </div>
        </div>

        <h3 className="font-black text-2xl md:text-3xl text-slate-900 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all mb-1">
          {buySell.title}
        </h3>

        <p className="text-sm text-slate-600 line-clamp-2 mb-2">
          {buySell.description}
        </p>

        <div className="flex items-center gap-4 text-slate-400 pl-1">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">
              {formatDate(buySell.createdAt)}
            </span>
          </div>
          <div className="text-xs font-bold">Por: {buySell.authorName}</div>
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
  <div className="w-full relative flex items-center justify-between p-6 rounded-[2rem] bg-white shadow-xl border-4 border-transparent overflow-hidden animate-pulse h-[180px]">
    <div className="flex-1 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-32 rounded-full bg-slate-200" />
        <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
      </div>
      <Skeleton className="h-9 w-2/3 rounded-lg bg-slate-200" />
      <Skeleton className="h-4 w-full rounded-lg bg-slate-200" />
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
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
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
  sort,
  setSort,
  sortOrder,
  toggleSortOrder,
  clearFilters,
}: FilterBarProps) => {
  const baseClass =
    "w-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60 rounded-full px-5 py-3.5 text-sm font-bold focus:bg-white focus:text-purple-900 focus:placeholder:text-purple-300 focus:ring-4 focus:ring-white/20 transition-all outline-none shadow-lg hover:bg-white/20";
  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none";

  return (
    <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-10 w-full">
      <div className="flex flex-col gap-4 items-stretch">
        <div className="flex-1 relative group">
          <Search
            className={`${iconClass} w-5 h-5 group-focus-within:text-purple-500`}
          />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${baseClass} pl-12`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
          <div className="relative w-full group">
            <ListFilter
              className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className={`${baseClass} pl-10 cursor-pointer appearance-none`}
            >
              <option value="Todos" className="text-slate-800">
                Todos los tipos
              </option>
              {OFFER_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="text-slate-800">
                  {t.text}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full group">
            <ArrowUpDown
              className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className={`${baseClass} pl-10 cursor-pointer appearance-none`}
            >
              <option value="CreatedAt" className="text-slate-800">
                Por fecha
              </option>
              <option value="Title" className="text-slate-800">
                Por título
              </option>
              <option value="Remuneration" className="text-slate-800">
                Por remuneración
              </option>
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

interface BuySellFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: BuySellFilterType;
  setFilterType: (type: BuySellFilterType) => void;
  sort: BuySellSortType;
  setSort: (sort: BuySellSortType) => void;
  sortOrder: "asc" | "desc";
  toggleSortOrder: () => void;
  clearFilters: () => void;
}

const BuySellFilterBar = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  sort,
  setSort,
  sortOrder,
  toggleSortOrder,
  clearFilters,
}: BuySellFilterBarProps) => {
  const baseClass =
    "w-full bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60 rounded-full px-5 py-3.5 text-sm font-bold focus:bg-white focus:text-purple-900 focus:placeholder:text-purple-300 focus:ring-4 focus:ring-white/20 transition-all outline-none shadow-lg hover:bg-white/20";
  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none";

  return (
    <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-10 w-full">
      <div className="flex flex-col gap-4 items-stretch">
        <div className="flex-1 relative group">
          <Search
            className={`${iconClass} w-5 h-5 group-focus-within:text-purple-500`}
          />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${baseClass} pl-12`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
          <div className="relative w-full group">
            <ListFilter
              className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as BuySellFilterType)}
              className={`${baseClass} pl-10 cursor-pointer appearance-none`}
            >
              <option value="Todos" className="text-slate-800">
                Todas las categorías
              </option>
              <option value="Electronica" className="text-slate-800">
                Electrónica
              </option>
              <option value="Ropa" className="text-slate-800">
                Ropa
              </option>
              <option value="Hogar" className="text-slate-800">
                Hogar
              </option>
              <option value="Vehiculos" className="text-slate-800">
                Vehículos
              </option>
              <option value="Deportes" className="text-slate-800">
                Deportes
              </option>
              <option value="Libros" className="text-slate-800">
                Libros
              </option>
              <option value="Musica" className="text-slate-800">
                Música
              </option>
              <option value="Juguetes" className="text-slate-800">
                Juguetes
              </option>
              <option value="Mascotas" className="text-slate-800">
                Mascotas
              </option>
              <option value="Otros" className="text-slate-800">
                Otros
              </option>
            </select>
          </div>

          <div className="relative w-full group">
            <ArrowUpDown
              className={`${iconClass} w-4 h-4 group-focus-within:text-purple-500`}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as BuySellSortType)}
              className={`${baseClass} pl-10 cursor-pointer appearance-none`}
            >
              <option value="CreatedAt" className="text-slate-800">
                Por fecha
              </option>
              <option value="Title" className="text-slate-800">
                Por título
              </option>
              <option value="Price" className="text-slate-800">
                Por precio
              </option>
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

function ExploreOffersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = getUserFromToken();
  const logged = isLoggedIn();

  // Get exploreType from URL or default to null (showing choice dialog)
  const [exploreType, setExploreType] = useState<ExploreType | null>(
    (searchParams.get("exploreType") as ExploreType) || null
  );
  
  // Offers state
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [filterType, setFilterType] = useState<FilterType>(
    (searchParams.get("type") as FilterType) || "Todos"
  );
  const [sort, setSort] = useState<SortType>(
    (searchParams.get("sort") as SortType) || "CreatedAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") || "desc"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const pageSize = 9;

  // BuySells state
  const [buySellSearchTerm, setBuySellSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [buySellFilterType, setBuySellFilterType] = useState<BuySellFilterType>(
    (searchParams.get("type") as BuySellFilterType) || "Todos"
  );
  const [buySellSort, setBuySellSort] = useState<BuySellSortType>(
    (searchParams.get("sort") as BuySellSortType) || "CreatedAt"
  );
  const [buySellSortOrder, setBuySellSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") || "desc"
  );
  const [buySellCurrentPage, setBuySellCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );

  // Update URL when filters change
  useEffect(() => {
    if (!exploreType) return; // Don't update URL if no type selected
    
    const params = new URLSearchParams();
    params.set("exploreType", exploreType);
    
    if (exploreType === "offers") {
      if (searchTerm) params.set("search", searchTerm);
      if (filterType !== "Todos") params.set("type", filterType);
      if (sort !== "CreatedAt") params.set("sort", sort);
      if (sortOrder !== "desc") params.set("order", sortOrder);
      if (currentPage > 1) params.set("page", currentPage.toString());
    } else {
      if (buySellSearchTerm) params.set("search", buySellSearchTerm);
      if (buySellFilterType !== "Todos") params.set("type", buySellFilterType);
      if (buySellSort !== "CreatedAt") params.set("sort", buySellSort);
      if (buySellSortOrder !== "desc") params.set("order", buySellSortOrder);
      if (buySellCurrentPage > 1) params.set("page", buySellCurrentPage.toString());
    }

    const newUrl = `?${params.toString()}`;
    router.replace(`/offers${newUrl}`, { scroll: false });
  }, [exploreType, searchTerm, filterType, sort, sortOrder, currentPage, 
      buySellSearchTerm, buySellFilterType, buySellSort, buySellSortOrder, buySellCurrentPage, router]);

  // Offers query
  const {
    data: offersData,
    isFetching: offersFetching,
    error: offersError,
    refetch: refetchOffers,
  } = useGetExploreOffers({
    searchTerm: searchTerm || undefined,
    filterBy: filterType !== "Todos" ? filterType : undefined,
    sortBy: sort,
    sortOrder,
    pageNumber: currentPage,
    pageSize,
  });

  // BuySells query
  const {
    data: buySellsData,
    isFetching: buySellsFetching,
    error: buySellsError,
    refetch: refetchBuySells,
  } = useGetExploreBuySells({
    searchTerm: buySellSearchTerm || undefined,
    filterBy: buySellFilterType !== "Todos" ? buySellFilterType : undefined,
    sortBy: buySellSort,
    sortOrder: buySellSortOrder,
    pageNumber: buySellCurrentPage,
    pageSize,
  });

  // Determine active data based on exploreType
  const isOffers = exploreType === "offers";
  const data = isOffers ? offersData : buySellsData;
  const isFetching = isOffers ? offersFetching : buySellsFetching;
  const apiError = isOffers ? offersError : buySellsError;
  const refetch = isOffers ? refetchOffers : refetchBuySells;

  const isViewLoading = isFetching && !data;
  const offers = offersData?.offers || [];
  const buySells = buySellsData?.buySells || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const handleViewDetail = (offer: OfferForApplicant) => {
    if (logged) {
      router.push(`/offers/${offer.id}`);
    } else {
      router.push(`/offers/${offer.id}/public`);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      if (isOffers) {
        setCurrentPage(newPage);
      } else {
        setBuySellCurrentPage(newPage);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleSortOrder = () => {
    if (isOffers) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      setCurrentPage(1);
    } else {
      setBuySellSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      setBuySellCurrentPage(1);
    }
  };

  const clearFilters = () => {
    if (isOffers) {
      setSearchTerm("");
      setFilterType("Todos");
      setSort("CreatedAt");
      setSortOrder("desc");
      setCurrentPage(1);
    } else {
      setBuySellSearchTerm("");
      setBuySellFilterType("Todos");
      setBuySellSort("CreatedAt");
      setBuySellSortOrder("desc");
      setBuySellCurrentPage(1);
    }
  };

  const handleViewBuySellDetail = (buySell: BuySellForApplicant) => {
    router.push(`/buysells/${buySell.id}`);
  };

  const handleExploreTypeChange = (type: ExploreType) => {
    setExploreType(type);
    // Reset filters when changing explore type
    clearFilters();
  };

  const apiErrorDetails = apiError ? handleApiError(apiError).details : null;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const activePage = isOffers ? currentPage : buySellCurrentPage;

    return (
      <div className="flex justify-center items-center gap-2 flex-wrap">
        <button
          onClick={() => handlePageChange(activePage - 1)}
          disabled={activePage === 1}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            activePage === 1
              ? "bg-white/5 text-white/30 cursor-not-allowed"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          ←
        </button>

        {/* First Page + Left Ellipsis */}
        {activePage > 3 && totalPages > 5 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-2 rounded-full font-bold transition-all bg-white/10 text-white hover:bg-white/20"
            >
              1
            </button>
            {activePage > 4 && <span className="px-2 text-white/50">...</span>}
          </>
        )}

        {/* Page Numbers (current ± 2) */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageOffset = Math.max(
            1,
            Math.min(activePage - 2, totalPages - 4)
          );
          const page = pageOffset + i;

          if (page < 1 || page > totalPages) return null;

          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${
                page === activePage
                  ? "bg-white text-purple-900"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Right Ellipsis + Last Page */}
        {activePage < totalPages - 2 && totalPages > 5 && (
          <>
            {activePage < totalPages - 3 && (
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
          onClick={() => handlePageChange(activePage + 1)}
          disabled={activePage === totalPages}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            activePage === totalPages
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
            <div className="font-extrabold text-xl mb-2">
              Error de conexión
            </div>
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

    const items = isOffers ? offers : buySells;
    const itemType = isOffers ? "ofertas" : "artículos";

    if (items.length === 0) {
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
            {totalCount === 0 ? `Sin ${itemType} disponibles` : "Sin resultados"}
          </h3>
          <p className="text-lg text-purple-200">
            {totalCount === 0
              ? `Aún no hay ${itemType} publicadas.`
              : `No hay ${itemType} que coincidan con los filtros seleccionados.`}
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
          {isOffers
            ? offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onClick={() => handleViewDetail(offer)}
                />
              ))
            : buySells.map((buySell) => (
                <BuySellCard
                  key={buySell.id}
                  buySell={buySell}
                  onClick={() => handleViewBuySellDetail(buySell)}
                />
              ))}
        </section>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">{renderPagination()}</div>
        )}
      </>
    );
  };

  // Show initial choice dialog if no exploreType is selected
  if (!exploreType) {
    return (
      <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 flex flex-col items-center justify-center min-h-[80vh] max-w-4xl">
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg mb-6">
                <Settings2 className="w-3.5 h-3.5" />
                Explora Oportunidades
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg leading-tight mb-4">
                ¿Qué deseas explorar?
              </h1>
              <p className="text-purple-100 text-lg md:text-xl font-medium">
                Selecciona una categoría para comenzar a explorar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ofertas Laborales Card */}
              <button
                type="button"
                onClick={() => handleExploreTypeChange("offers")}
                className="group relative overflow-hidden p-10 rounded-[2rem] border-2 border-white/20 bg-white/5 backdrop-blur-md hover:border-purple-300 hover:bg-white/10 hover:shadow-2xl transition-all"
              >
                <div className="relative z-10 text-center">
                  <div className="inline-flex p-6 rounded-2xl mb-6 bg-white/10 group-hover:bg-purple-500/20 transition-colors">
                    <Briefcase className="w-12 h-12 text-white group-hover:text-purple-200 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">
                    Ofertas Laborales
                  </h3>
                  <p className="text-base text-purple-100">
                    Trabajos remunerados y voluntariados para estudiantes
                  </p>
                </div>
              </button>

              {/* Compra/Venta Card */}
              <button
                type="button"
                onClick={() => handleExploreTypeChange("buysells")}
                className="group relative overflow-hidden p-10 rounded-[2rem] border-2 border-white/20 bg-white/5 backdrop-blur-md hover:border-purple-300 hover:bg-white/10 hover:shadow-2xl transition-all"
              >
                <div className="relative z-10 text-center">
                  <div className="inline-flex p-6 rounded-2xl mb-6 bg-white/10 group-hover:bg-purple-500/20 transition-colors">
                    <ShoppingBag className="w-12 h-12 text-white group-hover:text-purple-200 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">
                    Compra/Venta
                  </h3>
                  <p className="text-base text-purple-100">
                    Libros, materiales y artículos de segunda mano
                  </p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show main explore content after type is selected
  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white bg-ucn-purple">

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 max-w-7xl">
        <header className="mb-10">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg transform mb-3">
                <Settings2 className="w-3.5 h-3.5" />
                Explora Oportunidades
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg leading-tight">
                {exploreType === "offers" ? "Ofertas Laborales" : "Compra/Venta"}
              </h1>
              <p className="text-purple-100 text-lg md:text-xl font-medium mt-3 drop-shadow-md">
                {exploreType === "offers" ? (
                  <>
                    Explora <span className="text-yellow-300 font-black text-2xl">{totalCount}</span>{" "}
                    oportunidades laborales para la comunidad UCN.
                  </>
                ) : (
                  <>
                    Descubre <span className="text-yellow-300 font-black text-2xl">{totalCount}</span>{" "}
                    artículos en venta de la comunidad UCN.
                  </>
                )}
              </p>
            </div>

            {/* Segmented Control to Switch Between Types */}
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl flex gap-2 w-full sm:w-auto border border-white/20">
              <button
                type="button"
                onClick={() => handleExploreTypeChange("offers")}
                className={`
                  flex-1 sm:flex-initial px-6 py-3 rounded-xl font-bold text-sm transition-all
                  ${exploreType === "offers"
                    ? "bg-white text-purple-600 shadow-md"
                    : "text-white hover:bg-white/10"
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Ofertas Laborales</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleExploreTypeChange("buysells")}
                className={`
                  flex-1 sm:flex-initial px-6 py-3 rounded-xl font-bold text-sm transition-all
                  ${exploreType === "buysells"
                    ? "bg-white text-purple-600 shadow-md"
                    : "text-white hover:bg-white/10"
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Compra/Venta</span>
                </div>
              </button>
            </div>

            {logged && user?.userType !== "Estudiante" && (
              <Link
                href="/offerer/create-publication"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Publicar +
              </Link>
            )}
          </div>
        </header>

        {exploreType === "offers" ? (
          <>
            <FilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              sort={sort}
              setSort={setSort}
              sortOrder={sortOrder}
              toggleSortOrder={toggleSortOrder}
              clearFilters={clearFilters}
            />
            {renderContent()}
          </>
        ) : (
          <>
            <BuySellFilterBar
              searchTerm={buySellSearchTerm}
              setSearchTerm={setBuySellSearchTerm}
              filterType={buySellFilterType}
              setFilterType={setBuySellFilterType}
              sort={buySellSort}
              setSort={setBuySellSort}
              sortOrder={buySellSortOrder}
              toggleSortOrder={toggleSortOrder}
              clearFilters={clearFilters}
            />
            {renderContent()}
          </>
        )}
      </main>
    </div>
  );
}

export default function OffersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Cargando...</div>
        </div>
      }
    >
      <ExploreOffersContent />
    </Suspense>
  );
}