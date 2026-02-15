// frontend-PIS/src/lib/auth.ts

import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { JwtClaims } from "@/models/generics";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  return Cookies.get("token") ?? null;
}

export function isLoggedIn(): boolean {
  return !!getTokenFromCookie();
}

export function getUserTypeFromToken(): string {
  const token = getTokenFromCookie();
  if (!token) return "";

  const decoded = jwtDecode<JwtClaims>(token);
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    return "";
  }
  const userType = decoded["userType"];
  return userType;
}

export function getUserFromToken(): {
  userId?: string;
  name?: string;
  email?: string;
  sub?: string;
  role?: string;
  userName?: string;
  userType?: string;
} | null {
  const token = getTokenFromCookie();
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const json = JSON.parse(
      decodeURIComponent(
        atob(payloadBase64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );

    const ID_URI = 
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
    const NAME_URI =
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
    const EMAIL_URI =
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
    const ROLE_URI =
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    return {
      userId: json[ID_URI],
      name:
        json.name ||
        json.unique_name ||
        json[NAME_URI] ||
        (json.email ? String(json.email).split("@")[0] : undefined),
      userName: json.userName,
      email: json.email || json[EMAIL_URI],
      sub: json.sub,

      role: json[ROLE_URI],
      userType: json.userType,
    };
  } catch {
    return null;
  }
}

export function extractUserFromJwt(token: string | null) {
  try {
    if (!token) throw new Error("Token JWT no proporcionado");
    const decoded = jwtDecode<JwtClaims>(token);

    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token JWT expirado");
    }

    const user = {
      id: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
      email:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
      userName: decoded["userName"],
      userType: decoded["userType"],
      exp: decoded.exp,
    };

    if (!user.id || !user.email) {
      throw new Error("Claims requeridas faltantes en el JWT");
    }

    return user;
  } catch (error) {
    throw error;
  }
}

export function getRoleFromToken(token: string) {
  if (!token) return null;
  const decoded = jwtDecode<JwtClaims>(token);

  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  const role = decoded[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ];
  return role;
}

export function logoutAndRedirect(path = "/") {
  Cookies.remove("token", { path: "/" });
  if (typeof window !== "undefined") window.location.href = path;
}

export function buildLoginUrl(returnTo: string = "/", msg?: string): string {
  const q = new URLSearchParams({ returnTo });
  if (msg) q.set("msg", msg);
  return `/auth/login?${q.toString()}`;
}

export function getProfileRoute(userType?: string): string {
  const typeMap: Record<string, string> = {
    "Estudiante": "/profile/student",
    "Particular": "/profile/individual",
    "Empresa": "/profile/company",
    "Administrador": "/profile/admin",

  };
  return typeMap[userType || ""] || "/profile";
};

/**
export function extractUserFromJwt(token: string) {
  try {
    const decoded = jwtDecode<JwtClaims>(token);
  } catch (error) {
    throw error;
  }
}
  */

export function isSessionExpired(
  session: { customExp?: number } | null | undefined
): boolean {
  if (!session?.customExp) return true;

  const nowUTC = Math.floor(Date.now() / 1000);
  const expired = nowUTC >= session.customExp;

  return expired;
}

export function isTokenExpired(
  token: { customExp?: number } | null | undefined
): boolean {
  if (!token || !token.customExp) return true;
  const now = Math.floor(Date.now() / 1000);
  return token.customExp < now;
}
