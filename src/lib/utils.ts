import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { 
    OfferForAdmin, 
    PendingOffersForAdmin, 
    BuySellBasic 
} from "@/models/responses/publication";

export function thousandSeparatorPipe(num: number | null | undefined): string {
  // Si num es null o undefined, se usa 0 para evitar el error .toFixed.
  const finalNum = num ?? 0;

  return finalNum
    .toFixed(0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatDate(date: string): string {
  const parsedDate = new Date(date);
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  return `${day}/${month}/${year}`;
}

export const isValidId = (id: string): boolean => {
  return /^[1-9]\d*$/.test(id);
};

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function getRoleFromToken() {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const decodedToken: any = jwtDecode(token);
    const userRole = decodedToken[ROLE_CLAIM]; 
    return typeof userRole === 'string' ? userRole.trim() : null;
  } catch (e) {
    return null;
  }
}

export function getRolesFromToken(): string[] {
  const token = Cookies.get("token");
  if (!token) return [];
  
  try {
    const decodedToken: any = jwtDecode(token);
    const userRole = decodedToken[ROLE_CLAIM];
    
    if (!userRole) return [];
    
    if (Array.isArray(userRole)) {
      return userRole.map(role => role.trim()).filter(Boolean);
    }
    
    if (typeof userRole === 'string') {
      const trimmed = userRole.trim();
      return trimmed ? [trimmed] : [];
    }
    
    return [];
  } catch (e) {
    console.error("Error al obtener roles del token:", e);
    return [];
  }
}
// Nuevas funciones para obtener los roles de los usuarios
export function hasRole(role: string): boolean {
  const roles = getRolesFromToken();
  return roles.includes(role);
}

export function hasAnyRole(rolesToCheck: string[]): boolean {
  const roles = getRolesFromToken();
  return rolesToCheck.some(role => roles.includes(role));
}

export function hasAllRoles(rolesToCheck: string[]): boolean {
  const roles = getRolesFromToken();
  return rolesToCheck.every(role => roles.includes(role));
}