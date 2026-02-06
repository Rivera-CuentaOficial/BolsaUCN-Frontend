import { useQuery } from "@tanstack/react-query";
import { applicationService } from "@/services/applicationService";
import type { ApplicationsForOfferorSearchParams } from "@/models/responses";

export const useGetApplicationsByOfferId = (
  offerId: number,
  params: ApplicationsForOfferorSearchParams
) => {
  return useQuery({
    queryKey: ["applications", offerId, params],
    queryFn: async () => {
      const response = await applicationService.getApplicationsByOfferId(offerId, params);
      return response.data.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};