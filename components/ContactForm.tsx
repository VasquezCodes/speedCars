'use client';

import { useState, FormEvent } from "react";

interface ContactFormProps {
    vehicleSlug?: string;
    vehicleName?: string;
    onClose?: () => void;
}

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

function getViewedVehicles(): string[] {
    if (typeof sessionStorage === "undefined") return [];
    try {
        return JSON.parse(sessionStorage.getItem("viewedVehicles") || "[]");
    } catch {
        return [];
    }
}

export default function ContactForm({ vehicleSlug, vehicleName, onClose }: ContactFormProps) {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const fd = new FormData(e.currentTarget);
        const sellerCode = getCookie("referral");
        const vehiclesViewed = getViewedVehicles();

        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fd.get("name"),
                    phone: fd.get("phone"),
                    email: fd.get("email") || undefined,
                    message: fd.get("message") || undefined,
                    vehicleSlug: vehicleSlug || undefined,
                    vehicleName: vehicleName || undefined,
                    sellerCode: sellerCode || undefined,
                    vehiclesViewed,
                }),
            });

            if (!res.ok) throw new Error("Error al enviar");
            setSent(true);
        } catch {
            setError("Hubo un error al enviar. Intentá de nuevo.");
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>¡Consulta enviada!</h3>
                <p style={{ color: "var(--gray-500)", marginBottom: 24 }}>
                    Nos vamos a comunicar con vos a la brevedad. También podés escribirnos directamente por WhatsApp.
                </p>
                {onClose && (
                    <button className="btn btn-dark" onClick={onClose}>Cerrar</button>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {vehicleName && (
                <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: "12px 16px", borderLeft: "4px solid var(--accent)" }}>
                    <p style={{ fontSize: 13, color: "var(--gray-500)" }}>Consultando sobre:</p>
                    <p style={{ fontWeight: 600, color: "var(--primary)" }}>{vehicleName}</p>
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Nombre completo *</label>
                <input name="name" required placeholder="Ej: Juan Pérez" className="form-input" />
            </div>

            <div className="form-group">
                <label className="form-label">Teléfono / WhatsApp *</label>
                <input name="phone" required placeholder="Ej: 11 5555-5555" className="form-input" type="tel" />
            </div>

            <div className="form-group">
                <label className="form-label">Email (opcional)</label>
                <input name="email" placeholder="tu@email.com" className="form-input" type="email" />
            </div>

            <div className="form-group">
                <label className="form-label">Mensaje (opcional)</label>
                <textarea name="message" placeholder="¿Qué información necesitás?" className="form-input form-textarea" />
            </div>

            {error && (
                <p style={{ color: "var(--accent)", fontSize: 14, fontWeight: 500 }}>{error}</p>
            )}

            <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={loading}
            >
                {loading ? "Enviando..." : "📩 Enviar consulta"}
            </button>

            <p style={{ fontSize: 12, color: "var(--gray-400)", textAlign: "center" }}>
                Tu información es confidencial y no será compartida con terceros.
            </p>
        </form>
    );
}
