import { BaseApiService } from "./base-api-service";
import { ApiResponse } from "@/models/generics";
import { 
    ApplicationForApplicantDTO, 
    ApplicationsForApplicantDTO, 
    ApplicationSearchParams 
} from "@/models/responses";

export class ApplicationService extends BaseApiService {
    constructor() {
        super("/publications");
    }

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
}

export const applicationService = new ApplicationService();