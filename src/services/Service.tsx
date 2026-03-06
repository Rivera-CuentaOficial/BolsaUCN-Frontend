// src/services/Service.ts
import axios from "axios";
import Cookies from "js-cookie";
import { buildLoginUrl, extractUserFromJwt } from "@/lib/auth";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5185/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isHandlingExpiration = false;

api.interceptors.request.use(
  (config) => {
    console.log(
      `📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );

    const token = Cookies.get("token"); // ✅ Get the actual JWT token string
    if (token) {
      try {
        extractUserFromJwt(token); // ✅ Validate token structure and expiration
        console.log("🔐 Valid token found");
        config.headers.Authorization = `Bearer ${token}`; // ✅ Send full token
        console.log("🔑 Token attached to request");
      } catch (error) {
        console.warn("⚠️ Invalid or expired token:", error);
        if (!isHandlingExpiration) {
          isHandlingExpiration = true;
          Cookies.remove("token");

          const isOnLoginPage =
            typeof window !== "undefined" &&
            window.location.pathname.includes("/auth/login");
          if (!isOnLoginPage) {
            const errorMessage =
              error instanceof Error && error.message === "Token JWT expirado"
                ? "Tu sesión ha expirado. Redirigiendo al inicio de sesión..."
                : "Sesión inválida. Por favor, inicia sesión nuevamente.";

            toast.error(errorMessage, {
              duration: 2500,
            });

            setTimeout(() => {
              const currentPath =
                window.location.pathname + window.location.search;
              window.location.href = buildLoginUrl(
                currentPath,
                "session_expired",
              );
            }, 2500);
          }
        }
        return Promise.resolve({
          ...config,
          cancelToken: new axios.CancelToken((cancel) =>
            cancel("session_expired"),
          ),
        });
      }
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.resolve({ data: null });
    }

    // No response means the server is unreachable (network error / timeout)
    if (!error.response && typeof window !== "undefined") {
      window.location.href = "/connection-error";
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    const isOnLoginPage =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/auth/login");

    if (status === 401 && !isOnLoginPage && !isHandlingExpiration) {
      isHandlingExpiration = true;
      Cookies.remove("token");

      toast.info(
        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        {
          duration: 3000,
          icon: "🔒",
        },
      );

      setTimeout(() => {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = buildLoginUrl(currentPath, "session_expired");
      }, 800);

      return Promise.resolve({ data: null });
    }

    return Promise.reject(error);
  },
);

export default api;
