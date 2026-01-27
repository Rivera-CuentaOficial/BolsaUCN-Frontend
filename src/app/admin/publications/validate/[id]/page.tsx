import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { validationService } from "@/services/validationService";
import { isValidId, mapOfferToDetail, mapBuySellToDetail } from "@/lib";
import { AdminDetail } from "@/models/responses";
import ValidationDetailView from "@/views/app/admin/validation/[id]";

interface ValidationDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getPublicationDetailForServer(id: string): Promise<AdminDetail> {
  const isBuySell = id.startsWith('bs-');
  const entityId = isBuySell ? id.split('-')[1] : id;

  const response = await validationService.getPublicationDetailForApproval(
    entityId
  );
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
}: ValidationDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "Validar Publicaciones", 
    description: "Detalles de publicación pendiente.",
  };
}

export default async function ValidationDetailPage({
  params,
}: ValidationDetailPageProps) {
  const { id } = await params;

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
      <ValidationDetailView id={id} />
    </HydrationBoundary>
  );
}