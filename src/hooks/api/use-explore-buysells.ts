import { useQuery } from "@tanstack/react-query";
import { explorePublicationService } from "@/services/explorePublicationService";
import type { ExploreBuySellsSearchParams } from "@/models/responses";

export const useGetExploreBuySells = (params: ExploreBuySellsSearchParams) => {
  return useQuery({
    queryKey: ["explore-buysells", params],
    queryFn: async () => {
      const response = await explorePublicationService.getExploreBuySells(params);
      return response.data.data;
    },
    staleTime: 30000, // 30 seconds
  });
};
