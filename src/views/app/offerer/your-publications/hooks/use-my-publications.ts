import { offererPublicationService } from '@/services/offererPublicationService';
import { useQuery } from "@tanstack/react-query";
import type { MyPublicationsSearchParams } from "@/models/responses";

export const useGetMyPublications = (params: MyPublicationsSearchParams) => {
  return useQuery({
    queryKey: ["my-publications", params],
    queryFn: async () => {
      const response = await offererPublicationService.getMyPublications(params);
      return response.data.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};