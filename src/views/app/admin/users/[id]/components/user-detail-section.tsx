"use client";

import { UserProfileForAdminDto } from "@/services/dtos/adminDto";
import { Calendar, Mail, Phone, FileText, Accessibility, Shield, User, GraduationCap } from "lucide-react";
import { formatDate} from "@/utils/Util";

interface UserDetailSectionProps {
    user: UserProfileForAdminDto;
}

export function UserDetailSection({ user }: UserDetailSectionProps) {
    return (
        <section className="w-full space-y-6">
            {/* Status Badges */}
            {user.banned && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-red-600" />
                    <div>
                        <h3 className="font-bold text-red-900">Usuario Bloqueado</h3>
                        <p className="text-sm text-red-700">Este usuario no puede acceder a la plataforma</p>
                    </div>
                </div>
            )}

            {user.superAdmin && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <div>
                        <h3 className="font-bold text-yellow-900">Super Administrador</h3>
                        <p className="text-sm text-yellow-700">Este usuario tiene privilegios de super administrador</p>
                    </div>
                </div>
            )}

            {/* About Me */}
            {user.aboutMe && (
                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-100">
                            <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
                                Sobre mí
                            </h3>
                            <p className="text-xs text-gray-600">
                                Información personal del usuario
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                            {user.aboutMe}
                        </p>
                    </div>
                </section>
            )}

            {/* Información de Contacto */}
            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-100">
                        <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
                            Información de Contacto
                        </h3>
                        <p className="text-xs text-gray-600">
                            Datos de contacto y perfil
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Correo Electrónico
                        </dt>
                        <dd className="text-sm font-medium text-slate-900 break-all">
                            {user.email}
                        </dd>
                    </div>

                    {/* Phone */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            Teléfono
                        </dt>
                        <dd className="text-sm font-medium text-slate-900">
                            {user.phoneNumber}
                        </dd>
                    </div>

                    {/* RUT */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            RUT
                        </dt>
                        <dd className="text-sm font-medium text-slate-900">
                            {user.rut}
                        </dd>
                    </div>

                    {/* Rating */}
                    {user.rating !== null && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                Calificación
                            </dt>
                            <dd className="text-sm font-medium text-green-700">
                                ⭐ {user.rating.toFixed(1)} / 6.0
                            </dd>
                        </div>
                    )}
                </div>
            </section>

            {/* Student Specific Info */}
            {user.userType === "Estudiante" && (user.cvUrl || user.disability) && (
                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-100">
                            <GraduationCap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
                                Información Académica
                            </h3>
                            <p className="text-xs text-gray-600">
                                Documentos y datos del estudiante
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* CV URL */}
                        {user.cvUrl && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Currículum Vitae
                                </dt>
                                <dd>
                                    <a
                                        href={user.cvUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-100 transition"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Ver CV
                                    </a>
                                </dd>
                            </div>
                        )}

                        {/* Disability */}
                        {user.disability && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                                    <Accessibility className="w-3 h-3" />
                                    Discapacidad
                                </dt>
                                <dd className="text-sm font-medium text-slate-900">
                                    {user.disability}
                                </dd>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Account Information */}
            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-100">
                        <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
                            Información de la Cuenta
                        </h3>
                        <p className="text-xs text-gray-600">
                            Fechas de registro y actividad
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Created At */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            Fecha de Registro
                        </dt>
                        <dd className="text-sm font-medium text-slate-900">
                            {formatDate(user.createdAt)}
                        </dd>
                    </div>

                    {/* Updated At */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            Última Actualización
                        </dt>
                        <dd className="text-sm font-medium text-slate-900">
                            {formatDate(user.updatedAt)}
                        </dd>
                    </div>

                    {/* Last Login */}
                    {user.lastLoginAt && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 sm:col-span-2">
                            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                Último Inicio de Sesión
                            </dt>
                            <dd className="text-sm font-medium text-slate-900">
                                {formatDate(user.lastLoginAt)}
                            </dd>
                        </div>
                    )}
                </div>
            </section>
        </section>
    );
}