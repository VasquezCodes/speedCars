"use client";

import { useState } from "react";
import { Plus, Minus, AlertCircle } from "lucide-react";

const FAQ_DATA = [
  {
    q: "¿Qué tipo de vehículos venden?",
    a: "Ofrecemos una variedad de vehículos usados en excelentes condiciones, incluyendo sedanes, SUVs, camionetas y vehículos familiares. Nuestro inventario cambia constantemente para ofrecer las mejores opciones a nuestros clientes."
  },
  {
    q: "¿Los vehículos están revisados antes de venderse?",
    a: "Sí. Todos nuestros vehículos pasan por una revisión para asegurarnos de que estén en buenas condiciones antes de ser ofrecidos a la venta."
  },
  {
    q: "¿Ofrecen financiamiento?",
    a: "Próximamente estaremos ofreciendo opciones de financiamiento para brindar más facilidades a nuestros clientes."
  },
  {
    q: "¿Puedo hacer un test drive antes de comprar el vehículo?",
    a: "Sí. Recomendamos que nuestros clientes prueben el vehículo antes de comprarlo para asegurarse de que sea la opción ideal."
  },
  {
    q: "¿Qué documentos necesito para comprar un vehículo?",
    a: "Identificación válida."
  },
  {
    q: "¿Puedo reservar un vehículo?",
    a: "Sí. En algunos casos puedes reservar el vehículo con un depósito mientras completas el proceso de compra."
  },
  {
    q: "¿Cuánto tiempo toma el proceso de compra?",
    a: "En muchos casos podemos completar el proceso el mismo día, dependiendo del método de pago."
  },
  {
    q: "¿Cómo puedo ver los vehículos disponibles?",
    a: "Puedes visitarnos en nuestro local o ver nuestro inventario en nuestras redes sociales, donde publicamos constantemente nuevos vehículos disponibles."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" style={{ padding: "120px 0", background: "var(--white)", borderTop: "1px solid var(--gray-200)" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <h2 style={{
            fontFamily: "var(--font-rb-rational), sans-serif",
            fontSize: "clamp(40px, 5vw, 56px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textTransform: "uppercase"
          }}>
            Preguntas Frecuentes
          </h2>
          <div style={{ width: 40, height: 4, background: "var(--accent)", margin: "24px auto 0" }}></div>
        </div>

        <div style={{ borderTop: "1px solid var(--gray-300)" }}>
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} style={{ borderBottom: "1px solid var(--gray-300)" }}>
                <button
                  onClick={() => toggle(index)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "32px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--text-primary)"
                  }}
                >
                  <span style={{ 
                    fontSize: "20px", 
                    fontWeight: isOpen ? 800 : 500, 
                    transition: "font-weight 0.2s ease",
                    letterSpacing: "-0.01em"
                  }}>
                    {item.q}
                  </span>
                  <div style={{
                    color: isOpen ? "var(--accent)" : "var(--gray-500)",
                    transition: "all 0.3s ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
                  }}>
                    {isOpen ? <Minus size={24} strokeWidth={1.5} /> : <Plus size={24} strokeWidth={1.5} />}
                  </div>
                </button>
                <div style={{
                  maxHeight: isOpen ? "200px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  opacity: isOpen ? 1 : 0
                }}>
                  <p style={{
                    paddingBottom: "32px",
                    color: "var(--text-muted)",
                    fontSize: "16px",
                    lineHeight: 1.7,
                    margin: 0
                  }}>
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Información Importante */}
        <div style={{ 
          marginTop: "80px", 
          padding: "32px", 
          background: "var(--gray-100)", 
          borderRadius: "8px",
          borderLeft: "4px solid var(--accent)"
        }}>
          <h3 style={{ 
            fontSize: "16px", 
            fontWeight: 800, 
            textTransform: "uppercase", 
            letterSpacing: "0.05em",
            color: "var(--text-primary)",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <AlertCircle size={20} color="var(--accent)" />
            Información Importante
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
            Todos nuestros vehículos se venden tal como están (“as is”) y no ofrecemos garantía. Recomendamos a los clientes revisar el vehículo y realizar cualquier inspección que consideren necesaria antes de completar la compra.
          </p>
        </div>

      </div>
    </section>
  );
}
