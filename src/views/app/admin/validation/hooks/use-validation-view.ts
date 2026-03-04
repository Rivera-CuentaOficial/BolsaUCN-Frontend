"use client";
import { useQuery } from "@tanstack/react-query";
import { validationService } from "@/services/validationService";
import { handleApiError } from "@/lib";
import { PublicationsForValidationDTO } from "@/models/responses/publication";

interface ValidationSearchParams {
    searchTerm?: string;
    filterByType?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    pageNumber?: number;
    pageSize?: number;
}

export const useGetPendingPublicationsForAdmin = (params: ValidationSearchParams) => {
    return useQuery({
        queryKey: ["admin", "validation", "pending", params],
        queryFn: async () => {
            const response = await validationService.getPendingPublications({
                searchTerm: params.searchTerm,
                filterBy: params.filterByType,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
                pageNumber: params.pageNumber,
                pageSize: params.pageSize,
            });
            const data = response.data.data;
            return data as PublicationsForValidationDTO;
        },
        staleTime: 30000, // 30 seconds
    });
};