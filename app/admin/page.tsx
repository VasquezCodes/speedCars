'use client';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            router.push("/admin/dashboard");
        } else {
            setError("Contraseña incorrecta. Intentá de nuevo.");
        }
        setLoading(false);
    }

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, var(--primary) 0%, #0f3460 100%)",
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                background: "white", borderRadius: "var(--radius-xl)", padding: "48px", width: "100%",
                maxWidth: 420, boxShadow: "var(--shadow-xl)"
            }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, background: "var(--accent)", borderRadius: "var(--radius-md)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                        margin: "0 auto 16px"
                    }}>🔒</div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)", marginBottom: 6 }}>
                        Panel de Administración
                    </h1>
                    <p style={{ color: "var(--gray-500)", fontSize: 14 }}>AutosDealer — Acceso exclusivo</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p style={{ color: "var(--accent)", fontSize: 14, fontWeight: 500, textAlign: "center" }}>{error}</p>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                        {loading ? "Verificando..." : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
