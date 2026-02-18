import { useQuery } from "@tanstack/react-query";
import { applicationService } from "@/services/applicationService";
import {
  ApplicationsForApplicantDTO,
  ApplicationSearchParams
} from "@/models/responses";
import { handleApiError } from "@/lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCancelApplication = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (applicationId: number) => {
            const response = await applicationService.cancelApplication(applicationId);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate and refetch application queries
            queryClient.invalidateQueries({ queryKey: ["applications"] });
        },
    });
};

export const useGetMyApplications = (params: ApplicationSearchParams) => {
    return useQuery<ApplicationsForApplicantDTO, Error>({
        queryKey: ["applications", "my-applications", params],
        queryFn: async () => {
            try {
                const response = await applicationService.getMyApplications(params);
                return response.data.data;
            } catch (error) {
                const apiError = handleApiError(error);
                throw new Error(apiError.details || apiError.message);
            }
        },
    });
};