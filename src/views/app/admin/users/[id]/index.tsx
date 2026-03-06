"use client";

import { AlertCircle, ArrowLeft, LayoutGrid, User as UserIcon, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui";
import { useUserDetail } from "./hooks";
import { useDownloadUserReviewsPdf } from "@/hooks/common/use-reviews";
import { useState } from "react";
import {
    UserDetailLoading,
    UserDetailSection,
    UserProfileSection
} from "./components";

export interface UserDetailViewProps {
    id: string;
}

export function UserDetailView({ id }: UserDetailViewProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const downloadUserPdf = useDownloadUserReviewsPdf();
    const {
        user,
        isLoading,
        error,
        handleToggleBlock,
        refetch,
    } = useUserDetail(id);

    const handleConfirmToggle = () => {
        handleToggleBlock();
    }

    // 1. ESTADO DE CARGA: Skeleton con Fondo Morado
    if (isLoading || !user) {
        return (
            <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-ucn-purple">
                {/* Skeleton */}
                <UserDetailLoading />
            </div>
        );
    }

    // 2. ESTADO DE ERROR
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900 to-slate-900" />

                <div className="relative z-10 max-w-xl mx-auto p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-center text-white shadow-2xl">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <h2 className="text-2xl font-bold mb-2">Error al cargar</h2>
                    <p className="text-white/80 mb-6">{error.message || "No se pudo cargar el usuario"}</p>
                    <button
                        onClick={refetch}
                        className="px-6 py-3 bg-white text-purple-900 rounded-full font-bold hover:bg-purple-100 transition shadow-lg"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // 3. VISTA PRINCIPAL
    return (
        <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-ucn-purple">

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

                {/* Header Flotante */}
                <header className="mb-8">
                    <button
                        onClick={() => router.push("/admin/users")}
                        className="cursor-pointer mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a Usuarios
                    </button>

                    <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                            <UserIcon className="w-3 h-3" />
                            {user.userType}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 font-medium">
                            @{user.userName}
                        </p>
                    </div>
                </header>

                {/* Tarjeta Principal Blanca */}
                <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">

                        {/* Columna Izquierda: Información Principal */}
                        <div className="w-full md:w-3/4 space-y-8 order-2 lg:order-none">
                            <UserDetailSection user={user} />
                            <div className="pb-4 border-t border-slate-100 space-y-3">
                                <button
                                    onClick={() => router.push(`/admin/users/${user.id}/publications`)}
                                    className="w-full px-6 py-4 rounded-xl font-bold transition shadow-lg 
                                            bg-purple-50 text-purple-600 border border-purple-100 
                                            hover:bg-purple-100 flex justify-center items-center gap-2"
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                    Ver Publicaciones del Usuario
                                </button>
                                <button
                                    onClick={() => downloadUserPdf.mutate(user.id)}
                                    disabled={downloadUserPdf.isPending}
                                    className="w-full px-6 py-4 rounded-xl font-bold transition shadow-lg 
                                            bg-blue-50 text-blue-600 border border-blue-100 
                                            hover:bg-blue-100 flex justify-center items-center gap-2
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download className="w-5 h-5" />
                                    {downloadUserPdf.isPending ? "Descargando..." : "Descargar Reporte de Evaluaciones"}
                                </button>
                            </div>

                            {/* Botón de Acción */}
                            <div className="pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsDialogOpen(true)}
                                    className={`cursor-pointer w-full px-6 py-4 rounded-xl font-bold transition shadow-lg flex justify-center items-center gap-2 ${user.banned
                                            ? "bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"
                                            : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                                        }`}
                                >
                                    {user.banned ? "Desbloquear Usuario" : "Bloquear Usuario"}
                                </button>
                            </div>
                        </div>

                        {/* Columna Derecha: Perfil */}
                        <div className="w-full md:w-1/4 space-y-6 order-1 lg:order-none">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <UserProfileSection user={user} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Dialogo de Confirmación */}
                <ConfirmDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    title={user.banned ? "¿Desbloquear usuario?" : "¿Bloquear usuario?"}
                    description={
                        user.banned
                            ? `¿Estás seguro de que deseas desbloquear a ${user.firstName} ${user.lastName}? El usuario podrá volver a acceder a la plataforma.`
                            : `¿Estás seguro de que deseas bloquear a ${user.firstName} ${user.lastName}? El usuario no podrá iniciar sesión en la plataforma.`
                    }
                    confirmText={user.banned ? "Desbloquear" : "Bloquear"}
                    cancelText="Cancelar"
                    onConfirm={handleConfirmToggle}
                    onCancel={() => setIsDialogOpen(false)}
                />
            </main>
        </div>
    );
}