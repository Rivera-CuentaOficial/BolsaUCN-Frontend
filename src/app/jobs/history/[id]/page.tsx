'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GetApplicationDetailsDTO } from "@/models/responses";
import { applicationService } from "@/services/applicationService";
import { toast } from "sonner";

function toCLDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(+d)
    ? "—"
    : d.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function StatusBadge({ value }: { value?: string | null }) {
  const v = (value ?? "Pendiente").toLowerCase();
  const map: Record<string, { wrap: string; label: string }> = {
    pendiente: {
      wrap: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pendiente",
    },
    aceptada: {
      wrap: "bg-green-100 text-green-800 border-green-200",
      label: "Aceptada",
    },
    rechazada: {
      wrap: "bg-red-100 text-red-800 border-red-200",
      label: "Rechazada",
    }
  };
  const { wrap, label } = map[v] ?? map.pendiente;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm border ${wrap}`}
    >
      {label}
    </span>
  );
}

function cardAccent(status?: string | null) {
  const v = (status ?? "Pendiente").toLowerCase();
  if (v === "aceptada") return "border-green-200";
  if (v === "rechazada") return "border-red-200";
  return "border-yellow-200";
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = Number(params.id);

  const [application, setApplication] = useState<GetApplicationDetailsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await applicationService.getApplicationDetailsForApplicant(applicationId);
        
        if (mounted) {
          const data = res.data.data ?? null;
          setApplication(data);
          if (data?.coverLetter) {
            setEditedCoverLetter(data.coverLetter);
          }
        }
      } catch (e: any) {
        console.error("Error loading application details:", e);
        
        if (mounted) {
          setError(
            e.response?.data?.message || "No pudimos cargar los detalles. Inicia sesión nuevamente si el problema persiste."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  const handleSaveCoverLetter = async () => {
    if (!editedCoverLetter.trim()) {
      toast.error("La carta de presentación no puede estar vacía");
      return;
    }

    if (editedCoverLetter.length > 1000) {
      toast.error("La carta de presentación no puede exceder los 1000 caracteres");
      return;
    }

    setIsSaving(true);
    try {
      await applicationService.updateApplicationDetails(applicationId, editedCoverLetter);
      
      // Update local state
      if (application) {
        setApplication({ ...application, coverLetter: editedCoverLetter });
      }
      
      setIsEditing(false);
      toast.success("Carta de presentación actualizada exitosamente");
    } catch (e: any) {
      console.error("Error updating cover letter:", e);
      toast.error(
        e.response?.data?.message || "No se pudo actualizar la carta de presentación"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedCoverLetter(application?.coverLetter || "");
    setIsEditing(false);
  };

  if (loading) {
    return <main className="max-w-4xl mx-auto p-6">Cargando…</main>;
  }

  if (error || !application) {
    return (
      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <header>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Detalles de postulación
          </h1>
        </header>
        {error && (
          <section className="rounded-2xl border border-[var(--border)] bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </section>
        )}
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Volver
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-3xl md:text-4xl font-extrabold">
          {application.offerTitle}
        </h1>
        <p className="text-[var(--muted-ink)] mt-2">
          {application.companyName}
        </p>
      </header>

      {/* Card Principal */}
      <article
        className={[
          "group relative overflow-hidden rounded-2xl border bg-[var(--card)] p-6 shadow-sm transition",
          "hover:shadow-md",
          cardAccent(application.status),
        ].join(" ")}
      >
        {/* Accent lateral */}
        <span
          aria-hidden="true"
          className={[
            "absolute inset-y-0 left-0 w-1",
            (application.status ?? "Pendiente").toLowerCase() === "aceptada" &&
            "bg-green-400",
            (application.status ?? "Pendiente").toLowerCase() === "pendiente" &&
            "bg-yellow-400",
            (application.status ?? "Pendiente").toLowerCase() === "rechazada" &&
            "bg-red-400",
          ]
            .filter(Boolean)
            .join(" ")}
        />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-xl">{application.offerTitle}</h2>
            <p className="text-sm text-[var(--muted-ink)] mt-1">
              {application.companyName}
            </p>
          </div>
          <StatusBadge value={application.status} />
        </div>

        {/* Estado */}
        {application.statusMessage && (
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded text-sm text-blue-900">
            {application.statusMessage}
          </div>
        )}

        {/* Fechas */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-[var(--muted-ink)] font-medium">
              Postulado
            </p>
            <p className="text-sm font-semibold mt-1">
              {toCLDate(application.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-ink)] font-medium">
              Límite
            </p>
            <p className="text-sm font-semibold mt-1">
              {toCLDate(application.applicationDeadline)}
            </p>
          </div>
          {application.endDate && (
            <div>
              <p className="text-xs text-[var(--muted-ink)] font-medium">
                Cierre
              </p>
              <p className="text-sm font-semibold mt-1">
                {toCLDate(application.endDate)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-[var(--muted-ink)] font-medium">
              Remuneración
            </p>
            <p className="text-sm font-semibold mt-1">
              ${application.remuneration.toLocaleString("es-CL")}
            </p>
          </div>
        </div>
      </article>

      {/* Carta de presentación - Editable */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">Tu carta de presentación</h3>
          {/* Only show edit button if status is Pendiente */}
          {!isEditing && application.status?.toLowerCase() === "pendiente" && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Editar
            </button>
          )}
          {application.status?.toLowerCase() !== "pendiente" && !isEditing && (
            <span className="text-xs text-gray-500 italic">
              Solo puedes editar postulaciones pendientes
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedCoverLetter}
              onChange={(e) => setEditedCoverLetter(e.target.value)}
              placeholder="Escribe tu carta de presentación aquí..."
              className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              maxLength={1000}
              disabled={isSaving}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {editedCoverLetter.length}/1000 caracteres
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCoverLetter}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[var(--ink)] leading-relaxed whitespace-pre-wrap">
            {application.coverLetter || "No has agregado una carta de presentación."}
          </p>
        )}
      </section>

      {/* Descripción */}
      {application.description && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="font-bold text-lg mb-3">Descripción</h3>
          <p className="text-[var(--ink)] leading-relaxed whitespace-pre-wrap">
            {application.description}
          </p>
        </section>
      )}

      {/* Requisitos */}
      {application.requirements && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="font-bold text-lg mb-3">Requisitos</h3>
          <p className="text-[var(--ink)] leading-relaxed whitespace-pre-wrap">
            {application.requirements}
          </p>
        </section>
      )}

      {/* Contacto */}
      {application.contactInfo && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="font-bold text-lg mb-3">Información de contacto</h3>
          <p className="text-[var(--ink)]">{application.contactInfo}</p>
        </section>
      )}

      {/* Botón volver */}
      <div className="mt-8">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Volver al historial
        </button>
      </div>
    </main>
  );
}