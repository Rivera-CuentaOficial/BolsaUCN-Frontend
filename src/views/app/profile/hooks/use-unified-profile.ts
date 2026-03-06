"use client";

import { useState, useEffect } from "react";
import { GetUserProfileDTO, profileService } from "@/services/profileService";
import { validators } from "@/utils/AuthValidatorsUtil";
import { formatRut } from "@/utils/Util";
import { getUserTypeFromToken } from "@/lib/auth";
import { toast } from "sonner";

type UserType = "Estudiante" | "Empresa" | "Particular" | "Administrador";

export const useUnifiedProfile = () => {
    const [userType, setUserType] = useState<UserType | null>(null);
    const [profile, setProfile] = useState<GetUserProfileDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        userName: "",
        firstName: "",
        lastName: "",
        rut: "",
        email: "",
        phoneNumber: "",
        aboutMe: "",
    });

    const [originalData, setOriginalData] = useState(formData);

    // Extraer el tipo de usuario del token JWT
    useEffect(() => {
        const userType = getUserTypeFromToken();
        if (userType) {
            setUserType(userType as UserType);
        }
    }, []);

    const fetchProfile = async () => {
        if (!userType) return;

        try {
            setIsLoading(true);
            setError(null);

            var response = await profileService.getUserProfile();

            if (response.data) {
                setProfile(response.data);
                const data = {
                    userName: response.data.userName || "",
                    firstName: response.data.firstName || "",
                    lastName: response.data.lastName || "",
                    rut: response.data.rut || "",
                    email: response.data.email || "",
                    phoneNumber: response.data.phoneNumber || "",
                    aboutMe: response.data.aboutMe || "",
                };

                setFormData(data);
                setOriginalData(data);
            }
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError(err.response?.data?.message || "Error al cargar el perfil");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userType) {
            fetchProfile();
        }
    }, [userType]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name === "rut") {
            const formatted = formatRut(value);
            setFormData((prev) => ({ ...prev, [name]: formatted }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // First Name (or Company Name)
        if (!formData.firstName.trim()) {
            errors.firstName = userType === "Empresa"
                ? "El nombre de la empresa es requerido"
                : "El nombre es requerido";
        }

        // Last Name (or Legal Name for companies)
        if (!formData.lastName.trim()) {
            errors.lastName = userType === "Empresa"
                ? "La razón legal es requerida"
                : "El apellido es requerido";
        }

        // Email
        if (userType === "Estudiante") {
            const emailLocal = formData.email.replace("@alumnos.ucn.cl", "");
            const emailError = validators.studentEmail(emailLocal);
            if (emailError) errors.email = emailError;
        }
        else {
            const emailError = validators.regularEmail(formData.email);
            if (emailError) errors.email = emailError;
        }

        // Phone
        const phoneError = validators.phone(formData.phoneNumber);
        if (phoneError) errors.phoneNumber = phoneError;

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async (): Promise<boolean> => {
        if (!validateForm() || !userType) return false;

        setIsSaving(true);

        try {
            const updateData: any = {};
            if (formData.userName !== originalData.userName) {
                updateData.userName = formData.userName;
            }
            if (formData.firstName !== originalData.firstName) {
                updateData.firstName = formData.firstName;
            }
            if (formData.lastName !== originalData.lastName) {
                updateData.lastName = formData.lastName;
            }
            if (formData.email !== originalData.email) {
                updateData.email = formData.email;
            }
            if (formData.phoneNumber !== originalData.phoneNumber) {
                updateData.phoneNumber = formData.phoneNumber;
            }
            if (formData.aboutMe !== originalData.aboutMe) {
                updateData.aboutMe = formData.aboutMe;
            }

            if (Object.keys(updateData).length === 0) {
                toast.info("Sin cambios", { description: "No se han realizado cambios para guardar." });
                return true;
            }

            const response = await profileService.updateUserProfile(updateData);

            if (response) {
                toast.success("Perfil actualizado", { description: "Los cambios se han guardado correctamente." });
                setOriginalData(formData);
                await fetchProfile();
                return true;
            }
            return false;
        } catch (err: any) {
            console.error("Error updating profile:", err);
            const errorMessage = err.response?.data?.message || "Error al actualizar el perfil";
            toast.error("Error", { description: errorMessage });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setFieldErrors({});
    };

    const handlePhotoUpload = async (file: File) => {
        try {
            await profileService.updateProfilePhoto({ photo: file });
            toast.success("Foto actualizada", { description: "Tu foto de perfil se ha actualizado correctamente." });
            await fetchProfile();
        } catch (err: any) {
            console.error("Error uploading photo:", err);
            toast.error("Error", { description: "No se pudo actualizar la foto de perfil." });
        }
    };

    const handleCVUploadSuccess = async () => {
        toast.success("CV actualizado", { description: "Tu curriculum se ha actualizado correctamente." });
        await fetchProfile();
    };

    const refetch = () => {
        fetchProfile();
    };

    return {
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
        refetch,
    };
};