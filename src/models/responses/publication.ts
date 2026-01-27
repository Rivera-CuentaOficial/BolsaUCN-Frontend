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
    endDate?: string;
    location?: string;
    requirements?: string;
    contactInfo: string;
    aboutMe?: string;
    rating: number;
    category?: string;
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
  Remuneration?: number;
  OfferType: number; // 0 para Trabajo, 1 para Voluntariado/Pasantía
  Location?: string;
  Requirements?: string;
  AdditionalContactInfo?: string;
  //ImagesURL: string[];
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
  ContactInfo: string;
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
    status: 'Publicado' | 'EnProceso' | 'Rechazado';
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
    additionalContactInfo: string;
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