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
    id: number;
    offerTitle: string;
    companyName: string;
    applicationDeadline: string;
    createdAt: string;
    endDate?: string;
    remuneration: number;
    description?: string;
    requirements?: string;
    contactInfo?: string;
    coverLetter?: string;
    status: 'Pendiente' | 'Aceptada' | 'Rechazada' | string;
    statusMessage?: string;
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