"use client";

import { UserProfileForAdminDto } from "@/services/dtos/adminDto";

interface UserProfileSectionProps {
    user: UserProfileForAdminDto;
}

export function UserProfileSection({ user }: UserProfileSectionProps) {
    const fullName = `${user.firstName} ${user.lastName}`;
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

    return (
        <section className="w-full">
            {/* TÍTULO */}
            <h2 className="text-2xl font-bold text-black mb-6 text-center">
                Perfil de Usuario
            </h2>

            {/* PERFIL */}
            <div className="flex flex-col items-center text-center space-y-4">

                {/* AVATAR */}
                {user.profilePictureUrl ? (
                    <img
                        src={user.profilePictureUrl}
                        alt={fullName}
                        className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                    />
                ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-indigo-100">
                        {initials}
                    </div>
                )}

                {/* NOMBRE */}
                <p className="font-semibold text-lg text-slate-900 break-words px-2">
                    {fullName}
                </p>

                {/* USERNAME */}
                <p className="text-slate-600 text-sm">
                    @{user.userName}
                </p>
            </div>

            {/* INFO DETALLADA */}
            <div className="mt-6 pt-5 border-t border-slate-200 text-slate-700 text-sm space-y-4">

                {/* User ID */}
                <div className="flex flex-col">
                    <span className="font-semibold mb-1">ID de Usuario:</span>
                    <span className="text-slate-600">#{user.id}</span>
                </div>

                {/* User Type */}
                <div className="flex flex-col">
                    <span className="font-semibold mb-1">Tipo de Usuario:</span>
                    <span className="inline-flex self-start px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                        {user.userType}
                    </span>
                </div>

                {/* Account Status */}
                <div className="flex flex-col">
                    <span className="font-semibold mb-1">Estado de la Cuenta:</span>
                    <span className={`inline-flex self-start px-3 py-1 rounded-full text-xs font-bold ${
                        user.banned
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                    }`}>
                        {user.banned ? "Bloqueado" : "Activo"}
                    </span>
                </div>
            </div>
        </section>
    );
}