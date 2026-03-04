"use client";

import { useRef } from "react";
import { GetUserProfileDTO } from "@/services/profileService";
import { getRolesFromToken } from "@/lib";
import { Briefcase, Camera, Shield, Star, UserCheck, X } from "lucide-react";

interface ProfileSidebarSectionProps {
    profile: GetUserProfileDTO;
    onPhotoUpload: (file: File) => void;
}

export function ProfileSidebarSection({ profile, onPhotoUpload }: ProfileSidebarSectionProps) {
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onPhotoUpload(file);
        }
    };

    const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
    const initials = `${profile.firstName?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`;
    const roles = getRolesFromToken();

    return (
        <section className="w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                Mi Perfil
            </h2>

            {/* Avatar */}
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative group" key={profile.profilePhoto || initials}>
                    {profile.profilePhoto ? (
                        <img
                            src={profile.profilePhoto}
                            alt={fullName}
                            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                    ) : null}

                    <div className={`w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-indigo-100 ${profile.profilePhoto ? 'hidden' : ''}`}>
                        {initials}
                    </div>

                    {/* Photo upload button */}
                    <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-indigo-100 hover:bg-indigo-50 transition-colors"
                    >
                        <Camera className="w-4 h-4 text-indigo-600" />
                    </button>

                    <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                    />
                </div>

                <p className="font-semibold text-lg text-slate-900">
                    {fullName || "Administrador"}
                </p>
                <p className="text-slate-600 text-sm">
                    @{profile.userName}
                </p>
            </div>

            {/* User Info */}
            <div className="mt-6 pt-5 border-t border-slate-200 text-slate-700 text-sm space-y-4">
                <div className="flex flex-col">
                    <span className="font-semibold mb-1">Nivel de Acceso</span>
                    <div className="space-y-2">
                        {roles.includes("SuperAdmin") && (
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 w-full">
                                <Shield className="w-4 h-4 text-purple-600" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-purple-900">Super Administrador</span>
                                    <span className="text-xs text-purple-600">Gestión completa del sistema</span>
                                </div>
                            </div>
                        )}

                        {roles.includes("Admin") && (
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 w-full">
                                <Shield className="w-4 h-4 text-indigo-600" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-indigo-900">Administrador</span>
                                    <span className="text-xs text-indigo-600">Gestión de publicaciones y usuarios</span>
                                </div>
                            </div>
                        )}

                        {roles.includes("Offeror") && (
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 w-full">
                                <Briefcase className="w-4 h-4 text-green-600" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-green-900">Publicador</span>
                                    <span className="text-xs text-green-600">Puede publicar ofertas</span>
                                </div>
                            </div>
                        )}

                        {roles.includes("Applicant") && (
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 w-full">
                                <UserCheck className="w-4 h-4 text-blue-600" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-blue-900">Postulante</span>
                                    <span className="text-xs text-blue-600">Envía postulaciones</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}