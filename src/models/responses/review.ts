// DTOs for the new Review system (NewReview entity)

export interface MyReviewDTO {
  reviewId: number;
  reviewStatus: string;
  jobOfferTitle: string;
  openUntil: string;
  hasReviewBeenActionedByAdmin: boolean;
  applicantId: number;
  applicantFullName: string;
  offerorId: number;
  offerorFullName: string;
}

export interface MyReviewsDTO {
  reviews: MyReviewDTO[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface MyReviewDetailsDTO {
  reviewId: number;
  offerorRatingOfApplicant: number | null;
  offerorCommentForApplicant: string | null;
  applicantRatingOfOfferor: number | null;
  applicantCommentForOfferor: string | null;
  isOnTime: boolean | null;
  isPresentable: boolean | null;
  isRespectful: boolean | null;
  offerorReviewCompletedAt: string | null;
  applicantReviewCompletedAt: string | null;
  reviewClosedAt: string | null;
  isOfferorReviewForApplicantHidden: boolean | null;
  offerorReviewHiddenAt: string | null;
  isApplicantReviewForOfferorHidden: boolean | null;
  applicantReviewHiddenAt: string | null;
  jobOfferId: number;
  jobOfferTitle: string;
  applicationId: number;
  applicantId: number;
  applicantFullName: string;
  offerorId: number;
  offerorFullName: string;
  openUntil: string;
  reviewStatus: string;
}

export interface ApplicantReviewForOfferorDTO {
  rating: number;
  comment: string;
}

export interface OfferorReviewForApplicantDTO {
  rating: number;
  comment: string;
  isOnTime: boolean;
  isPresentable: boolean;
  isRespectful: boolean;
}

export interface MyReviewsSearchParamsDTO {
  publicationTitle?: string;
  reviewStatus?: string;
  sortOrder?: string;
  pageNumber: number;
  pageSize?: number;
}

// Admin DTOs
export interface GetReviewDTO {
  reviewId: number;
  reviewStatus: string;
  jobOfferTitle: string;
  openUntil: string;
  hasReviewBeenActionedByAdmin: boolean;
  applicantFullName: string;
  offerorFullName: string;
}

export interface GetReviewsDTO {
  reviews: GetReviewDTO[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface GetReviewDetailsDTO {
  reviewId: number;
  offerorCommentForApplicant: string | null;
  offerorRatingOfApplicant: number | null;
  applicantCommentForOfferor: string | null;
  applicantRatingOfOfferor: number | null;
  isOnTime: boolean | null;
  isPresentable: boolean | null;
  isRespectful: boolean | null;
  offerorReviewCompletedAt: string | null;
  applicantReviewCompletedAt: string | null;
  reviewClosedAt: string | null;
  isOfferorReviewForApplicantHidden: boolean | null;
  offerorReviewHiddenAt: string | null;
  isApplicantReviewForOfferorHidden: boolean | null;
  applicantReviewHiddenAt: string | null;
  jobOfferId: number;
  jobOfferTitle: string;
  applicationId: number;
  applicantId: number;
  applicantFullName: string;
  offerorId: number;
  offerorFullName: string;
  openUntil: string;
  reviewStatus: string;
}

export interface GetReviewsSearchParamsDTO {
  searchTerm?: string;
  filterByReviewStatus?: string;
  sortBy?: string;
  sortOrder?: string;
  pageNumber: number;
  pageSize?: number;
}

export interface HideReviewInfoDTO {
  hideOfferorReviewForApplicant?: boolean;
  offerorReviewHiddenReason?: string;
  hideApplicantReviewForOfferor?: boolean;
  applicantReviewHiddenReason?: string;
}