"use client";
import { useMemo, useState } from "react";
import { useRouter } from 'next/navigation';
import { useGetPendingPublications } from "@/hooks/api/use-validation-service"; 
import { ValidationType } from "@/models/responses"; 
import { totalmem } from "os";

type SortType = "recientes" | "titulo";

export const useValidationView = () => {
    const router = useRouter();
    const [text, setText] = useState("");
    const [type, setType] = useState<ValidationType>("Todos");
    const [sort, setSort] = useState<SortType>("recientes");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filterBy = type !== "Todos"
        ? (type === "Compra/Venta" ? "CompraVenta" : "Oferta")
        : undefined;

    const sortBy = sort === "titulo" ? "Title" : "CreatedAt";
    const sortOrder = sort === "recientes" ? "desc" : "asc";

    const {
        data,
        isFetching, // Usamos isFetching para detectar la carga inicial real
        error: apiError,
        refetch,
    } = useGetPendingPublications({
        searchTerm: text || undefined,
        filterBy,
        sortBy,
        sortOrder,
        pageNumber: currentPage,
        pageSize });

    // LÓGICA ANTI-PARPADEO (Igual que en Gestión):
    // Si estamos buscando datos y el array está vacío o indefinido, consideramos que está "Cargando Vista".
    const isViewLoading = isFetching && !data;

    const handleViewDetail = (publicationId: string) => {
        router.push(`/admin/publications/validate/${publicationId}`);
    };

    const errorMessage = apiError ? (apiError as Error).message : null;

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({top: 0, behavior: 'smooth'}); 
    }

    return {
        // CLAVE: Devolvemos NULL si está cargando para activar los Skeletons en la vista
        pendingPublications: isViewLoading ? null : data?.publications || [],
        
        totalCount: data?.totalCount || 0,
        currentPage: data?.currentPage || 1,
        totalPages: data?.totalPages || 1,
        pageSize: data?.pageSize || pageSize,

        hasOffers: (data?.totalCount || 0) > 0,
        
        isLoading: isViewLoading,
        error: errorMessage,
        filters: { text, type, sort },
        actions: {
            setText: (newText: string) => {
                setText(newText);
                setCurrentPage(1); // Resetear a la primera página al cambiar el texto
            },
            setType: (newType: ValidationType) => {
                setType(newType);
                setCurrentPage(1); // Resetear a la primera página al cambiar el filtro
            },
            setSort: (newSort: SortType) => {
                setSort(newSort);
                setCurrentPage(1); // Resetear a la primera página al cambiar el orden
            },
            setPageSize: (newPageSize: number) => {
                setPageSize(newPageSize);
                setCurrentPage(1); // Resetear a la primera página al cambiar el tamaño de página
            },
            handlePageChange,
            handleRetry: refetch,
            handleViewDetail
        }
    };
};