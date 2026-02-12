import { BaseApiService } from "./base-api-service";
import { ApiResponse } from "@/models/generics";
import { 
    ApplicationsForApplicantDTO, 
    ApplicationSearchParams 
} from "@/models/responses";
import { 
    GetApplicationDetailsDTO,
    ApplicationsForOfferorResponse,
    ApplicationsForOfferorSearchParams,
    ApplicationsForAdminResponse,
    ApplicationsForAdminSearchParams,
 } from "@/models/responses/application";

export class ApplicationService extends BaseApiService {
    constructor() {
        super("/publications");
    }

    // Para postulantes
    getMyApplications(params: ApplicationSearchParams){
        const queryParams = new URLSearchParams();
        queryParams.append('PageNumber', String(params.pageNumber));
        if (params.pageSize) queryParams.append('PageSize', String(params.pageSize));
        if (params.searchTerm) queryParams.append('SearchTerm', params.searchTerm);
        if (params.statusFilter) queryParams.append('StatusFilter', params.statusFilter);
        if (params.sortBy) queryParams.append('SortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('SortOrder', params.sortOrder);

        return this.httpClient.get<ApiResponse<ApplicationsForApplicantDTO>>(
            `${this.baseURL}/my-applications?${queryParams.toString()}`
        );
    }

    getApplicationDetailsForApplicant(applicationId: number) {
        return this.httpClient.get<ApiResponse<GetApplicationDetailsDTO>>(
            `${this.baseURL}/my-applications/${applicationId}`
        );
    }

    applyToOffer(publicationId: number, coverLetter: string | null) {
        return this.httpClient.post<ApiResponse<string>>(
            `${this.baseURL}/offers/${publicationId}/apply`,
            { coverLetter }
        );
    }

    updateApplicationDetails(applicationId: number, payload: { coverLetter: string | null }) {
        return this.httpClient.patch<ApiResponse<string>>(
            `${this.baseURL}/my-applications/${applicationId}`,
            payload
        );
    }

    // Para oferentes
    getApplicationsByOfferId(offerId: number, params: ApplicationsForOfferorSearchParams) {
        return this.httpClient.get<ApiResponse<ApplicationsForOfferorResponse>>(
            `${this.baseURL}/my-publications/${offerId}/applications`,
            { params }
        );  
    }

    // Para admins
    getApplicationsByOfferIdForAdmin(offerId: number, params: ApplicationsForAdminSearchParams) {
        return this.httpClient.get<ApiResponse<ApplicationsForAdminResponse>>(
            `/admin${this.baseURL}/${offerId}/applications`,
            { params }
        );  
    }
}

export const applicationService = new ApplicationService();