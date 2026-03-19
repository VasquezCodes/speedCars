"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SellerNotFound() {
  const [debug, setDebug] = useState("");

  useEffect(() => {
    const info = [
      `Fecha: ${new Date().toLocaleString("es-AR")}`,
      `URL: ${window.location.href}`,
      `Referrer: ${document.referrer || "ninguno"}`,
      `Cookies: ${navigator.cookieEnabled ? "sí" : "no"}`,
      `Sesión: ${document.cookie.includes("seller_session") ? "tiene cookie" : "sin cookie"}`,
      `Navegador: ${navigator.userAgent}`,
    ].join("\n");
    setDebug(info);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <p style={{ fontSize: 48, fontWeight: 800, color: "rgba(255,255,255,0.1)", marginBottom: 8 }}>404</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
          Página no encontrada
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>
          La ruta del portal de vendedores no existe o no está disponible.
        </p>
        <Link
          href="/seller"
          style={{
            display: "inline-block", padding: "12px 24px", borderRadius: 10,
            background: "#e11d1d", color: "#fff", fontSize: 14, fontWeight: 700,
            textDecoration: "none", marginBottom: 32,
          }}
        >
          Ir al login
        </Link>

        {debug && (
          <div style={{
            marginTop: 32, padding: 16, borderRadius: 10,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            textAlign: "left",
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Info de diagnóstico — enviá una captura de esto al administrador
            </p>
            <pre style={{
              fontSize: 12, color: "rgba(255,255,255,0.5)", whiteSpace: "pre-wrap",
              wordBreak: "break-all", fontFamily: "monospace", lineHeight: 1.6, margin: 0,
            }}>
              {debug}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
