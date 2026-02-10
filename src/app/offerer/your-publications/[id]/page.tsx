import { YourPublicationDetailView } from "@/views/app";


interface PageProps {
  params: Promise<{ id: string }>; // <--- CAMBIO: Ahora es una Promise
}

// Este es el componente de servidor que se renderiza para la ruta.
// Su única responsabilidad es obtener el ID y pasarlo al componente cliente.
export default async function YourPublicationDetailPage({ params }: PageProps) {
   const { id } = await params; // <--- CAMBIO: Hay que hacer await

  const numericId = Number(id);
  // Renderizamos el componente cliente que contiene toda la lógica y la UI.
  return <YourPublicationDetailView/>;
}