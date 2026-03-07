export interface FormData {
  Title: string;
  Description: string;
  OfferType: string; // '0' para Trabajo, '1' para Voluntariado
  EndDate: string;
  ApplicationDeadline: string;
  Remuneration: string;
  Location: string;
  Requirements: string;
  AdditionalContactInfo: string;
  IsCvRequired: boolean;
}


export interface OffererPublication {
  id: number;
  title: string;
  description: string;
  offerType: number;
  publicationDate: string;
  deadlineDate: string;
  endDate?: string;
  remuneration?: number;
  location?: string;
  status: number;
}
export interface OffererBuySell {
  id: number;
  title: string;
  description: string;
  offerType: number;
  publicationDate: string;
  deadlineDate: string;
  endDate?: string;
  remuneration?: number;
  location?: string;
  status: number;
}
export interface OfferDetail {
  id: number;
  title: string;
  description: string;
  offerType: string;
  publicationDate: string;
  companyName:string;
  location?: string;
  postDate: string;
  endDate?: string;
  remuneration?: number;
}
    // OfferDetailDto
    // public int Id s 
    //  string Title s
    //  string Description s
    //  string CompanyName 
    //  string? Location 
    //  DateTime PostDate s
    //  DateTime EndDate  s
    //  int Remuneration s
    //  string OfferType s