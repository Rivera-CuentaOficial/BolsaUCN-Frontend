import { toOfferTypeForAdmin } from "@/lib";

export interface PendingOffersForAdmin {
    title: string;
    offerType: number;
    id: number;
}
// Interfaz de entrada para todas las interfaces de salida que usen ofertas
export interface OfferDetailForAdmin {
    id: number;
    title: string; 
    description: string;
    images: string[];
    companyName: string;
    publicationDate: string;
    offerType: number;
    statusValidation: "Pending" | "Published" | "Rejected"; 
    remuneration: number; 
    activa: boolean;
    location: string;
    requirements: string;
}
// Interfaz de entrada para todas las interfaces de salida que usen compras/ventas
export interface BuySellDetailForAdmin {
    id: number;
    title: string;
    description: string;
    images: string[];
    nameOwner: string;
    publicationDate: string;
    price: number;
    type: number;
    statusValidation: "Pending" | "Published" | "Rejected"; 
    activa: boolean;
}

export type BuySellBasic = {
  id: number;
  title: string;
  category: string;
  price: number;
  location: string;
  publicationDate: string;
  userName: string;        
};

export type AdminItemType = OfferSubType | "Compra/Venta";

export type ValidationType = "Todos" | AdminItemType;

export interface BuySellForAdmin {
    id: string;
    title: string;
    type: "Compra/Venta";
}
export interface OfferForAdmin {
    id: string;
    title: string;
    offerType: OfferSubType;
}
// solo se usa para que se vea bien el tipo en la pagina
export interface AdminItemBase {
    id: string;
    title: string;
    type: "Oferta de Trabajo" | "Voluntariado" | "Compra/Venta"; 
}
export type AdminItem = OfferForAdmin | BuySellForAdmin;

export type OfferSubType = "Oferta de Trabajo" | "Voluntariado";

export interface OfferTypeForAdmin {
    id: string;
    title: string;
    offerType: OfferSubType; 
}

export interface ValidationItemFull {
    id: string; 
    item: AdminItem;
}

export interface PublishedItem {
    title: string;
    offerType: string;
    name: string;
    publicationDate: string;
    activa: boolean;
    id: number;
}

export type PublicationType = "Trabajo" | "Voluntariado" | "Compra/Venta"; 
export type ValidationStatus = "Pending" | "Published" | "Rejected";

export interface AdminDetail {
    id: string; 
    userId: number;
    title: string;
    description: string;
    images: string[];
    companyName: string; 
    publicationDate: string;
    type: PublicationType; 
    active: boolean; 
    statusValidation: ValidationStatus; 
    price?: number;
    remuneration?: number;
    deadlineDate?: string;
    isCVRequired?: boolean; 
    endDate?: string;
    location?: string;
    requirements?: string;
    contactInfo: string;
    aboutMe?: string;
    rating: number;
    category?: string;
    additionalContactEmail?: string;
    additionalContactPhoneNumber?: string;
}

export interface UseAdminDetailValidateResult {
    detail: AdminDetail | null;
    loading: boolean;
    error: string | null;
    isMutating: boolean; 
    handleAction: (action: 'publish' | 'reject') => void;
    handleRetry: () => void;
}

export interface UseAdminDetailManageResult {
    detail: AdminDetail | null;
    loading: boolean;
    error: string | null;
    isMutating: boolean; 
    handleAction: (action: 'close_publication') => void;
    handleRetry: () => void;
}

export interface PublicationResponse {
  message: string;
  data: string; // e.g., "Oferta ID: 14
  }

export interface CreatePublicationData {
  Title: string;
  Description: string;
  EndDate?: string; // Fecha de término de la oferta/pasantía
  ApplicationDeadline?: string; // Fecha límite para postular
  Remuneration?: number | null; // Remuneración ofrecida (null para voluntariados)
  OfferType: string; 
  Location?: string;
  RequiredApplicants?: number;
  AdditionalContactEmail?: string;
  AdditionalContactPhoneNumber?: string;
  IsCvRequired: boolean;
}
export interface CreateBuySellData 
{
  Title: string;
  Description: string;
  Category: string;
  Price: number;
  ImagesURL: string[],
  Location: string;
  AdditionalContactEmail?: string;
  AdditionalContactPhoneNumber?: string;
}

    //  mypublished PublicationsDTO
export interface MyPublishedPublication {
    idPublication: number;  // Antes tenías IdPublication o Id
    userId: number;
    title: string;          // Antes Title
    types: number;          // Viene como número (0), no como string
    description: string;    // Antes Description
    publicationDate: string;
    images: string[];
    isActive: boolean;
    statusValidation: number; // Viene como número (0)
}






    //  mypublished PublicationsDTO
