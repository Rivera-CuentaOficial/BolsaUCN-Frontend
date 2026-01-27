import {
  OfferForAdmin,
  PendingOffersForAdmin,
  BuySellBasic,
  AdminDetail,
  OfferDetailForAdmin,
  BuySellDetailForAdmin,
  PublicationType,
  PublishedItem,
  ViewAppplicantsForAdmin,
  ApplicantResponse,
  PostulantView,
  BuySellForAdmin,
  PostulantDetailForAdmin,
} from "@/models/responses";
import { OfferSubType, PublicationDetailsForApprovalDTO } from '@/models/responses/publication';
import { ValidationStatus } from "@/types/admin-publications";

export function toOfferTypeForAdmin(offerTypeNumber: number): OfferSubType {
    const typeValue = offerTypeNumber ?? 0;
    if (typeValue === 1) {
        return "Voluntariado";
    }
    return "Oferta de Trabajo";
}

export function mapOfferDtoToValidate(o: PendingOffersForAdmin): OfferForAdmin {
  return {
    id: String(o.id),
    title: o.title,
    offerType: toOfferTypeForAdmin(o.offerType),
  };
}

export function mapBuySellDtoToValidate(b: BuySellBasic): BuySellForAdmin {
  return {
    id: `bs-${String(b.id)}`,
    title: b.title,
    type: "Compra/Venta",
  };
}

export function mapOfferToManage(o: OfferDetailForAdmin): PublishedItem {
    console.log("id:", o.id, "tipo de oferta", o.offerType);
    return {
        id: o.id,
        title: o.title,
        offerType: toOfferTypeForAdmin(o.offerType),
        name: o.companyName && o.companyName.trim() !== "" ? o.companyName : "Empresa Desconocida",
        publicationDate: o.publicationDate,
        activa: o.activa ?? false,
    };
}

export function mapBuySellToManage(b: BuySellDetailForAdmin): PublishedItem {
    return {
        id: b.id,
        title: b.title,
        offerType: "Compra/Venta",
        name: b.nameOwner,
        publicationDate: b.publicationDate,
        activa: b.activa ?? true,
    };
}

type BadgeDisplayType = "Oferta de Trabajo" | "Voluntariado" | "Compra/Venta";

export function getOfferTypeDisplay(type: BadgeDisplayType) {
switch (type) {
    case "Voluntariado":
      return {
        text: "Voluntariado",
        className: "bg-green-100 text-green-800 hover:bg-green-200", 
      };
    case "Compra/Venta":
      return {
        text: "Compra y Venta",
        className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      };
    case "Oferta de Trabajo":
    default:
      return {
        text: "Oferta de Trabajo",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      };
  }
}

function getAdminDetailType(typeValue: any): PublicationType {
  if (typeof typeValue === "string") {
    if (
      typeValue === "Trabajo" ||
      typeValue === "Voluntariado" ||
      typeValue === "CompraVenta"
    )
      return typeValue as PublicationType;
  }
  if (typeof typeValue === "number") {
    if (typeValue === 0) return "Trabajo";
    if (typeValue === 1) return "Voluntariado";
  }
  return "Trabajo";
}

export function mapPublicationDetailsToAdminDetail(dto: PublicationDetailsForApprovalDTO): AdminDetail {
  const isOffer = dto.publicationType === "Oferta";
  const isBuySell = dto.publicationType === "CompraVenta";

  const id = isBuySell ? `bs-${dto.publicationId}` : String(dto.publicationId);
  let type: PublicationType;
  if (dto.offerType === "Voluntariado") {
    type = "Voluntariado";
  } else if (isBuySell) {
    type = "Compra/Venta";
  } else {
    type = "Trabajo";
  }

  return {
    id: id,
    title: dto.title,
    description: dto.description,
    companyName: dto.companyName || dto.userName || "Usuario UCN",
    publicationDate: dto.publicationDate,
    remuneration: isOffer ? dto.remuneration : undefined,
    price: isBuySell ? dto.price : undefined,
    type,
    statusValidation: dto.approvalStatus as ValidationStatus,
    active: dto.active,
    images: dto.images || dto.imageUrls || [],
    deadlineDate: dto.deadlineDate,
    endDate: dto.endDate,
    location: dto.location,
    requirements: dto.requirements,
    contactInfo: dto.additionalContactInfo,
    aboutMe: dto.aboutMe,
    rating: dto.rating || 0,
    category: isBuySell ? dto.category : undefined
  }
}

/**
 * @deprecated Usa mapPublicationDetailsToAdminDetail en su lugar
 */
