import { useQuery } from "@tanstack/react-query";
import { explorePublicationService } from "@/services/explorePublicationService";
import type { ExploreOffersSearchParams } from "@/models/responses";

export const useGetExploreOffers = (params: ExploreOffersSearchParams) => {
  return useQuery({
    queryKey: ["explore-offers", params],
    queryFn: async () => {
      const response = await explorePublicationService.getExploreOffers(params);
      return response.data.data;
    },
    staleTime: 30000, // 30 seconds
  });
};