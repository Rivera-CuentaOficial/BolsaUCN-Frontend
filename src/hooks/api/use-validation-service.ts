import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ValidationActionVariables } from "@/models/requests";
import { useParams } from 'next/navigation';
import { mapOfferDtoToValidate, mapBuySellDtoToValidate, mapBuySellToDetail, mapOfferToDetail, handleApiError, toOfferTypeForAdmin } from "@/lib";
import { validationService } from "@/services/validationService";
import { PendingOffersForAdmin, BuySellBasic, AdminDetail, UseAdminDetailValidateResult, ValidationItemFull, ValidationResponse } from "@/models/responses";
import { AxiosError } from "axios";
import { PaginatedValidationItems, PublicationForValidationDTO } from "@/models/responses/publication";

function mapPublicationDTOToValidate(p: PublicationForValidationDTO): ValidationItemFull {
    if (p.type === 'Oferta') {
        return {
            id: String(p.publicationId),
            item: {
                id: String(p.publicationId),
                title: p.title,
                offerType: toOfferTypeForAdmin(p.offerType ?? 0),
            }
        };
    } else {
        return {
            id: `bs-${String(p.publicationId)}`,
            item: {
                id: `bs-${String(p.publicationId)}`,
                title: p.title,
                type: 'Compra/Venta',
            }
        };
    }
}

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
                    publications: data.publications.map(mapPublicationDTOToValidate),
                    totalCount: data.totalCount,
                    currentPage: data.currentPage,
                    pageSize: data.pageSize,
                    totalPages: data.totalPages
                };
            } catch (error) {
                const apiError = handleApiError(error);
                throw new Error(apiError.details || apiError.message);
            }
            /*const [offersRes, buysellsRes] = await Promise.all([
            validationService.getPendingOffers(),
            validationService.getPendingBuySells(),
            ]);
            const offersData = offersRes.data.data;
            const buysellsData = buysellsRes.data.data;
            const mappedOffers = offersData
                .filter(o => o && o.id)
                .map(o => {
                    const itemData = mapOfferDtoToValidate(o);
                    return ({
                        id: String(o.id),
                        item: {
                            ...itemData,
                            type: itemData.offerType,
                        }
                    });
                }) as ValidationItemFull[];
                const mappedBuys = buysellsData
                    .filter(b => b && b.id)
                    .map(b => {
                        const itemData = mapBuySellDtoToValidate(b);
                        return ({
                            id: `bs-${String(b.id)}`,
                            item: {
                                ...itemData,
                                type: 'Compra/Venta',
                            }
                        });
                    }) as ValidationItemFull[];
                return [...mappedOffers, ...mappedBuys];
        } catch (error) {
            const apiError = handleApiError(error);
            throw new Error(apiError.details || apiError.message);
        }*/
        },
    });
};

export const useGetAdminPublicationDetailQuery = (id: string | undefined) => {
    return useQuery<AdminDetail, Error>({
        queryKey: ["admin", "publication", id],
        queryFn: async () => {
            if (!id || id === 'undefined') throw new Error("ID de publicación no válido.");
            const isBuySellPrefixed = id.startsWith('bs-');
            const entityId = isBuySellPrefixed ? id.split('-')[1] : id;
            if (isBuySellPrefixed) {
                const response = await validationService.getPublicationDetail("buysells", entityId);
                const detailDto = response.data?.data ?? response.data;
                if (!detailDto) throw new Error("Respuesta de API vacía o malformada.");
                return { ...mapBuySellToDetail(detailDto), id };
            }
            try {
                const response = await validationService.getPublicationDetail("offers", entityId);
                const detailDto = response.data?.data ?? response.data;
                if (!detailDto) throw new Error("Respuesta de API vacía o malformada.");
                return { ...mapOfferToDetail(detailDto), id };
            } catch (error) {
                if (error instanceof AxiosError && error.response?.status === 404) {
                    try {
                        const response = await validationService.getPublicationDetail("buysells", entityId);
                        const detailDto = response.data?.data ?? response.data;
                        if (!detailDto) throw new Error("Respuesta de API vacía o malformada.");
                        return { ...mapBuySellToDetail(detailDto), id };
                    } catch (innerError) {
                        const apiError = handleApiError(innerError);
                        throw new Error(apiError.details || `Publicación con ID ${entityId} no encontrada.`);
                    }
                }
                const apiError = handleApiError(error);
                throw new Error(apiError.details || apiError.message);
            }
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

export const useValidationActionMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<any, Error, ValidationActionVariables>({
        mutationFn: ({ id, action }) => {
            const publicationId = id.startsWith('bs-') ? parseInt(id.split('-')[1]) : parseInt(id);
            return validationService.validatePublication(publicationId, action);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "validation", "pending"] });
        },
    });
};