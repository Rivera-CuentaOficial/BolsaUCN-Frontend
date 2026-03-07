"use client";

import { useState, useEffect } from "react";
import { AdminUsersService } from "@/services/adminUserService";
import { UserProfileForAdminDto } from "@/services/dtos/adminDto";
import { toast } from "sonner";

export const useUserDetail = (userId: string) => {
    const [user, setUser] = useState<UserProfileForAdminDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchUserDetail = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const userIdNumber = parseInt(userId, 10);
            const response = await AdminUsersService.getUserDetail(userIdNumber);
            setUser(response);
        } catch (err) {
            setError(err as Error);
            console.error("Error fetching user detail:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleToggleBlock = async () => {
        if (!user) return;

        try {
            // Optimistic update
            setUser(prev => prev ? { ...prev, banned: !prev.banned } : null);

            // API call
            await AdminUsersService.toggleUserBan(user.id);
            
            // Success notification
            toast.success(
                `Usuario ${user.banned ? "desbloqueado" : "bloqueado"} correctamente`
            );
        } catch (err) {
            // Revert optimistic update
            setUser(prev => prev ? { ...prev, banned: user.banned } : null);
            
            // Error notification
            toast.error("No se pudo cambiar el estado del usuario");
            console.error("Error toggling block status:", err);
        }
    };

    return {
        user,
        isLoading,
        error,
        handleToggleBlock,
        refetch: fetchUserDetail,
    };
};