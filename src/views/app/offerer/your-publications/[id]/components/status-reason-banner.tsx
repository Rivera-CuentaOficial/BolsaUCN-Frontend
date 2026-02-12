"use client";

import React from "react";
import { AlertCircle, XCircle, Info } from "lucide-react";

interface StatusReasonBannerProps {
  status: "Rechazada" | "Cerrada";
  reason?: string | null;
  appealCount?: number;
  maxAppeals?: number;
  onAppeal?: () => void;
  isAppealing?: boolean;
}

export function StatusReasonBanner({
  status,
  reason,
  appealCount = 0,
  maxAppeals = 3,
  onAppeal,
  isAppealing = false,
}: StatusReasonBannerProps) {
  const isRejected = status === "Rechazada";
  const isClosed = status === "Cerrada";
  const canAppeal = isRejected && appealCount < maxAppeals;

  if (!reason && !isRejected) return null;

  const Icon = isRejected ? XCircle : AlertCircle;
  const bgColor = isRejected ? "bg-red-50" : "bg-gray-50";
  const borderColor = isRejected ? "border-red-200" : "border-gray-200";
  const iconColor = isRejected ? "text-red-600" : "text-gray-600";
  const textColor = isRejected ? "text-red-900" : "text-gray-900";
  const title = isRejected ? "Publicación Rechazada" : "Publicación Cerrada";

  return (
    <div
      className={`${bgColor} ${borderColor} border-2 rounded-2xl p-6 space-y-4`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`${isRejected ? "bg-red-100" : "bg-gray-100"} p-2 rounded-xl`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">
            {title}
          </h3>
          {reason ? (
            <p className={`${textColor} text-base leading-relaxed`}>{reason}</p>
          ) : (
            <p className="text-gray-600 italic text-sm">
              No se proporcionó una razón específica.
            </p>
          )}
        </div>
      </div>

      {/* Appeal Section - Only for Rejected */}
      {isRejected && (
        <div className="pt-4 border-t border-red-200">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Apelaciones utilizadas: {appealCount} / {maxAppeals}
              </span>
            </div>

            {canAppeal && onAppeal && (
              <button
                onClick={onAppeal}
                disabled={isAppealing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition shadow-md flex items-center gap-2"
              >
                {isAppealing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  "Apelar Decisión"
                )}
              </button>
            )}

            {!canAppeal && (
              <span className="text-xs text-red-600 font-medium italic">
                Has alcanzado el límite de apelaciones para esta publicación.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}