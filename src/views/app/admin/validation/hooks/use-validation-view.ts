"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetPendingPublications } from "@/hooks/api/use-validation-service"; 
import { ValidationType } from "@/models/responses"; 

type SortType = "recientes" | "titulo";
type ViewMode = "grid" | "list";

export const useValidationView = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize from URL params
    const [text, setText] = useState(searchParams.get("search") || "");
    const [type, setType] = useState<ValidationType>((searchParams.get("type") as ValidationType) || "Todos");
    const [sort, setSort] = useState<SortType>((searchParams.get("sort") as SortType) || "recientes");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">((searchParams.get("order") as "asc" | "desc") || "desc");
    const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get("view") as ViewMode) || "list");
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));
    const [pageSize] = useState(10);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (text) params.set("search", text);
        if (type !== "Todos") params.set("type", type);
        if (sort !== "recientes") params.set("sort", sort);
        if (sortOrder !== "desc") params.set("order", sortOrder);
        if (viewMode !== "list") params.set("view", viewMode);
        if (currentPage > 1) params.set("page", currentPage.toString());

        const newUrl = params.toString() ? `?${params.toString()}` : "";
        router.replace(`/admin/publications/validate${newUrl}`, { scroll: false });
    }, [text, type, sort, sortOrder, viewMode, currentPage, router]);

    const filterBy = type !== "Todos"
        ? (type === "Compra/Venta" ? "CompraVenta" : "Oferta")
        : undefined;

    const sortBy = sort === "titulo" ? "Title" : "CreatedAt";

    const {
        data,
        isFetching,
        error: apiError,
        refetch,
    } = useGetPendingPublications({
        searchTerm: text || undefined,
        filterBy,
        sortBy,
        sortOrder,
        pageNumber: currentPage,
        pageSize 
    });

    const isViewLoading = isFetching && !data;

    const handleViewDetail = (publicationId: string) => {
        router.push(`/admin/publications/validate/${publicationId}`);
    };

    const errorMessage = apiError ? (apiError as Error).message : null;

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({top: 0, behavior: 'smooth'}); 
    }

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === "asc" ? "desc" : "asc");
        setCurrentPage(1);
    }

    return {
        pendingPublications: isViewLoading ? null : data?.publications || [],
        
        totalCount: data?.totalCount || 0,
        currentPage: data?.currentPage || 1,
        totalPages: data?.totalPages || 1,
        pageSize: data?.pageSize || pageSize,

        hasOffers: (data?.totalCount || 0) > 0,
        
        isLoading: isViewLoading,
        error: errorMessage,
        viewMode,
        filters: { text, type, sort, sortOrder },
        actions: {
            setText: (newText: string) => {
                setText(newText);
                setCurrentPage(1);
            },
            setType: (newType: ValidationType) => {
                setType(newType);
                setCurrentPage(1);
            },
            setSort: (newSort: SortType) => {
                setSort(newSort);
                setCurrentPage(1);
            },
            toggleSortOrder,
            setViewMode,
            handlePageChange,
            handleRetry: refetch,
            handleViewDetail
        }
    };
};