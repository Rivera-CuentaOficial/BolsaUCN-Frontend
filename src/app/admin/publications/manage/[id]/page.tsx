import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { manageService } from "@/services/managePublicationService";
import { isValidId, mapOfferToDetail, mapBuySellToDetail } from "@/lib";
import { AdminDetail } from "@/models/responses";
import { ManageDetailView } from "@/views/app";

interface ManageDetailPageProps {
    params: { id: string };
}
async function getPublicationDetailForServer(id: string): Promise<AdminDetail> {
    const isBuySell = id.startsWith('bs-');
    const entityId = isBuySell ? id.split('-')[1] : id;
    const typePath: "buysells" | "offers" = isBuySell ? "buysells" : "offers";
    const response = await manageService.getPublicationManagementDetail(typePath, entityId);
    const detailDto = response.data?.data ?? response.data;
    if (!detailDto) {
        throw new Error("Respuesta de API vacía o malformada.");
    }
    const mappedDetail: AdminDetail = isBuySell
        ? mapBuySellToDetail(detailDto)
        : mapOfferToDetail(detailDto);
    return { ...mappedDetail, id };
}
export async function generateMetadata({
    params,
}: ManageDetailPageProps): Promise<Metadata> {
    const { id } = params;

    return {
        title: "Administrar Publicación",
        description: `Detalles de gestión para la publicación ${id}.`,
    };
}
export default async function ManageDetailPage({
    params,
}: ManageDetailPageProps) {
    const { id } = params;

    if (!id) {
        return notFound();
    }

    const queryClient = new QueryClient();
    try {
        await queryClient.fetchQuery({
            queryKey: ["admin", "publication", id],
            queryFn: () => getPublicationDetailForServer(id),
        });
    } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.status === 404) {
            return notFound();
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ManageDetailView id={id} />
        </HydrationBoundary>
    );
}