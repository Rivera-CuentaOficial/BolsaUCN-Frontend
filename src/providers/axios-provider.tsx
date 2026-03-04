import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";

import { isSessionExpired } from "@/lib";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async config => {
  // Try to get the session only on the client side
  if (typeof window !== "undefined") {
    try {
      const session = await getSession();
      // debug: ver session
      // eslint-disable-next-line no-console
      console.debug("getSession()", session);

      let token = session?.accessToken as string | undefined;

      // fallback: localStorage
      if (!token) {
        token = localStorage.getItem("accessToken") || localStorage.getItem("token") || undefined;
      }

      // fallback: cookie named "token"
      if (!token) {
        const cookieToken = document.cookie
          .split("; ")
          .find((c) => c.startsWith("token="))
          ?.split("=")[1];
        if (cookieToken) token = decodeURIComponent(cookieToken);
      }

      if (token) {
        // eslint-disable-next-line no-console
        console.debug("Using token (partial):", `${token.slice(0,8)}...${token.slice(-8)}`);
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      } else {
        // eslint-disable-next-line no-console
        console.warn("No token available for request to", config.url);
      }

      if (session && isSessionExpired(session)) {
        toast.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        await signOut({ redirect: false });
        return Promise.reject(new Error("Token expired"));
      }
    } catch (e) {
      // No bloquear peticiones si getSession falla
      // eslint-disable-next-line no-console
      console.warn("getSession failed (continuing without token):", e);
    }
  }

  return config;
});