export function mapOfferToDetail(dto: any): AdminDetail {
  const idValue = (dto as OfferDetailForAdmin).id ?? dto.id;
  const titleValue =
    (dto as OfferDetailForAdmin).title ?? dto.title ?? "Sin título";
  const descriptionValue =
    (dto as OfferDetailForAdmin).description ??
    dto.description ??
    "No hay descripción disponible.";
  const rawCompanyName =
    (dto as OfferDetailForAdmin).companyName ?? dto.companyName;
  const companyNameValue =
    rawCompanyName && rawCompanyName.trim() !== ""
      ? rawCompanyName
      : "Empresa Desconocida";
  const remunerationRaw =
    (dto as OfferDetailForAdmin).remuneration ?? dto.remuneration ?? 0;
  const cleanRemuneration = String(remunerationRaw).replace(/[^\d.]/g, "");
  const remunerationValue = parseFloat(cleanRemuneration) || 0;
  const publicationDateValue =
    (dto as OfferDetailForAdmin).publicationDate ?? dto.publicationDate;
  const statusValidationValue =
    (dto as OfferDetailForAdmin).statusValidation ??
    dto.statusValidation ??
    "Published";
  const activeValue =
    (dto as OfferDetailForAdmin).activa ?? dto.active ?? false;
  const imagesValue =
    (dto as OfferDetailForAdmin).images ?? dto.images ?? [];
  const offerSubtypeValue = (dto as any).offerType;
  const deadlineDateValue = (dto as any).DeadlineDate ?? dto.deadlineDate;
  const endDateValue = (dto as any).EndDate ?? dto.endDate;
  return {
    id: String(idValue),
    title: titleValue,
    description: descriptionValue,
    companyName: companyNameValue,
    publicationDate: publicationDateValue,
    remuneration: remunerationValue,
    type: getAdminDetailType(offerSubtypeValue),
    statusValidation: statusValidationValue,
    active: activeValue,
    images: imagesValue,
    price: undefined,
    deadlineDate: deadlineDateValue,
    endDate: endDateValue,
    location: dto.location,
    requirements: dto.requirements,
    contactInfo: dto.contactInfo,
    aboutMe: dto.aboutMe,
    rating: dto.rating || 0
  };
}

/**
 * @deprecated Usa mapPublicationDetailsToAdminDetail en su lugar
 */
export function mapBuySellToDetail(dto: any): AdminDetail {
  const idValue = (dto as BuySellDetailForAdmin).id ?? dto.id;
  const titleValue =
    (dto as BuySellDetailForAdmin).title ?? dto.title ?? "Sin título";
  const descriptionValue =
    (dto as BuySellDetailForAdmin).description ??
    dto.description ??
    "No hay descripción disponible.";
  const rawUserName =
    (dto as BuySellDetailForAdmin).nameOwner ?? dto.userName;
  const userNameValue =
    rawUserName && rawUserName.trim() !== "" ? rawUserName : "Usuario UCN";

  const publicationDateValue =
    (dto as BuySellDetailForAdmin).publicationDate ??
    dto.publicationDate ??
    undefined;
  const priceValue =
    (dto as BuySellDetailForAdmin).price ?? dto.price ?? undefined;

  return {
    id: `bs-${String(idValue)}`,
    title: titleValue,
    description: descriptionValue,
    companyName: userNameValue,
    publicationDate: publicationDateValue,
    price: priceValue,
    type: "Compra/Venta",
    remuneration: undefined,
    images: [],
    active: false,
    statusValidation: "Published",
    location: dto.location,
    requirements: undefined,
    contactInfo: dto.contactInfo,
    aboutMe: dto.aboutMe,
    rating: dto.rating || 0,
    category: dto.category
  };
}

export function getPublicRouteFromAdmin(adminPath: string): string {
  if (
    adminPath === "/admin/publications/validate" ||
    adminPath === "/admin/publications/manage"
  ) {
    return "/offers";
  }
  return "/";
}

export type AdminItemType = "Oferta de Trabajo" | "Compra/Venta";

export function getAdminItemTypeString(typeValue: number): AdminItemType {
    if (typeValue === 0 || typeValue === 1) {
        return "Compra/Venta";
    }
    return "Oferta de Trabajo";
}

export function mapApplicantToView(dto: ViewAppplicantsForAdmin): ViewAppplicantsForAdmin {
    return {
        id: dto.id,
        applicant: dto.applicant,
        status: dto.status as "Pending" | "Published" | "Rejected",
        rating: dto.rating || 0,
    };
}
    // Función transformadora (Mapper)
export const mapOffererApplicantToView = (dto: ApplicantResponse): PostulantView => {
    return {
        id: dto.applicationId,
        studentId: dto.studentId,
        name: dto.applicantName,
        status: dto.status,
        // Formateamos la fecha aquí para no hacerlo en el HTML
        submittedAt: new Date(dto.applicationDate).toLocaleDateString('es-CL', {
            year: 'numeric', month: 'long', day: 'numeric'
        }),
        cvUrl: dto.curriculumVitaeUrl || null,
        rating: dto.rating || 0,
    };
};


export const getPresentationType = (modelType: string | undefined): string => {
    if (!modelType) return "Tipo Desconocido";

    switch (modelType) {
        case "Trabajo":
            return "Oferta de Trabajo";
        case "Voluntariado":
            return "Voluntariado";
        case "CompraVenta":
            return "Compra y Venta";
        default:
            return modelType;
    }
};

export const getApplicantDetailForAdmin = (dto: any): PostulantDetailForAdmin => {
    return {
        id: dto.id,
        studentName: dto.studentName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        status: dto.status,
        curriculumVitae: dto.curriculumVitae,
        rating: dto.rating,
        motivationLetter: dto.motivationLetter,
        disability: dto.disability,
        profilePicture: dto.ProfilePicture,
    };
}