export interface MyPublishedPublication {
    idPublication: number;  // Antes tenías IdPublication o Id
    userId: number;
    title: string;          // Antes Title
    types: number;          // Viene como número (0), no como string
    description: string;    // Antes Description
    publicationDate: string;
    images: string[];
    isActive: boolean;
    statusValidation: number; // Viene como número (0)
}

// interfaz para ver los postulantes de una publicación
export interface ViewAppplicantsForAdmin {
  id: number;
  applicant: string;
  status: "Pendiente" | "Aceptada" | "Rechazada" | string;
  rating: number;
}

export interface PostulantDetailForAdmin {
  id: number;
  studentName: string;
  email: string;
  phoneNumber: string;
  status: "Pending" | "Published" | "Rejected" | string;
  curriculumVitae?: string;
  rating?: string;
  motivationLetter?: string;
  disability?: string;
  profilePicture?: string;
}



//while dev


// types/postulants.ts (o donde tengas tus tipos)
 // La interfaz que creamos antes

// Esta es la estructura que tu componente visual (la Tabla o Lista) espera recibir
export interface PostulantView {
    id: number; // applicationId
    studentId: number;
    name: string; // Mapeado de 'applicantName'
    status: string;
    submittedAt: string; // Fecha formateada
    cvUrl: string | null;
    rating: number;
}


export interface ApplicantResponse{
    applicationId: number;
    studentId: number;
    applicantName: string;
    // Si conoces todos los estados posibles, es mejor usar un Union Type en vez de string
    status: 'Pendiente' | 'Aceptada' | 'Rechazada' | string;
    applicationDate: string; // Viene como ISO string desde el backend
    curriculumVitaeUrl: string;
    rating?: number;

}
export interface OfferDetail {
  id: number;
  title: string;
  description: string;
  category?: string;
  
  // Propiedades específicas de Trabajo
  remuneration?: number;    // Para trabajos
  companyName?: string;     // Para trabajos
  offerType?: string;
  
  // Propiedades comunes que a veces cambian de nombre
  location: string;
  postDate?: string;        // A veces viene como postDate
  publicationDate?: string; // A veces viene como publicationDate
  endDate?: string;         // Fecha término

  userId: number;
  userName: string;
  userEmail: string;
  aboutMe?: string;
  statusValidation: number;
}

export interface MyBuySell {
  id: number;
  title: string;
  description: string;
  category: string;
  
  // Propiedades específicas de Compra/Venta
  price: number;            // Para ventas
  contactInfo: string;
  
  location: string;
  publicationDate: string;
  isActive: boolean;
  imageUrls: string[];
  
  userId: number;
  userName: string;
  userEmail: string;
  statusValidation: number;
}

export interface ValidationResponse {
    publicationId: number;
    rejectionReason?: string | null;
}

//! NEW ENDPOINTs RESPONSE INTERFACES
export interface PublicationForValidationDTO {
    publicationId: number;
    title: string;
    type: 'Oferta' | 'CompraVenta';
    createdAt: string;
    CreatedBy: string;
    status: 'Aceptada' | 'Pendiente' | 'Rechazada';
    offerType?: number; // Solo para ofertas
    price?: number;     // Solo para compras/ventas
}
export interface PublicationsForValidationDTO {
    publications: PublicationForValidationDTO[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    totalCount: number;
}
export interface PaginatedValidationItems {
    publications: ValidationItemFull[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    totalCount: number;
}
export interface PublicationDetailsForApprovalDTO {
    publicationId: number;
    userId: number;
    userEmail: string;
    userName: string;
    title: string;
    description: string;
    images: string[];
    publicationDate: string;
    endDate: string;
    publicationType: string;
    isOpen: boolean;
    approvalStatus: string;
    location: string;
    additionalContactEmail?: string;
    additionalContactPhoneNumber?: string;
    aboutMe: string;
    rating: number;

    // Offer attributes
    deadlineDate: string;
    requirements: string;
    remuneration: number;
    offerType: string;

    // BuySell attributes
    category: string;
    price: number;

    // Legacy attributes for frontend compatibility
    active: boolean;
    isActive: boolean;
    imageUrls: string[];
    companyName: string;
}
// Get my publications
export interface PublicationForOfferor {
    publicationId: number;
    title: string;
    publicationType: 'Oferta' | 'CompraVenta';
    publicationDate: string;
    approvalStatus: 'Aceptada' | 'Pendiente' | 'Rechazada' | 'Cerrada';
}
export interface MyPublicationsResponse {
    publications: PublicationForOfferor[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    totalCount: number;
}
export interface MyPublicationsSearchParams {
    searchTerm?: string;
    filterByPublicationType?: 'Oferta' | 'CompraVenta';
    filterByApprovalStatus?: 'Aceptada' | 'Pendiente' | 'Rechazada' | 'Cerrada';
    sortBy?: 'Title' | 'CreatedAt';
    sortOrder?: 'asc' | 'desc';
    pageNumber?: number;
    pageSize?: number;
}
export interface MyPublicationDetails {
    // Informacion basica
    id: number;
    title: string;
    description: string;
    location:string;
    
