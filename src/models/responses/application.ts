export interface ApplicationForApplicantDTO{
    id: number;
    offerTitle: string;
    status: 'Pendiente' | 'Aceptada' | 'Rechazada' | string;
    createdAt: string;
}
export interface ApplicationsForApplicantDTO{
    applications: ApplicationForApplicantDTO[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    totalCount: number;
}
export interface ApplicationSearchParams{
    searchTerm?: string;
    statusFilter?: "Pendiente" | "Aceptada" | "Rechazada";
    sortBy?: "OfferTitle" | "CreatedAt";
    sortOrder?: "asc" | "desc";
    pageNumber: number;
    pageSize?: number;
}
export interface GetApplicationDetailsDTO{
    // Application data
    id: number;
    coverLetter?: string;
    status: 'Pendiente' | 'Aceptada' | 'Rechazada' | string;
    statusMessage: string;
    
    // Offer data
    offerTitle: string;
    description: string;
    applicationDeadline: string;
    createdAt: string;
    endDate: string;
    remuneration: number;
    
    // Offeror data
    offerorName: string;
    offerorUserType: string;
    profilePhotoUrl?: string;
    
    // Contact data
    contactEmail: string;
    contactPhoneNumber: string;
    additionalContactEmail?: string;
    additionalContactPhoneNumber?: string;
}

// Para oferentes
export interface ApplicationForOfferor {
    applicationId: number;
    applicantId: number;
    applicantPhotoUrl: string;
    applicantFirstName: string;
    applicantLastName: string;
    applicantEmail: string;
    applicationDate: string;
    status: 'Pendiente' | 'Aceptada' | 'Rechazada' | string;
    cvUrl?: string;
    coverLetter?: string;
}
export interface ApplicationsForOfferorResponse {
    applications: ApplicationForOfferor[];
    totalCount: number;
    totalPages: number;
    pageSize: number;
    currentPage: number;
}

export interface ApplicationsForOfferorSearchParams {
    sortBy?: "FirstName" | "ApplicationDate";
    sortOrder?: "asc" | "desc";
    pageNumber: number;
    pageSize?: number;
}

// Para admin
export interface ApplicationForAdmin {
    applicationId: number;
    applicantId: number;
    applicantPhotoUrl: string;
    applicantFirstName: string;
    applicantLastName: string;
    applicantEmail: string;
    applicationDate: string;
    status: 'Pendiente' | 'Aceptada' | 'Rechazada' | string;
    cvUrl?: string;
    coverLetter?: string;
}

export interface ApplicationsForAdminResponse {
    applications: ApplicationForAdmin[];
    totalCount: number;
    totalPages: number;
    pageSize: number;
    currentPage: number;
}

export interface ApplicationsForAdminSearchParams {
    sortBy?: "FirstName" | "ApplicationDate" | "Status";
    sortOrder?: "asc" | "desc";
    pageNumber: number;
    pageSize?: number;
}