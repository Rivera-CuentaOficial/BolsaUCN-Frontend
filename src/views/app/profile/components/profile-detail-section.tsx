"use client";

import { GetUserProfileDTO } from "@/services/profileService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProfileDetailSectionProps {
    profile: GetUserProfileDTO;
    formData: {
        userName: string;
        firstName: string;
        lastName: string;
        rut: string;
        email: string;
        phoneNumber: string;
        aboutMe: string;
    };
    isEditing: boolean;
    fieldErrors: Record<string, string>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    userType: string;
}

function ProfileField({
    label,
    name,
    value,
    displayValue,
    textarea = false,
    colSpan = 1,
    isEditing,
    fieldErrors,
    handleChange
}: {
    label: string;
    name: string;
    value: string;
    displayValue?: string;
    textarea?: boolean;
    colSpan?: number;
    isEditing: boolean;
    fieldErrors: Record<string, string>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
    return (
        <div className={colSpan > 1 ? `md:col-span-${colSpan}` : ""}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
            </label>
            {isEditing ? (
                <>
                    {textarea ? (
                        <Textarea
                            name={name}
                            value={value}
                            onChange={handleChange}
                            rows={6}
                            maxLength={500}
                            className={`resize-y min-h-32 px-4 py-3 border rounded-xl bg-white text-slate-700 ${
                                fieldErrors[name] 
                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            }`}
                            placeholder={`Escribe ${label.toLowerCase()}...`}
                        />
                    ) : (
                        <Input
                            name={name}
                            value={value}
                            onChange={handleChange}
                            className={`px-4 py-3 border rounded-xl bg-white text-slate-700 ${
                                fieldErrors[name] 
                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                            }`}
                        />
                    )}
                    {fieldErrors[name] && (
                        <p className="text-red-600 text-xs mt-1">{fieldErrors[name]}</p>
                    )}
                </>
            ) : textarea ? (
                <div className="px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 min-h-[100px] whitespace-pre-wrap text-slate-700">
                    {displayValue || "Sin descripción"}
                </div>
            ) : (
                <div className="px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700">
                    {displayValue || "-"}
                </div>
            )}
        </div>
    );
}

export function ProfileDetailSection({
    profile,
    formData,
    isEditing,
    fieldErrors,
    handleChange,
    userType
}: ProfileDetailSectionProps) {
    return (
        <section className="w-full space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Información Personal
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField
                        label="Nombre de usuario"
                        name="userName"
                        value={formData.userName}
                        displayValue={profile.userName}
                        isEditing={isEditing}
                        fieldErrors={fieldErrors}
                        handleChange={handleChange}
                    />
                    <ProfileField
                        label="RUT"
                        name="rut"
                        value={formData.rut}
                        displayValue={profile.rut}
                        isEditing={isEditing}
                        fieldErrors={fieldErrors}
                        handleChange={handleChange}
                    />
                    <ProfileField
                        label={userType === "Empresa" ? "Nombre de la empresa" : "Nombre"}
                        name="firstName"
                        value={formData.firstName}
                        displayValue={profile.firstName}
                        isEditing={isEditing}
                        fieldErrors={fieldErrors}
                        handleChange={handleChange}
                    />
                    <ProfileField
                        label={userType === "Empresa" ? "Razón legal" : "Apellido"}
                        name="lastName"
                        value={formData.lastName}
                        displayValue={profile.lastName}
                        isEditing={isEditing}
                        fieldErrors={fieldErrors}
                        handleChange={handleChange}
                    />

                    <ProfileField
                        label="Correo electrónico"
                        name="email"
                        value={formData.email}
                        displayValue={profile.email}
                        colSpan={2}
                        isEditing={isEditing}
                        fieldErrors={fieldErrors}
                        handleChange={handleChange}
                    />
                    <ProfileField
                        label="Teléfono"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        displayValue={profile.phoneNumber}
                        colSpan={2}
                        isEditing={isEditing}
                        fieldErrors={fieldErrors}
                        handleChange={handleChange}
                    />
                    <ProfileField
                        label="Sobre mí"
                        name="aboutMe"
                        value={formData.aboutMe}
                        displayValue={profile.aboutMe}
                        textarea
                        colSpan={2}
                        isEditing={isEditing}
                        fieldErrors={fieldErrors}
                        handleChange={handleChange}
                    />
                </div>
            </div>
        </section>
    );
}