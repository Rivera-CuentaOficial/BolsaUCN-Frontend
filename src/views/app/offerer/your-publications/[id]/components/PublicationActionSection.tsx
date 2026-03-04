// src/views/app/offerer/your-publications/[id]/components/PublicationActionSection.tsx
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Edit, Users, Trash2 } from 'lucide-react';
import { ConfirmDialog } from "@/components/ui/confirm-dialog"; 
import { toast } from 'sonner'; 
import type { OfferDetail, MyBuySell } from "@/models/responses";


interface PublicationActionSectionProps {
    detail: OfferDetail | MyBuySell;
    statusInfo: { text: string; classes: string; };
    // Propiedades para manejar el cierre
    handleClosePublication: () => Promise<void>;
    isMutating: boolean;
}

const PublicationActionSection: React.FC<PublicationActionSectionProps> = ({ 
    detail, 
    statusInfo,
    handleClosePublication,
    isMutating,
}) => {
    
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
    
    // Determinar si es Oferta o Compra/Venta para extraer datos del oferente
    const isJobOffer = 'remuneration' in detail || 'companyName' in detail;
    const isPending = detail.statusValidation === 1;
    const isRejected = detail.statusValidation === 2;
    const isPublished = detail.statusValidation === 0;
    
    

    const handleConfirmClose = async () => {
        setIsCloseDialogOpen(false);
        const toastId = toast.loading("Cerrando publicación...");
        try {
            await handleClosePublication();
            toast.dismiss(toastId);
            
            // AÑADIR ESTA LÍNEA para el popup de éxito
            toast.success("Publicación cerrada con éxito", {
                description: "Serás redirigido a tus publicaciones.",
            });
            
            // La redirección ocurre dentro de handleClosePublication en el hook, 
            // lo que garantiza que se haga después de este toast.
        } catch (e) {
            toast.error("Error al cerrar publicación", {
                id: toastId,
                description: "No se pudo completar la acción.",
            });
        }
    };

    return (
        <aside className="space-y-6 sticky top-10">
            
            {/* SECCIÓN DE ACCIONES (El perfil de contacto fue eliminado) */}
            <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-4 border-b pb-2">
                    Acciones
                </h2>

                {/* Botón Ver Postulantes (Disponible si es Oferta/Voluntariado y está Activa) */}
                {isPublished && isJobOffer && (
                    <Link href={`/offerer/your-publications/${detail.id}/applicants`} passHref>
                        <button className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transform active:scale-95 transition-all flex justify-center items-center gap-2">
                            <Users className="w-5 h-5" />
                            Ver Postulantes
                        </button>
                    </Link>
                )}

                {/* Botón Editar (Disponible si está Pendiente o Rechazada) */}
                {(isPending || isRejected) && (
                    <Link href={`/offerer/edit-publication/${detail.id}`} passHref>
                        <button className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all flex justify-center items-center gap-2">
                            <Edit className="w-5 h-5" />
                            Editar Publicación
                        </button>
                    </Link>
                )}
                
                {/* Botón de Cerrar Publicación (Funcionalidad Requerida) */}
                <button 
                    onClick={() => setIsCloseDialogOpen(true)}
                    disabled={isMutating}
                    className="w-full px-6 py-3 border border-red-500 text-red-600 hover:bg-red-50/50 hover:text-red-700 rounded-xl font-bold transform active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                    <Trash2 className="w-5 h-5" />
                    {isMutating ? "Cerrando..." : "Cerrar Publicación"}
                </button>
            </section>

            {/* DIÁLOGO DE CONFIRMACIÓN */}
            <ConfirmDialog
                open={isCloseDialogOpen}
                onOpenChange={setIsCloseDialogOpen}
                title="¿Cerrar esta publicación?"
                description="Esta acción hará que la publicación deje de estar disponible para los usuarios y no podrá recibir más postulaciones."
                confirmText="Cerrar"
                cancelText="Cancelar"
                onConfirm={handleConfirmClose}
                onCancel={() => setIsCloseDialogOpen(false)}
            />
        </aside>
    );
}

export { PublicationActionSection };