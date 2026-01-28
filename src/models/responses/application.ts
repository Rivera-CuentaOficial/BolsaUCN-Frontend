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