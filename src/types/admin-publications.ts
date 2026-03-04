export type AdminItemType = "Trabajo" | "CompraVenta"; 
export type ValidationType = "Todos" | AdminItemType;

export interface OfferForAdmin {
    id: string; // VITAL para la clave y navegación
    title: string;
    type: AdminItemType; 
}

export interface ValidationItemFull {
    id: string; 
    item: OfferForAdmin;
}

export type PublicationType = "Trabajo" | "Voluntariado" | "CompraVenta"; 
export type ValidationStatus = "Pending" | "Published" | "Rejected";