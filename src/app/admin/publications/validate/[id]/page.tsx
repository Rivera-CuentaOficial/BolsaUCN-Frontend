import { Metadata } from "next";
import ValidationDetailView from "@/views/app/admin/validation/[id]";

interface ValidationDetailPageProps {
  params: Promise<{ id: string }>;
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

  return <ValidationDetailView id={id} />;
}