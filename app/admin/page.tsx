'use client';

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { app } from "@/lib/firebase/client";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const auth = getAuth(app);

    useEffect(() => {
        // Redirigir si ya hay un usuario logueado en cliente (aunque
        // dependemos de la cookie para proteger las rutas de la API)
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const idToken = await user.getIdToken();
                // Opcional: Validar aquí de nuevo, pero por ahora solo redirigimos
                // router.push("/admin/dashboard");
            }
        });
        return () => unsubscribe();
    }, [auth, router]);

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Iniciar sesión con Firebase Auth (Cliente)
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Obtener el ID Token seguro
            const idToken = await user.getIdToken();

            // 3. Enviar el ID Token a nuestra ruta de API para crear la Session Cookie
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            if (res.ok) {
                window.location.href = "/admin/dashboard";
            } else {
                const data = await res.json();
                setError(data.error || "Error al iniciar sesión.");
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
                setError("Correo o contraseña incorrectos.");
            } else {
                setError("Ocurrió un error inesperado al iniciar sesión.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "#111", /* Sleek dark background */
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                background: "white", borderRadius: "16px", padding: "48px", width: "100%",
                maxWidth: 400, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                        <Image
                            src="/logoLightMode.jpeg"
                            alt="AutosDealer"
                            width={160}
                            height={45}
                            style={{ objectFit: "contain" }}
                            priority
                        />
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", letterSpacing: "-0.02em", marginBottom: 6 }}>
                        Acceso Administrativo
                    </h1>
                    <p style={{ color: "#666", fontSize: 14 }}>Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="form-group">
                        <label className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="admin@speedcars.com"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                            required
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