    // Informacion de contacto
    contactEmail: string;
    contactPhone: string;
    additionalContactEmail?: string;
    additionalContactPhoneNumber?: string;

    // Metadata
    publicationType: 'Oferta' | 'CompraVenta';
    approvalStatus: 'Aceptada' | 'Pendiente' | 'Rechazada' | 'Cerrada';
    createdAt: string;
    reasonForClosure?: string | null;
    reasonForRejection?: string | null;
    appealCount: number;

    // Ofertas 
    offerType?: 'Trabajo' | 'Voluntariado';
    endDate?: string;
    applicationDeadline?: string;
    remuneration?: number;
    isCvRequired?: boolean;
    applicationsCount?: number;
    reviewStatus?: 'NoDisponible' | 'SinRevisar' | 'RevisadaPorOferente' | 'RevisadaPorPostulante' | 'RevisadaPorAmbos';

    // Compras/Ventas
    imageUrls?: string[];
    price?: number;
    category?: string;
    quantity?: number;
    availability?: string;
    condition?: string;
}

// Explorar ofertas
export interface OfferForApplicant {
    id: number;
    title: string;
    description: string;
    authorName: string;
    offerType: string;
    createdAt: string;
    applicationDeadline: string;
    availableSlots: number;
    remuneration: number;
}

export interface OffersForApplicant {
    offers: OfferForApplicant[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    totalCount: number;
}

export interface ExploreOffersSearchParams {
    searchTerm?: string;
    filterBy?: 'Trabajo' | 'Voluntariado' | 'Todos';
    sortBy?: 'Title' | 'CreatedAt' | 'Remuneration';
    sortOrder?: 'asc' | 'desc';
    pageNumber: number;
    pageSize?: number;
}

// Detalles para ofertas
export interface OfferDetailsForApplicant {
    id: number;
    offerType: string;
    title: string;
    description: string;
    authorName: string;
    location: string;
    createdAt: string;
    remuneration: number;
    isCVRequired: boolean;
    endDate: string;
    applicationDeadline: string;
    hasApplied: boolean;
    availableSlots: number;
    contactEmail: string;
    contactPhoneNumber: string;
    additionalContactEmail?: string;
    additionalContactPhoneNumber?: string;
}

export interface OfferDetailsForPublic {
    id: number;
    offerType: string;
    title: string;
    description: string;
    authorName: string;
    location: string;
    createdAt: string;
    remuneration: number;
    isCVRequired: boolean;
}

// Explorar compras/ventas
export interface BuySellForApplicant {
    id: number;
    title: string;
    description: string;
    authorName: string;
    price: number;
    category: string;
    location: string;
    createdAt: string;
}

export interface BuySellsForApplicant {
    buySells: BuySellForApplicant[];
    totalCount: number;
    totalPages: number;
    pageSize: number;
    currentPage: number;
}

// Administracion de publicaciones
export interface PublicationForAdmin {
  id: number;
  publicationType: string;
  title: string;
  description: string;
  location: string;
  approvalStatus: string;
  appealsCount: number;
  createdAt: string;
  // Informacion del usuario
  authorId: number;
  authorName: string;
  userType: string;
  profilePhotoUrl: string;
  authorEmail: string;
}

export interface PublicationsForAdmin {
    publications: PublicationForAdmin[];
    totalCount: number;
    totalPages: number;
    pageSize: number;
    currentPage: number;
}

export interface PublicationsForAdminSearchParams {
    searchTerm?: string;
    filterByType?: "Oferta" | "CompraVenta" | "Todos";
    filterByApprovalStatus?: "Pendiente" | "Aprobada" | "Rechazada" | "Cerrada" | "Todos";
    sortBy?: "Title" | "CreatedAt";
    sortOrder?: "asc" | "desc";
    pageSize?: number;
    pageNumber: number;
}

export interface PublicationDetailsForAdmin {
    publicationId: number;
    title: string;
    description: string;
    publicationDate: string;
    publicationType: string;
    approvalStatus: string;
    location: string;
    additionalContactEmail?: string;
    additionalContactPhoneNumber?: string;

    // Informacion del usuario
    userId: number;
    userEmail: string;
    userPhoneNumber: string;
    profilePhotoUrl: string;
    userName: string;
    userType: string;
    aboutMe: string;
    rating: number;

    // Atributos de oferta
    endDate?: string;
    deadlineDate?: string;
    remuneration?: number;
    offerType?: string;
    isCVRequired?: boolean;
    applicantsCount?: number;

    // Atributos de compra/venta
    images: string[];
    price?: number;
    category?: string;
}


