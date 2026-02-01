"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "src/services/Service";
import { Mail } from "lucide-react";

type BuySellDetail = {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  price: number;
  location?: string | null;
  publicationDate: string; // ISO
  additionalContactEmail?: string | null;
  additionalContactPhoneNumber?: string | null;
  userName: string;
  userEmail?: string | null;
  userPhoneNumber?: string | null;
  firstImageUrl?: string | null;
};

function toCLDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(+d) ? "—" : d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BuySellDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<BuySellDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<{ data?: BuySellDetail }>(`/publications/buysells/${id}`);
        const d = (res.data?.data ?? res.data) as BuySellDetail;
        if (mounted) setData(d);
      } catch (e: any) {
        setErr("No se pudo cargar la publicación.");
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">Cargando…</main>;
  if (err || !data) return <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">{err ?? "No encontrada."}</main>;

  const imgSrc = data.firstImageUrl || "/generic22.png";

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">

      <button
        onClick={() => window.history.back()}
        className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:bg-slate-100 transition"
      >
        ← Volver
      </button>
      
      {/* Título + vendedor */}
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{data.title}</h1>
        <p className="mt-2 text-[var(--muted-ink)] flex items-center gap-2">
          <span>🧑‍💼</span>
          <span className="truncate">Oferente: <b className="text-[var(--ink)]">{data.userName}</b></span>
        </p>
      </header>

      {/* Grid principal: Galería + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Galería + descripción */}
        <section className="lg:col-span-8 space-y-6">
          {/* Imagen principal grande */}
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <img
              src={imgSrc}
              alt={data.title}
              className="w-full aspect-[16/10] object-cover"
            />
          </div>

          {/* Descripción */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="border-b border-[var(--border)] px-5 py-3">
              <h2 className="font-semibold">Descripción</h2>
            </div>
            <div className="p-5">
              {data.description ? (
                <p className="whitespace-pre-wrap leading-7 text-[17px]">{data.description}</p>
              ) : (
                <p className="text-[var(--muted-ink)]">Sin descripción.</p>
              )}
            </div>
          </div>
        </section>

        {/* Sidebar: precio/datos/contacto */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Precio + meta */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            {data.category && (
              <span className="inline-flex items-center rounded-full bg-[var(--chip)] px-3 py-1 text-xs font-medium text-[var(--ink)]/80 mb-3">
                {data.category}
              </span>
            )}

            <div className="text-sm text-[var(--muted-ink)]">Precio</div>
            <div className="text-3xl font-extrabold mt-1">
              {data.price.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}
            </div>

            <ul className="mt-4 space-y-2 text-[var(--ink)]/90">
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span><b>Ubicación:</b> {data.location || "—"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🗓️</span>
                <span><b>Publicado:</b> {toCLDate(data.publicationDate)}</span>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <h3 className="font-semibold mb-2">Contacto</h3>

            {(data.additionalContactEmail || data.additionalContactPhoneNumber) ? (
              <div className="space-y-3">
                {data.additionalContactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0 text-green-700" />
                    <a 
                      href={`mailto:${data.additionalContactEmail}`} 
                      className="underline break-all flex-1 text-sm"
                    >
                      {data.additionalContactEmail}
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(data.additionalContactEmail!);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1800);
                        } catch {}
                      }}
                      className="rounded-lg border border-green-300 bg-white/70 px-3 py-1 text-xs hover:bg-white transition flex-shrink-0"
                    >
                      {copied ? "✓" : "Copiar"}
                    </button>
                  </div>
                )}
                
                {data.additionalContactPhoneNumber && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a 
                      href={`tel:${data.additionalContactPhoneNumber.replace(/\s/g, "")}`} 
                      className="underline break-all flex-1 text-sm"
                    >
                      {data.additionalContactPhoneNumber}
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(data.additionalContactPhoneNumber!);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1800);
                        } catch {}
                      }}
                      className="rounded-lg border border-green-300 bg-white/70 px-3 py-1 text-xs hover:bg-white transition flex-shrink-0"
                    >
                      {copied ? "✓" : "Copiar"}
                    </button>
                  </div>
                )}

                <p className="mt-2 text-xs text-green-800/80">
                  {data.additionalContactEmail && "Toca el email para abrir tu cliente de correo. "}
                  {data.additionalContactPhoneNumber && "Toca el teléfono para llamar."}
                </p>
              </div>
            ) : (
              <p className="text-[var(--muted-ink)]">El oferente no ha proporcionado información de contacto adicional.</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
