"use client";

import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { sileo } from "sileo";

export default function ContactSection() {
  const phone = process.env.NEXT_PUBLIC_DEALER_PHONE || "5491112345678";
  // Opcional: configurar email
  const email = "ffspeedcarsllc@gmail.com";

  return (
    <section 
      id="contacto" 
      style={{ 
        padding: "80px 0", 
        background: "var(--white)", 
        borderTop: "1px solid var(--gray-200)" 
      }}
    >
      <div className="container">
        
        {/* Título de la sección */}
        <div style={{ marginBottom: "64px", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "var(--font-rb-rational), sans-serif",
            fontSize: "clamp(40px, 6vw, 64px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            marginBottom: "16px"
          }}>
            Habla <span style={{ color: "var(--accent)" }}>con<br />nosotros.</span>
          </h2>
          <p style={{
            color: "var(--text-muted)",
            fontSize: "16px",
            lineHeight: 1.6,
            maxWidth: "500px",
            margin: "0 auto",
            fontFamily: "var(--font-lato), sans-serif"
          }}>
            Estamos listos para asesorarte en la búsqueda de tu próximo vehículo ideal. 
            Envíanos un mensaje y te responderemos a la brevedad.
          </p>
        </div>

        {/* Cajas de contacto usando Grid moderno */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "24px",
          maxWidth: "400px",
          margin: "0 auto"
        }}>
          
          {/* Card Email (Única opción activa) */}
          <div  
            onClick={() => {
              if (navigator?.clipboard) {
                navigator.clipboard.writeText(email);
                sileo.success({ 
                  title: "¡Correo copiado!", 
                  description: "Contacta por gmail o tu app preferida",
                  duration: 3500
                });
              }
            }}
            style={{
              cursor: "pointer",
              padding: "40px",
              background: "var(--gray-50)",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--radius-lg)",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "var(--gray-200)";
            }}
          >
            <div style={{ 
              width: "48px", 
              height: "48px", 
              background: "rgba(255,51,51,0.1)", 
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)"
            }}>
              <Mail size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-rb-rational), sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px"
              }}>
                Escribir
              </h3>
              <p style={{
                color: "var(--text-muted)",
                fontSize: "16px",
                fontFamily: "var(--font-lato), sans-serif"
              }}>
                Vía Correo Electrónico
              </p>
            </div>
          </div>

        </div>
        
        {/* Info extra minimalista abajo */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          marginTop: "48px",
          flexWrap: "wrap",
          padding: "0 20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "14px", letterSpacing: "0.02em" }}>
             <MapPin size={16} strokeWidth={2.5} /> 5047 David Strickland Rd, Ste 137, Fort Worth, TX
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "14px", letterSpacing: "0.02em" }}>
             <Clock size={16} strokeWidth={2.5} /> Lun - Sáb: 9 AM - 6 PM | Dom: 10 AM - 4 PM
          </div>
        </div>

      </div>
    </section>
  );
}
