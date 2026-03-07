import { get } from "http";
import api from "./Service";

// Nuevos DTOs
export interface GetUserProfileDTO {
    userName: string;
    firstName: string; // Empresas usan firstName para el nombre de la empresa
    lastName: string; // Empresas usan lastName para la razon legal
    rut: string;
    email: string;
    phoneNumber: string;
    rating: number;
    aboutMe: string;
    userType: string;
    profilePhoto?: string;
    pendingEmail?: string;
    // Estudiantes (Role: Applicant)
    hasCV: boolean;
    disability?: string;
}

export interface UpdateUserProfileDTO {
    userName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    aboutMe?: string;
}

export interface GetPhotoDTO {
    photoUrl: string;
}

export interface UpdatePhotoDTO {
    photo: File;
}
export interface PhotoResponse {
    message: string;
    data: GetPhotoDTO;
}

export interface ProfileResponse {
    message: string;
    data: GetUserProfileDTO;
}

export interface UpdateResponse {
    message: string;
    data: string;
};

export interface ChangePasswordDTO {
    CurrentPassword: string;
    NewPassword: string;
    ConfirmNewPassword: string;
}

export interface ChangeUserEmailDTO {
    newEmail: string;
    currentPassword: string;
}

export interface VerifyNewEmailDTO {
    verificationCode: string;
}

export const profileService = {
    //Students
    //GET api/user/profile/student
    async getStudentProfile(): Promise<ProfileResponse> {
        const response = await api.get<ProfileResponse>("/user/profile/student");
        return response.data;
    },
    //PATCH api/user/profile/student
    async updateStudentProfile(data: UpdateUserProfileDTO) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });
        const response = await api.patch<{ message: string; data: string }>(
            "/user/profile/student",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            }
        );
        return response.data;
    },
    //Individuals
    //GET api/user/profile/individual
    async getIndividualProfile(): Promise<ProfileResponse> {
        const response = await api.get<ProfileResponse>("/user/profile/individual");
        return response.data;
    },
    //PATCH api/user/profile/individual
    async updateIndividualProfile(data: UpdateUserProfileDTO) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });
        const response = await api.patch<{ message: string; data: string }>(
            "/user/profile/individual",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            }
        );
        return response.data;
    },
    //Companies
    //GET api/user/profile/company
    async getCompanyProfile(): Promise<ProfileResponse> {
        const response = await api.get<ProfileResponse>("/user/profile/company");
        return response.data;
    },
    //PATCH api/user/profile/company
    async updateCompanyProfile(data: UpdateUserProfileDTO) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });
        const response = await api.patch<{ message: string; data: string }>(
            "/user/profile/company",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            }
        );
        return response.data;
    },
    //Admins
    //GET api/user/profile/admin
    async getAdminProfile(): Promise<ProfileResponse> {
        const response = await api.get<ProfileResponse>("/user/profile/admin");
        return response.data;
    },
    //PATCH api/user/profile/admin
    async updateAdminProfile(data: UpdateUserProfileDTO) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });
        const response = await api.patch<{ message: string; data: string }>(
            "/user/profile/admin",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            }
        );
        return response.data;
    },

    //NEW Unified Profile Endpoints

    //GET api/user/profile
    async getUserProfile(): Promise<ProfileResponse> {
        const response = await api.get<ProfileResponse>("/user/profile");
        return response.data;
    },

    //PATCH api/user/profile
    async updateUserProfile(data: UpdateUserProfileDTO) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });
        const response = await api.patch<{ message: string; data: string }>(
            "/user/profile",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            }
        );
        return response.data;
    },

    //GET api/user/profile/photo
    async getProfilePhoto(): Promise<PhotoResponse> {
        const response = await api.get<PhotoResponse>("/user/profile/photo");
        return response.data;
    },

    //PATCH api/user/profile/photo
    async updateProfilePhoto(data: UpdatePhotoDTO) {
        const formData = new FormData();
        formData.append("Photo", data.photo);

        const response = await api.patch<{ message: string; data: string }>(
            "/user/profile/photo",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            }
        );
        return response.data;
    },

    //PATCH /api/user/profile/change-password
    async changePassword(data: ChangePasswordDTO): Promise<UpdateResponse> {
        const response = await api.patch<UpdateResponse>(
            "/user/profile/change-password",
            data,
            {
            headers: {
                'Content-Type': 'application/json'
                },
            }
        );
        return response.data;
    },

    //PATCH /api/user/profile/change-email
    async changeEmail(data: ChangeUserEmailDTO): Promise<UpdateResponse> {
        const response = await api.patch<UpdateResponse>(
            "/user/profile/change-email",
            data,
            {
            headers: {
                'Content-Type': 'application/json'
                },
            }
        );
        return response.data;
    },

    //POST /api/user/profile/change-email/verify
    async verifyChangeEmail(data: VerifyNewEmailDTO): Promise<UpdateResponse> {
        const response = await api.post<UpdateResponse>(
            "/user/profile/change-email/verify",
            data,
            {
            headers: {
                'Content-Type': 'application/json'
                },
            }
        );
        return response.data;
    },

    //POST /api/user/profile/change-email/resend-verification"
    async resendEmailVerification(): Promise<UpdateResponse> {
        const response = await api.post<UpdateResponse>(
            "/user/profile/change-email/resend-verification"
        );
        return response.data;
    },

    
    async toggleAllowNotifications(): Promise<UpdateResponse> {
        const response = await api.patch<UpdateResponse>(
            "/user/profile/toggle-notifications"
        );
        return response.data;
    }
};

