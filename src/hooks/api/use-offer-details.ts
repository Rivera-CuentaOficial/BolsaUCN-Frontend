// frontend/src/hooks/api/use-offer-details.ts (UPDATE)

import { useQuery } from "@tanstack/react-query";
import { explorePublicationService } from "@/services/explorePublicationService";

export const useGetOfferDetails = (publicationId: number, forcePublic: boolean = false) => {
  return useQuery({
    queryKey: ["offer-details", publicationId, forcePublic],
    queryFn: async () => {
      if (forcePublic) {
        const response = await explorePublicationService.getOfferDetailsPublic(publicationId);
        return response.data.data;
      } else {
        // Try authenticated endpoint, fallback to public if unauthorized
        try {
          const response = await explorePublicationService.getOfferDetailsForApplicant(publicationId);
          return response.data.data;
        } catch (error: any) {
          // If 401/403, fallback to public endpoint
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            const response = await explorePublicationService.getOfferDetailsPublic(publicationId);
            return response.data.data;
          }
          throw error;
        }
      }
    },
    enabled: !!publicationId,
    staleTime: 60000, // 1 minute
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 as we handle it in the query function
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};