"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminUsersService } from "@/services/adminUserService";
import { UserForAdminDto } from "@/services/dtos/adminDto";
import { toast } from "sonner";

type UserType = "Todos" | "Estudiante" | "Empresa" | "Particular" | "Administrador";
type BlockedStatus = "Todos" | "Blocked" | "Unblocked";
type SortBy = "UserName" | "Email" | "Rating";
type ViewMode = "grid" | "list";

export const useAdminUsers = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State management
    const [users, setUsers] = useState<UserForAdminDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") || "");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [userType, setUserType] = useState<UserType>(
        (searchParams.get("userType") as UserType) || "Todos"
    );
    const [blockedStatus, setBlockedStatus] = useState<BlockedStatus>(
        (searchParams.get("blockedStatus") as BlockedStatus) || "Todos"
    );
    const [sortBy, setSortBy] = useState<SortBy>(
        (searchParams.get("sortBy") as SortBy) || "UserName"
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
        (searchParams.get("sortOrder") as "asc" | "desc") || "asc"
    );
    const [viewMode, setViewMode] = useState<ViewMode>(
        (searchParams.get("viewMode") as ViewMode) || "grid"
    );
    const [currentPage, setCurrentPage] = useState(
        Number(searchParams.get("pageNumber")) || 1
    );
    
    // Pagination state
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Update URL query parameters when filters change
    useEffect(() => {
        const params = new URLSearchParams();

        if (debouncedSearchTerm) params.set("searchTerm", debouncedSearchTerm);
        if (userType !== "Todos") params.set("userType", userType);
        if (blockedStatus !== "Todos") params.set("blockedStatus", blockedStatus);
        if (sortBy) params.set("sortBy", sortBy);
        if (sortOrder) params.set("sortOrder", sortOrder);
        if (viewMode) params.set("viewMode", viewMode);
        if (currentPage) params.set("pageNumber", currentPage.toString());

        const newUrl = params.toString() ? `?${params.toString()}` : "";
        router.replace(`/admin/users${newUrl}`);
    }, [debouncedSearchTerm, userType, blockedStatus, sortBy, sortOrder, viewMode, currentPage, router]);

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const params = {
                searchTerm: debouncedSearchTerm || undefined,
                userType: userType !== "Todos" ? userType : undefined,
                blockedStatus: blockedStatus !== "Todos" ? blockedStatus : undefined,
                sortBy,
                sortOrder,
                pageNumber: currentPage,
                pageSize: 12
            };

            const response = await AdminUsersService.getAllUsers(params);
            setUsers(response.users);
            setTotalCount(response.totalCount);
            setTotalPages(response.totalPages);
            setCurrentPage(response.currentPage);
        } catch (err) {
            setError(err as Error);
            console.error("Error fetching users:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch users when filters change
    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, userType, blockedStatus, sortBy, sortOrder, currentPage]);

    // Handle user block/unblock with optimistic updates
    const handleToggleBlock = async (user: UserForAdminDto) => {
        try {
            // Optimistic update
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u.email === user.email ? { ...u, banned: !u.banned } : u
                )
            );

            // API call
            await AdminUsersService.toggleUserBan(user.id);
            
            // Success notification
            toast.success(
                `Usuario ${user.banned ? "desbloqueado" : "bloqueado"} correctamente`
            );
        } catch (err) {
            // Revert optimistic update on error
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u.email === user.email ? { ...u, banned: user.banned } : u
                )
            );
            
            // Error notification
            toast.error("No se pudo cambiar el estado del usuario");
            console.error("Error toggling block status:", err);
        }
    };

    return {
        // Data
        users,
        isLoading,
        error,
        totalCount,
        totalPages,
        
        // Filters
        searchTerm,
        setSearchTerm,
        userType,
        setUserType,
        blockedStatus,
        setBlockedStatus,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        viewMode,
        setViewMode,
        currentPage,
        setCurrentPage,
        
        // Actions
        handleToggleBlock,
        refetch: fetchUsers,
        
    };
};