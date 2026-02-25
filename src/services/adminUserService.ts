import api from "./Service";
import { UserProfileForAdminDto, UsersForAdminDto} from "./dtos/adminDto";
import type { UserPublicationsForAdmin, UserPublicationsSearchParams } from "@/models/responses";

export interface SearchUsersParams {
    searchTerm?: string;
    userType?: string;
    blockedStatus?: string;
    sortBy?: string;
    sortOrder?: string;
    pageNumber?: number;
    pageSize?: number;
}

export class AdminUsersService {
    static async getAllUsers(params: SearchUsersParams): Promise<UsersForAdminDto> {
        const queryParams: Record<string, string> = {};

        if (params.searchTerm) queryParams.SearchTerm = params.searchTerm;
        if (params.userType) queryParams.UserType = params.userType;
        if (params.blockedStatus) queryParams.BlockedStatus = params.blockedStatus;
        if (params.sortBy) queryParams.SortBy = params.sortBy;
        if (params.sortOrder) queryParams.SortOrder = params.sortOrder;
        queryParams.PageNumber = Math.max(params.pageNumber || 1, 1).toString();
        if (params.pageSize) queryParams.PageSize = params.pageSize.toString();

        const response = await api.get<{ message: string; data: UsersForAdminDto }>("/admin/users", {
            params: queryParams
        });

        return response.data.data;
    }
    static async toggleUserBan(userId: number): Promise<boolean> {
        const response = await api.patch(`/admin/users/${userId}/toggle-block`);
        return response.data.data;
    }

    static async getUserDetail(userId: number): Promise<UserProfileForAdminDto> {
        const response = await api.get<{ message: string; data: UserProfileForAdminDto }>(
        `/admin/users/${userId}`
    );
    return response.data.data;
    }

    static async getUserPublications(userId: number, params: UserPublicationsSearchParams): Promise<UserPublicationsForAdmin> {
        const queryParams: Record<string, string> = {};

        if (params.searchByTitle) queryParams.SearchByTitle = params.searchByTitle;
        if (params.filterByPublicationStatus) queryParams.FilterByPublicationStatus = params.filterByPublicationStatus;
        if (params.filterByOfferType) queryParams.FilterByOfferType = params.filterByOfferType;
        if (params.filterByPublicationType) queryParams.FilterByPublicationType = params.filterByPublicationType;
        if (params.sortBy) queryParams.SortBy = params.sortBy;
        if (params.sortOrder) queryParams.SortOrder = params.sortOrder;
        queryParams.PageNumber = Math.max(params.pageNumber || 1, 1).toString();
        if (params.pageSize) queryParams.PageSize = params.pageSize.toString();

        const response = await api.get<{ message: string; data: UserPublicationsForAdmin }>(
            `/admin/users/${userId}/publications`,
            { params: queryParams }
        );

        return response.data.data;
    }
}