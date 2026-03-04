import { useQuery } from "@tanstack/react-query";
import { applicationService } from "@/services/applicationService";
import type { ApplicationsForAdminSearchParams } from "@/models/responses";

export const useGetApplicationsByOfferIdForAdmin = (
  offerId: number,
  params: ApplicationsForAdminSearchParams
) => {
  return useQuery({
    queryKey: ["applications", offerId, params],
    queryFn: async () => {
      const response = await applicationService.getApplicationsByOfferIdForAdmin(offerId, params);
      return response.data.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};