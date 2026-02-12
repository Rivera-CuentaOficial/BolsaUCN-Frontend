"use client";

import { useQuery } from "@tanstack/react-query";
import { manageService } from "@/services/managePublicationService";
import type { PublicationsForAdminSearchParams } from "@/models/responses";

export const useGetManagePublications = (params: PublicationsForAdminSearchParams) => {
  return useQuery({
    queryKey: ["admin", "manage-publications", params],
    queryFn: async () => {
      const response = await manageService.getAllPublicationsForAdmin(params);
      return response.data.data || response.data;
    },
    staleTime: 30000, // 30 seconds
  });
};