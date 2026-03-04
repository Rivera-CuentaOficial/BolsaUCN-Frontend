import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ValidationActionVariables } from "@/models/requests";
import { handleApiError } from "@/lib";
import { validationService } from "@/services/validationService";
import { PaginatedValidationItems } from "@/models/responses/publication";

export const useGetPendingPublications = (params?: {
    searchTerm?: string;
    filterBy?: string;
    sortBy?: string;
    sortOrder?: string;
    pageNumber?: number;
    pageSize?: number;
}) => {
    return useQuery<PaginatedValidationItems, Error>({
        queryKey: ["admin", "validation", "pending", params],
        queryFn: async () => {
            try {
                const response = await validationService.getPendingPublications(params);
                const data = response.data.data;

                //? NUEVA IMPLEMENTACION
                return {
                    publications: data.publications,
                    totalCount: data.totalCount,
                    currentPage: data.currentPage,
                    pageSize: data.pageSize,
                    totalPages: data.totalPages
                };
            } catch (error) {
                const apiError = handleApiError(error);
                throw new Error(apiError.details || apiError.message);
            }
        },
    });
};

export const useValidationActionMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<any, Error, ValidationActionVariables>({
        mutationFn: ({ id, action, rejectionReason }) => {
            const publicationId = id.startsWith('bs-') ? parseInt(id.split('-')[1]) : parseInt(id);
            return validationService.validatePublication(publicationId, action, rejectionReason);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "validation", "pending"] });
        },
    });
};