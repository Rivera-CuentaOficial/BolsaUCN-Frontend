import { Suspense } from "react";
import { ManageView } from "@/views/app"; 
export const metadata = {
  title: "Administrar Publicaciones",
  description: "Panel de administracion de publicaciones.",
};

export default function ValidationPage() {
  return (
  <Suspense fallback={<div className="p-4">Cargando publicaciones...</div>}>
    <ManageView />
  </Suspense>
  );
}