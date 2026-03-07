import { BaseApiService } from "./base-api-service";
import { ApiResponse } from "@/models/generics";
import type {
  OffersForApplicant,
  ExploreOffersSearchParams,
  ExploreBuySellsSearchParams,
  BuySellsForApplicant,
  OfferDetailsForPublic,
  OfferDetailsForApplicant,
  BuySellDetailsForApplicant,
  BuySellDetailsForPublic,
} from "@/models/responses";

export class ExplorePublicationService extends BaseApiService {
  constructor() {
    super("/publications");
  }

  getExploreOffers(params: ExploreOffersSearchParams) {
    return this.httpClient.get<ApiResponse<OffersForApplicant>>(
      `${this.baseURL}/explore/offers`,
      { params }
    );
  }

  getExploreBuySells(params: ExploreBuySellsSearchParams) {
    return this.httpClient.get<ApiResponse<BuySellsForApplicant>>(
      `${this.baseURL}/explore/buysells`,
      { params }
    );
  }

  getOfferDetailsPublic(publicationId: number) {
    return this.httpClient.get<ApiResponse<OfferDetailsForPublic>>(
      `${this.baseURL}/explore/offers/${publicationId}/public`
    );
  }

  getOfferDetailsForApplicant(publicationId: number) {
    return this.httpClient.get<ApiResponse<OfferDetailsForApplicant>>(
      `${this.baseURL}/explore/offers/${publicationId}`
    );
  }

  getBuySellDetailsPublic(publicationId: number) {
    return this.httpClient.get<ApiResponse<BuySellDetailsForPublic>>(
      `${this.baseURL}/explore/buysells/${publicationId}/public`
    );
  }

  getBuySellDetailsForApplicant(publicationId: number) {
    return this.httpClient.get<ApiResponse<BuySellDetailsForApplicant>>(
      `${this.baseURL}/explore/buysells/${publicationId}`
    );
  }
}

export const explorePublicationService = new ExplorePublicationService();