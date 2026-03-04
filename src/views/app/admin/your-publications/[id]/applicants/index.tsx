"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertCircle, Users } from "lucide-react";
import { useApplicantsView } from "./hooks";
import ApplicantCard from "./components/applicant-card";
import ApplicantFilterBar, { ApplicantFilterType } from "./components/view-applicants-filter-bar";
import { ApplicantListSkeleton } from "./components/applicant-list-skeleton";

interface Props {
  offerId: string | number;
}

export default function ApplicantsPageView({ offerId }: Props) {
  const router = useRouter();
  const backRoute = `/offerer/your-publications/${offerId}`;
  const { 
    applicants: rawApplicants,
    isLoading, 
    isError, 
    searchTerm, 
    setSearchTerm,
    totalCount: totalCountFromHook
  } = useApplicantsView(offerId);
  const [filterType, setFilterType] = useState<ApplicantFilterType>("Todos");
  const filteredApplicants = useMemo(() => {
    if (!rawApplicants) return [];

    let result = rawApplicants;
    if (filterType !== "Todos") {
        result = result.filter(app => app.status === filterType);
    }

    return result;
  }, [rawApplicants, filterType]);

  const finalCount = filteredApplicants.length;

  const handleViewDetail = (postulantId: number) => {
    router.push(`/offerer/your-publications/${offerId}/applicants/${postulantId}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <ApplicantListSkeleton />;
    }

    if (isError) {
      return (
        <div className="max-w-xl mx-auto p-8 mt-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-center text-white shadow-2xl">
          <div className="flex justify-center mb-4">
             <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Error al cargar datos</h2>
          <p className="text-white/80 mb-6">No pudimos obtener la lista de postulantes.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-purple-900 rounded-full font-bold hover:bg-purple-100 transition shadow-lg"
          >
            Reintentar
          </button>
        </div>
      );
    }

    // 3. Empty State (Sin resultados)
    if (finalCount === 0) {
      return (
        <div className="mt-12 p-12 text-center bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 text-white shadow-xl">
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-black mb-2">Sin postulantes</h3>
          <p className="text-lg text-purple-200">
             {searchTerm || filterType !== "Todos" 
                ? "No hay coincidencias con los filtros actuales."
                : "Aún no hay postulantes para esta oferta."}
          </p>
        </div>
      );
    }

    // 4. Lista de Datos
    return (
      <div className="mt-6 space-y-4 pb-20">
        {filteredApplicants.map((applicant) => (
          <ApplicantCard
            key={applicant.studentId}
            applicant={applicant}
            onViewDetail={handleViewDetail}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-ucn-purple">

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <header className="mb-8">
            <button
                onClick={() => router.push(backRoute)}
                className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10"
            >
                <ChevronLeft className="h-4 w-4" />
                Volver a la Oferta
            </button>

            <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                    <Users className="w-3 h-3" /> Panel del Reclutador
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight">
                    Postulantes de la Oferta
                </h1>
                <p className="text-purple-100 text-lg font-medium mt-1 drop-shadow-md">
                    Visualizando <span className="text-yellow-300 font-black">{finalCount}</span> postulaciones.
                </p>
            </div>
        </header>

        <div className="mb-8">
            <ApplicantFilterBar
                text={searchTerm}
                setText={setSearchTerm}
                filterType={filterType}
                setFilterType={setFilterType}
            />
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
  // const { applicants, isLoading, error, refetch, totalCount, filterState } =
  //   useGetOffererApplicantsView(id);

  //   const { filterType, setFilterType, text, setText } = filterState;

  //   const handleViewDetail = (applicantId: number) => {
  //     router.push(
  //       `/offerer/your-publications/${id}/applicants/${applicantId}/detail`
  //     );
  //   };

  //   const renderContent = () => {
  //     if (isLoading) {
  //       return (
  //         <div className="text-center mt-12 text-[var(--muted-ink)]">
  //           Cargando lista de postulantes...
  //         </div>
  //       );
  //     }
  //     if (error) {
  //       return (
  //         <div className="max-w-xl mx-auto p-8 mt-12 bg-red-50 border border-red-200 rounded-lg text-center">
  //           <h2 className="text-xl font-semibold text-red-600 mb-4 flex justify-center items-center gap-2">
  //             <AlertCircle size={24} /> Error al cargar postulantes
  //           </h2>
  //           <p className="text-sm text-red-500 mb-6">{error}</p>
  //           <button
  //             onClick={refetch}
  //             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold"
  //           >
  //             Reintentar
  //           </button>
  //         </div>
  //       );
  //     }
  //     if (totalCount === 0) {
  //       return (
  //         <div className="text-center mt-12 p-8 border border-[var(--border)] rounded-xl text-[var(--muted-ink)]">
  //           No hay postulantes registrados para esta publicación.
  //         </div>
  //       );
  //     }
  //     return (
  //       <div className="mt-6 space-y-3">
  //         {applicants.map((applicant: ViewAppplicantsForAdmin, index) => (
  //           <ApplicantCard
  //             key={applicant.id || index}
  //             applicant={applicant}
  //             onViewDetail={handleViewDetail}
  //           />
  //         ))}
  //       </div>
  //     );
  //   };

  //   return (
  //     <main className="max-w-7xl mx-auto px-4 py-6">
  //       <button
  //         onClick={() => router.push(backRoute)}
  //         className="mb-4 text-[var(--primary)] hover:underline flex items-center gap-1"
  //       >
  //         <ChevronLeft size={20} /> Volver al detalle
  //       </button>

  //       <h1 className="text-3xl font-extrabold text-[var(--ink)] mb-1">
  //         Postulantes de la oferta
  //       </h1>

  //       <p className="text-base text-[var(--muted-ink)] mb-4">
  //         {totalCount} postulantes encontrados.
  //       </p>

  //       <ApplicantFilterBar
  //         text={text}
  //         setText={setText}
  //         filterType={filterType}
  //         setFilterType={setFilterType}
  //       />

  //       {renderContent()}
  //     </main>
  //   );

