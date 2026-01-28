export interface ApplicationForApplicantDTO{
    offerId: number;
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