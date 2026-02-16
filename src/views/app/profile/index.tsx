"use client";

import { useState } from "react";
import { ArrowLeft, User, Settings, Briefcase, Building2, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, NotificationBanner } from "@/components/ui";
import { useUnifiedProfile } from "./hooks";

import {
    ProfileDetailSection,
    ProfileSidebarSection,
    ProfileSkeleton,
    ProfileSettingsMenu,
    CVUploadSection
} from "./components";

export function UnifiedProfileView() {
    const router = useRouter();
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

    const {
        userType,
        profile,
        isLoading,
        error,
        isSaving,
        formData,
        fieldErrors,
        handleChange,
        handleSave,
        handleCancel,
        handlePhotoUpload,
        handleCVUploadSuccess,
        notification,
        isVisible,
        close,
        show,
        refetch,
    } = useUnifiedProfile();

    // User type display configuration
    const getUserTypeConfig = () => {
        switch (userType) {
            case "Estudiante":
                return { label: "Estudiante", icon: User, color: "from-blue-500 to-cyan-500" };
            case "Empresa":
                return { label: "Empresa", icon: Building2, color: "from-purple-500 to-pink-500" };
            case "Particular":
                return { label: "Particular", icon: Briefcase, color: "from-green-500 to-emerald-500" };
            case "Administrador":
                return { label: "Administrador", icon: UserCog, color: "from-red-500 to-orange-500" };
            default:
                return { label: "Usuario", icon: User, color: "from-gray-500 to-slate-500" };
        }
    };

    const typeConfig = getUserTypeConfig();
    const TypeIcon = typeConfig.icon;

    if (isLoading || !profile || !userType) {
        return (
            <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img src="/fondo.png" alt="Fondo UCN" className="w-full h-full object-cover opacity-60"/>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-800/90 to-fuchsia-800/80 mix-blend-hard-light" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-950/90" />
                </div>
                <ProfileSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900 to-slate-900" />
                <div className="relative z-10 max-w-xl mx-auto p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] text-center text-white shadow-2xl">
                    <h2 className="text-2xl font-bold mb-2">Error al cargar</h2>
                    <p className="text-white/80 mb-6">{error}</p>
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

    const handleCloseSettingsMenu = () => {
        handleCancel();
        setIsSettingsMenuOpen(false);
    };

    return (
        <div className="flex flex-col min-h-screen relative text-white selection:bg-pink-500 selection:text-white overflow-hidden bg-slate-900">

            {/* Fondo Morado Continuo */}
            <div className="absolute inset-0 z-0">
                <img src="/fondo.png" alt="Fondo UCN" className="w-full h-full object-cover opacity-60"/>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-800/90 to-fuchsia-800/80 mix-blend-hard-light" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-950/90" />
            </div>

            <NotificationBanner
                data={{
                    title: notification?.title || "",
                    message: notification?.message || "",
                    type: notification?.type || "success"
                }}
                isVisible={isVisible}
                onClose={close}
            />

            <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {/* Header Flotante */}
                <header className="mb-8">
                    <Button
                        onClick={() => router.back()}
                        className="cursor-pointer mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm border border-white/10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <div className={`inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-gradient-to-r ${typeConfig.color} backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-lg`}>
                                <TypeIcon className="w-3 h-3" />
                                {typeConfig.label}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight">
                                Mi Perfil
                            </h1>
                            <p className="text-lg md:text-xl text-white/80 font-medium">
                                @{profile.userName}
                            </p>
                        </div>

                        {/* Single Update Profile Button */}
                        <button
                            onClick={() => setIsSettingsMenuOpen(true)}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white rounded-full font-bold transition shadow-lg flex items-center gap-2"
                        >
                            <Settings className="w-5 h-5" />
                            Actualizar Perfil
                        </button>
                    </div>
                </header>

                {/* Tarjeta Principal Blanca */}
                <div className="bg-white text-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">

                        {/* Columna Izquierda: Información Principal */}
                        <div className="w-full md:w-3/4 space-y-8">
                            <ProfileDetailSection
                                profile={profile}
                                formData={formData}
                                isEditing={false}
                                fieldErrors={fieldErrors}
                                handleChange={handleChange}
                                userType={userType}
                            />

                            {/* CV Upload Section (Student Only) */}
                            {userType === "Estudiante" && (
                                <CVUploadSection
                                    hasCV={profile.hasCV}
                                    onUploadSuccess={handleCVUploadSuccess}
                                    showNotification={show}
                                />
                            )}
                        </div>

                        {/* Columna Derecha: Perfil Sidebar */}
                        <div className="w-full md:w-1/4 space-y-6">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <ProfileSidebarSection
                                    profile={profile}
                                    onPhotoUpload={handlePhotoUpload}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Principal */}
                <ProfileSettingsMenu
                    isOpen={isSettingsMenuOpen}
                    onClose={handleCloseSettingsMenu}
                    profile={profile}
                    formData={formData}
                    fieldErrors={fieldErrors}
                    handleChange={handleChange}
                    handleSave={handleSave}
                    isSaving={isSaving}
                    userType={userType}
                    onRefetch={refetch}
                />
            </main>
        </div>
    );
}