"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetMyApplications } from "@/hooks/api/use-application-service";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui";

type ApplicationStatus = "Todos" | "Pendiente" | "Aceptada" | "Rechazada";
type SortBy = "OfferTitle" | "CreatedAt";
type SortOrder = "asc" | "desc";

function toCLDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(+d)
    ? "—"
    : d.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function StatusBadge({ value }: { value?: string | null }) {
  const v = (value ?? "Pendiente") as ApplicationStatus;
  const map: Record<ApplicationStatus, { wrap: string; label: string }> = {
    Todos: { wrap: "", label: "" },
    Pendiente: {
      wrap: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pendiente",
    },
    Aceptada: {
      wrap: "bg-green-100 text-green-800 border-green-200",
      label: "Aceptada",
    },
    Rechazada: {
      wrap: "bg-red-100 text-red-800 border-red-200",
      label: "Rechazada",
    },
  };
  const { wrap, label } = map[v] ?? map.Pendiente;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm border ${wrap}`}
    >
      {label}
    </span>
  );
}

function cardAccent(status?: string | null) {
  const v = (status ?? "Pendiente");
  if (v === "Aceptada") return "border-green-200 hover:ring-green-100/60";
  if (v === "Rechazada") return "border-red-200 hover:ring-red-100/60";
  return "border-yellow-200 hover:ring-yellow-100/60";
}

export default function JobsHistoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>("Todos");
  const [sortBy, setSortBy] = useState<SortBy>("CreatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useGetMyApplications({
    searchTerm: searchTerm || undefined,
    statusFilter: statusFilter !== "Todos" ? statusFilter : undefined,
    sortBy,
    sortOrder,
    pageNumber: currentPage,
    pageSize,
  });

  const applications = data?.applications ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: ApplicationStatus) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSortByChange = (newSortBy: SortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };
  
  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  if (isLoading) return <main className="max-w-4xl mx-auto p-6">Cargando…</main>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-3xl md:text-4xl font-extrabold">
          Historial de postulaciones
        </h1>
        <p className="text-(--muted-ink) mt-2">
          Aquí puedes revisar todas las postulaciones que has enviado.
          {totalCount > 0 && (
            <span className="font-semibold"> ({totalCount} total)</span>
          )}
        </p>
        {error && (
          <div className="mt-3 rounded-xl bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error.message}
          </div>
        )}
      </header>

      {/* Search and Status Filter */}
      <section className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-(--muted-ink)" />
          <input
            type="text"
            placeholder="Buscar por título de oferta..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
          className="px-4 py-2 rounded-xl border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aceptada">Aceptada</option>
          <option value="Rechazada">Rechazada</option>
        </select>
      </section>

      {/* Sort and Page Size Controls */}
      <section className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-(--muted-ink) font-medium">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value as SortBy)}
            className="px-3 py-1.5 text-sm rounded-lg border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)"
          >
            <option value="CreatedAt">Fecha de postulación</option>
            <option value="OfferTitle">Título de oferta</option>
          </select>
          
          <button
            onClick={handleSortOrderToggle}
            className="px-3 py-1.5 rounded-lg border border-(--border) bg-(--card) hover:bg-(--muted) transition-colors flex items-center gap-2"
            title={sortOrder === "asc" ? "Orden ascendente" : "Orden descendente"}
          >
            {sortOrder === "asc" ? (
              <>
                <ArrowUp size={16} />
                <span className="text-sm">
                  {sortBy === "CreatedAt" ? "Mas antiguas" : "A-Z"}
                </span>
              </>
            ) : (
              <>
                <ArrowDown size={16} />
                <span className="text-sm">
                  {sortBy === "CreatedAt" ? "Mas recientes" : "Z-A"}
                </span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-(--muted-ink) font-medium">Mostrar:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-3 py-1.5 text-sm rounded-lg border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)"
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
          </select>
        </div>
      </section>

      {applications.length === 0 ? (
        <section className="rounded-2xl border border-(--border) bg-(--card) p-6 text-center text-(--muted-ink)">
          {searchTerm || statusFilter !== "Todos"
            ? "No se encontraron postulaciones con los filtros aplicados."
            : "Aún no tienes postulaciones registradas."}
        </section>
      ) : (
        <>
          <section className="space-y-3">
            {applications.map((app) => (
              <article
                key={app.offerId}
                className={[
                  "group relative overflow-hidden rounded-2xl border bg-(--card) p-4 shadow-sm transition",
                  "hover:shadow-md hover:ring-4 cursor-pointer",
                  cardAccent(app.status),
                ].join(" ")}
                onClick={() => router.push(`/jobs/history/${app.offerId}`)}
              >
                {/* Accent lateral */}
                <span
                  aria-hidden="true"
                  className={[
                    "absolute inset-y-0 left-0 w-1",
                    app.status === "Aceptada" && "bg-green-400",
                    app.status === "Rechazada" && "bg-red-400",
                    app.status === "Pendiente" && "bg-yellow-400",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[17px] truncate">
                      {app.offerTitle}
                    </h3>
                    <div className="text-sm text-(--muted-ink) mt-0.5">
                      Postulada el {toCLDate(app.createdAt)}
                    </div>
                  </div>
                  <StatusBadge value={app.status} />
                </div>
              </article>
            ))}
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-between text-sm gap-4 mt-8">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} /> Anterior
              </Button>

              <span className="font-medium text-sm">
                Página {currentPage} de {totalPages}
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente <ChevronRight size={16} />
              </Button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}