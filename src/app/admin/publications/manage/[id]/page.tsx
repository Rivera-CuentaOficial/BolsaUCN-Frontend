import { Metadata } from "next";
import { ManageDetailView } from "@/views/app";

interface ManageDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ManageDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "Administrar Publicación",
    description: `Detalles de gestión para la publicación ${id}.`,
  };
}

export default async function ManageDetailPage({
  params,
}: ManageDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  return <ManageDetailView id={numericId} />;
}