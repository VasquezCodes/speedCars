"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2Icon, ChevronLeft, ChevronRight } from "lucide-react";
import { sileo } from "sileo";

import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/hooks/useAppointments";
import type { AppointmentFormData } from "@/types/appointment";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const appointmentSchema = z.object({
  date: z.date({
    required_error: "Seleccioná una fecha",
    invalid_type_error: "Fecha inválida",
  }),
  time: z.string().min(1, "Seleccioná un horario disponible"),
  name: z.string().min(2, "Ingresá tu nombre completo"),
  phone: z
    .string()
    .min(7, "Ingresá un número válido")
    .regex(/^[0-9\s\-\+\(\)]+$/, "Solo números y +()-"),
  email: z.string().email("Email inválido"),
  notes: z.string().max(300).optional(),
});

type AppointmentFormSchema = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  referrerId?: string;
  vehicleId?: string;
  vehicleName?: string;
  onSuccess?: () => void;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
  .apt-grid {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    min-height: 600px;
    border-radius: 16px;
    overflow: hidden;
    font-family: var(--font-lato), sans-serif;
  }

  /* ── Left panel ── */
  .apt-left {
    background: #0d0d0d;
    padding: 48px 44px 44px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .apt-left::before {
    content: '';
    position: absolute;
    top: -120px; right: -120px;
    width: 340px; height: 340px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(209,17,25,0.18) 0%, transparent 70%);
    pointer-events: none;
  }

  .apt-eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #d11119;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .apt-eyebrow::before {
    content: '';
    display: block;
    width: 20px; height: 1.5px;
    background: #d11119;
  }

  .apt-headline {
    font-family: var(--font-rb-rational), sans-serif;
    font-size: clamp(46px, 5.5vw, 76px);
    font-weight: 700;
    line-height: 0.88;
    text-transform: uppercase;
    color: #ffffff;
    letter-spacing: -0.015em;
    margin-bottom: 36px;
  }
  .apt-headline span { color: #d11119; }

  .apt-step-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .apt-step-label::after {
    content: '';
    flex: 1; height: 1px;
    background: rgba(255,255,255,0.08);
  }

  .apt-cal-wrap {
    --color-primary: #d11119;
    --color-primary-foreground: #ffffff;
    --color-accent: rgba(255,255,255,0.07);
    --color-accent-foreground: #ffffff;
    --color-muted-foreground: rgba(255,255,255,0.28);
    --color-background: transparent;
    --color-foreground: #ffffff;
    --color-border: rgba(255,255,255,0.1);
    flex: 0 0 auto;
    color: rgba(255,255,255,0.85);
  }
  .apt-cal-wrap [data-slot="calendar"] {
    background: transparent;
    color: rgba(255,255,255,0.85);
  }
  .apt-cal-wrap button { color: rgba(255,255,255,0.85); }
  .apt-cal-wrap .text-muted-foreground { color: rgba(255,255,255,0.25) !important; }
  .apt-cal-wrap [class*="weekday"], .apt-cal-wrap th { color: rgba(255,255,255,0.35) !important; }
  .apt-cal-wrap [data-selected-single="true"] { background: #d11119 !important; color: #ffffff !important; }
  .apt-cal-wrap [data-today="true"]:not([data-selected-single="true"]) button {
    border: 1px solid rgba(209,17,25,0.5); border-radius: 4px;
  }

  .apt-time-section { margin-top: 20px; flex: 1; }

  .apt-time-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px;
  }

  .apt-slot {
    display: flex; align-items: center; justify-content: center;
    padding: 11px 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, transform 0.1s;
    animation: aptFadeUp 0.3s ease both;
    font-family: 'Courier New', monospace;
    font-size: 13px; letter-spacing: 0.06em;
    color: rgba(255,255,255,0.85);
    border-radius: 4px;
  }
  .apt-slot:hover:not(:disabled) {
    border-color: rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.07);
    transform: translateY(-1px);
  }
  .apt-slot.apt-slot--selected { border-color: #d11119; background: #d11119; color: #fff; font-weight: 700; }
  .apt-slot.apt-slot--booked { opacity: 0.22; cursor: not-allowed; text-decoration: line-through; pointer-events: none; }

  .apt-no-date {
    font-size: 13px; color: rgba(255,255,255,0.25);
    text-align: center; padding: 20px 0; letter-spacing: 0.04em;
    border: 1px dashed rgba(255,255,255,0.1); border-radius: 6px;
  }

  .apt-loading-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
  .apt-slot-skel {
    height: 42px; border-radius: 4px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%);
    background-size: 200% 100%;
    animation: aptShimmer 1.4s infinite;
  }

  /* ── Right panel ── */
  .apt-right {
    background: #ffffff;
    padding: 48px 44px 44px;
    display: flex; flex-direction: column;
    border-left: 1px solid #f0f0f0;
  }

  .apt-right-step-label {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: #888; margin-bottom: 28px;
    display: flex; align-items: center; gap: 10px;
  }
  .apt-right-step-label::after { content: ''; flex: 1; height: 1px; background: #f0f0f0; }

  .apt-field { position: relative; margin-bottom: 26px; }
  .apt-field-label {
    display: block; font-size: 10px; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: #666; margin-bottom: 8px; transition: color 0.2s;
  }
  .apt-field:focus-within .apt-field-label { color: #d11119; }

  .apt-input {
    display: block; width: 100%;
    border: none; border-bottom: 1.5px solid #e8e8e8;
    padding: 8px 0 10px; font-size: 15px;
    font-family: var(--font-lato), sans-serif;
    color: #0a0a0a; background: transparent;
    outline: none; transition: border-color 0.2s; border-radius: 0;
  }
  .apt-input:focus { border-bottom-color: #d11119; }
  .apt-input::placeholder { color: #d0d0d0; font-size: 14px; }
  .apt-textarea { resize: none; font-family: var(--font-lato), sans-serif; line-height: 1.6; padding-top: 6px; }
  .apt-field-error { font-size: 11px; color: #e53e3e; margin-top: 5px; letter-spacing: 0.02em; }

  .apt-summary {
    border-left: 2px solid #d11119; padding: 12px 16px;
    background: #fafafa; margin-bottom: 20px;
    animation: aptFadeUp 0.25s ease; border-radius: 0 4px 4px 0;
  }
  .apt-summary-label { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #d11119; margin-bottom: 4px; }
  .apt-summary-value { font-size: 14px; color: #0a0a0a; font-weight: 600; }

  .apt-submit {
    width: 100%; padding: 17px 32px;
    background: #0d0d0d; color: #fff; border: none;
    font-family: var(--font-lato), sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 0.15em;
    text-transform: uppercase; cursor: pointer;
    transition: background 0.2s, transform 0.1s; border-radius: 2px;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    margin-top: auto;
  }
  .apt-submit:not(:disabled):hover { background: #d11119; transform: translateY(-1px); }
  .apt-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .apt-footer-note { font-size: 11px; color: #bbb; text-align: center; margin-top: 14px; letter-spacing: 0.03em; }

  @keyframes aptFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes aptShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── Hide mobile wizard on desktop ── */
  .apt-mobile-wizard { display: none; }

  /* ═══════════════════════════════════════════════════
     MOBILE WIZARD
  ═══════════════════════════════════════════════════ */
  @media (max-width: 768px) {
    .apt-grid { display: none !important; }
    .apt-mobile-wizard {
      display: flex; flex-direction: column;
      font-family: var(--font-lato), sans-serif;
    }

    /* Sticky header */
    .apt-mwiz-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px 12px;
      border-bottom-width: 1px; border-bottom-style: solid;
      position: sticky; top: 0; z-index: 10;
    }
    .apt-mwiz-back {
      display: flex; align-items: center; gap: 3px;
      background: none; border: none; cursor: pointer;
      font-size: 14px; font-weight: 600;
      padding: 4px 0; font-family: var(--font-lato), sans-serif;
    }
    .apt-mwiz-back:disabled { opacity: 0.25; cursor: default; }
    .apt-mwiz-steps { display: flex; align-items: center; gap: 5px; }
    .apt-mwiz-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      transition: background 0.2s, width 0.2s;
    }
    .apt-mwiz-dot.active { background: #d11119; width: 20px; border-radius: 4px; }
    .apt-mwiz-dot.light { background: #e0e0e0; }
    .apt-mwiz-dot.light.active { background: #d11119; }
    .apt-mwiz-close {
      background: none; border: none; cursor: pointer;
      font-size: 20px; line-height: 1; padding: 4px;
    }

    /* Body */
    .apt-mwiz-body { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }

    /* Step 1 — dark calendar */
    .apt-mwiz-step1 {
      background: #0d0d0d;
      padding: 28px 20px 8px;
      position: relative; overflow: hidden;
    }
    .apt-mwiz-step1::before {
      content: ''; position: absolute;
      top: -80px; right: -80px;
      width: 220px; height: 220px; border-radius: 50%;
      background: radial-gradient(circle, rgba(209,17,25,0.22) 0%, transparent 70%);
      pointer-events: none;
    }
    .apt-mwiz-title {
      font-family: var(--font-rb-rational), sans-serif;
      font-size: 40px; font-weight: 700;
      line-height: 0.9; text-transform: uppercase;
      color: #fff; letter-spacing: -0.01em;
      margin-bottom: 20px;
    }
    .apt-mwiz-title span { color: #d11119; }

    /* Step 2 — dark timeslots */
    .apt-mwiz-step2 {
      background: #0d0d0d;
      padding: 20px 20px 24px;
    }
    .apt-mwiz-date-pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 9px 14px;
      background: rgba(209,17,25,0.1);
      border: 1px solid rgba(209,17,25,0.3);
      border-radius: 100px;
      color: rgba(255,255,255,0.9);
      font-size: 14px; font-weight: 600;
      margin-bottom: 20px;
    }
    .apt-mwiz-step2 .apt-time-grid { gap: 10px; }
    .apt-mwiz-step2 .apt-slot { padding: 15px 8px; font-size: 14px; border-radius: 8px; }

    /* Step 3 — white form */
    .apt-mwiz-step3 { background: #fff; padding: 24px 20px 16px; }
    .apt-mwiz-booking-card {
      border-left: 3px solid #d11119;
      padding: 12px 16px;
      background: #fafafa;
      border-radius: 0 10px 10px 0;
      margin-bottom: 24px;
    }
    .apt-mwiz-booking-card-label {
      font-size: 9px; font-weight: 700;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: #d11119; margin-bottom: 3px;
    }
    .apt-mwiz-booking-card-value { font-size: 15px; font-weight: 700; color: #111; }

    /* Sticky footer */
    .apt-mwiz-footer {
      padding: 14px 18px;
      border-top-width: 1px; border-top-style: solid;
      position: sticky; bottom: 0;
    }
    .apt-mwiz-footer-dark { background: #0d0d0d; border-top-color: rgba(255,255,255,0.06); }
    .apt-mwiz-footer-light { background: #fff; border-top-color: #f0f0f0; }

    .apt-mwiz-btn {
      width: 100%; height: 52px; border-radius: 999px; border: none;
      font-family: var(--font-lato), sans-serif;
      font-size: 15px; font-weight: 700; letter-spacing: 0.05em;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: opacity 0.2s;
    }
    .apt-mwiz-btn:disabled { opacity: 0.32; cursor: not-allowed; }
    .apt-mwiz-btn-white { background: #fff; color: #0d0d0d; }
    .apt-mwiz-btn-dark  { background: #0d0d0d; color: #fff; }
    .apt-mwiz-btn-red   { background: #d11119; color: #fff; }

    .apt-mwiz-note {
      text-align: center; font-size: 11px;
      margin-top: 8px; letter-spacing: 0.02em;
    }
    .apt-mwiz-note-dark  { color: rgba(255,255,255,0.22); }
    .apt-mwiz-note-light { color: #bbb; }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export function AppointmentForm({ referrerId, vehicleId, vehicleName, onSuccess }: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mobileStep, setMobileStep] = React.useState<1 | 2 | 3>(1);
  const { slots, isLoadingSlots, fetchSlots, createAppointment } = useAppointments();

  const form = useForm<AppointmentFormSchema>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { name: "", phone: "", email: "", notes: "" },
  });

  const selectedDate = form.watch("date");
  const selectedTime = form.watch("time");

  React.useEffect(() => {
    if (!selectedDate) return;
    form.setValue("time", "");
    fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots, form]);

  const onSubmit = async (values: AppointmentFormSchema): Promise<void> => {
    setIsSubmitting(true);
    try {
      const payload: AppointmentFormData = {
        date: values.date,
        time: values.time,
        name: values.name,
        phone: values.phone,
        email: values.email,
        notes: values.notes,
      };
      await createAppointment(payload, referrerId, vehicleId, vehicleName);
      onSuccess?.();
      sileo.success({
        title: "¡Turno confirmado!",
        description: `Tu visita quedó agendada para el ${format(values.date, "EEEE d 'de' MMMM", { locale: es })} a las ${values.time} hs.`,
      });
      form.reset();
      setMobileStep(1);
    } catch {
      sileo.error({
        title: "Error al agendar",
        description: "No pudimos registrar tu turno. Intentá de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = startOfDay(new Date());
  const now = new Date();
  const calendarStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const calendarEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const formattedDate = selectedDate ? format(selectedDate, "EEE d 'de' MMM", { locale: es }) : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>

          {/* ══════════════ DESKTOP 2-column ══════════════ */}
          <div className="apt-grid">
            <div className="apt-left">
              <p className="apt-eyebrow">Agendar visita</p>
              <h2 className="apt-headline">Reserva<br />tu <span>turno</span></h2>

              <div className="apt-step-label">01 — Seleccioná el día</div>
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="apt-cal-wrap">
                      <Calendar mode="single" locale={es} selected={field.value} onSelect={field.onChange}
                        disabled={(date) => isBefore(startOfDay(date), today)}
                        showOutsideDays={false} startMonth={calendarStart} endMonth={calendarEnd} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs mt-1" />
                </FormItem>
              )} />

              <div className="apt-time-section">
                <div className="apt-step-label">02 — Seleccioná el horario</div>
                <FormField control={form.control} name="time" render={({ field }) => (
                  <FormItem><FormControl><div>
                    {!selectedDate ? <p className="apt-no-date">Elegí una fecha para ver los horarios</p>
                      : isLoadingSlots ? (
                        <div className="apt-loading-grid">
                          {Array.from({ length: 9 }).map((_, i) => <div key={i} className="apt-slot-skel" style={{ animationDelay: `${i * 80}ms` }} />)}
                        </div>
                      ) : (
                        <div className="apt-time-grid">
                          {slots.map((slot, i) => (
                            <button key={slot.time} type="button" disabled={slot.isBooked}
                              onClick={() => field.onChange(slot.time)}
                              className={cn("apt-slot", slot.isBooked && "apt-slot--booked", field.value === slot.time && "apt-slot--selected")}
                              style={{ animationDelay: `${i * 45}ms` }}>
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      )}
                  </div></FormControl>
                    <FormMessage className="text-red-400 text-xs mt-2" />
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="apt-right">
              <div className="apt-right-step-label">03 — Tus datos</div>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="apt-field"><label className="apt-field-label">Nombre completo</label>
                  <FormControl><input className="apt-input" placeholder="Juan García" autoComplete="name" {...field} /></FormControl>
                  <FormMessage className="apt-field-error" /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem className="apt-field"><label className="apt-field-label">Teléfono / WhatsApp</label>
                  <FormControl><input className="apt-input" type="tel" placeholder="+54 9 11 1234-5678" autoComplete="tel" {...field} /></FormControl>
                  <FormMessage className="apt-field-error" /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="apt-field"><label className="apt-field-label">Email</label>
                  <FormControl><input className="apt-input" type="email" placeholder="juan@email.com" autoComplete="email" {...field} /></FormControl>
                  <FormMessage className="apt-field-error" /></FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem className="apt-field">
                  <label className="apt-field-label">Comentarios <span style={{ fontWeight: 400, opacity: 0.6 }}>(opcional)</span></label>
                  <FormControl><textarea className="apt-input apt-textarea" rows={3} placeholder="¿Algún modelo de interés? ¿Auto para parte de pago?" {...field} /></FormControl>
                  <FormMessage className="apt-field-error" /></FormItem>
              )} />
              {selectedDate && selectedTime && (
                <div className="apt-summary">
                  <p className="apt-summary-label">Turno seleccionado</p>
                  <p className="apt-summary-value">
                    {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    <span style={{ color: "#d11119", margin: "0 6px" }}>·</span>
                    {selectedTime} hs
                  </p>
                </div>
              )}
              <button type="submit" disabled={isSubmitting} className="apt-submit">
                {isSubmitting ? <><Loader2Icon size={16} className="animate-spin" />Agendando…</> : "Confirmar turno"}
              </button>
              <p className="apt-footer-note">Sin cargo ni compromiso · Confirmación por email</p>
            </div>
          </div>

          {/* ══════════════ MOBILE WIZARD ══════════════ */}
          <div className="apt-mobile-wizard">

            {/* ── Header ── */}
            <div
              className="apt-mwiz-header"
              style={{
                background: mobileStep === 3 ? "#fff" : "#0d0d0d",
                borderBottomColor: mobileStep === 3 ? "#f0f0f0" : "rgba(255,255,255,0.06)",
              }}
            >
              <button
                type="button"
                className="apt-mwiz-back"
                style={{ color: mobileStep === 3 ? "#111" : "rgba(255,255,255,0.75)" }}
                disabled={mobileStep === 1}
                onClick={() => setMobileStep(s => (s - 1) as 1 | 2 | 3)}
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
                Volver
              </button>

              <div className="apt-mwiz-steps">
                {[1, 2, 3].map(s => (
                  <div
                    key={s}
                    className={`apt-mwiz-dot${mobileStep === s ? " active" : ""}${mobileStep === 3 ? " light" : ""}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="apt-mwiz-close"
                style={{ color: mobileStep === 3 ? "#999" : "rgba(255,255,255,0.4)" }}
                onClick={onSuccess}
              >✕</button>
            </div>

            {/* ── Body ── */}
            <div className="apt-mwiz-body">

              {/* STEP 1 — Date */}
              {mobileStep === 1 && (
                <div className="apt-mwiz-step1">
                  <p className="apt-eyebrow" style={{ marginBottom: 8 }}>Agendar visita</p>
                  <div className="apt-mwiz-title">Reserva<br />tu <span>turno</span></div>
                  <div className="apt-step-label" style={{ marginBottom: 6 }}>01 — Seleccioná el día</div>
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormControl>
                      <div className="apt-cal-wrap">
                        <Calendar mode="single" locale={es} selected={field.value} onSelect={field.onChange}
                          disabled={(date) => isBefore(startOfDay(date), today)}
                          showOutsideDays={false} startMonth={calendarStart} endMonth={calendarEnd} />
                      </div>
                    </FormControl></FormItem>
                  )} />
                </div>
              )}

              {/* STEP 2 — Time */}
              {mobileStep === 2 && (
                <div className="apt-mwiz-step2">
                  <div className="apt-step-label" style={{ marginBottom: 14 }}>02 — Seleccioná el horario</div>
                  {formattedDate && (
                    <div className="apt-mwiz-date-pill">
                      <span style={{ fontSize: 16 }}>📅</span>
                      {formattedDate}
                    </div>
                  )}
                  <FormField control={form.control} name="time" render={({ field }) => (
                    <FormItem><FormControl><div>
                      {isLoadingSlots ? (
                        <div className="apt-loading-grid">
                          {Array.from({ length: 9 }).map((_, i) => <div key={i} className="apt-slot-skel" style={{ animationDelay: `${i * 80}ms` }} />)}
                        </div>
                      ) : (
                        <div className="apt-time-grid">
                          {slots.map((slot, i) => (
                            <button key={slot.time} type="button" disabled={slot.isBooked}
                              onClick={() => field.onChange(slot.time)}
                              className={cn("apt-slot", slot.isBooked && "apt-slot--booked", field.value === slot.time && "apt-slot--selected")}
                              style={{ animationDelay: `${i * 45}ms` }}>
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div></FormControl>
                      <FormMessage className="text-red-400 text-xs mt-2" />
                    </FormItem>
                  )} />
                </div>
              )}

              {/* STEP 3 — Details */}
              {mobileStep === 3 && (
                <div className="apt-mwiz-step3">
                  <div className="apt-right-step-label" style={{ marginBottom: 16 }}>03 — Tus datos</div>
                  {selectedDate && selectedTime && (
                    <div className="apt-mwiz-booking-card">
                      <div className="apt-mwiz-booking-card-label">Tu turno</div>
                      <div className="apt-mwiz-booking-card-value">
                        {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                        <span style={{ color: "#d11119", margin: "0 5px" }}>·</span>
                        {selectedTime} hs
                      </div>
                    </div>
                  )}
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="apt-field"><label className="apt-field-label">Nombre completo</label>
                      <FormControl><input className="apt-input" placeholder="Juan García" autoComplete="name" {...field} /></FormControl>
                      <FormMessage className="apt-field-error" /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem className="apt-field"><label className="apt-field-label">Teléfono / WhatsApp</label>
                      <FormControl><input className="apt-input" type="tel" placeholder="+54 9 11 1234-5678" autoComplete="tel" {...field} /></FormControl>
                      <FormMessage className="apt-field-error" /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem className="apt-field"><label className="apt-field-label">Email</label>
                      <FormControl><input className="apt-input" type="email" placeholder="juan@email.com" autoComplete="email" {...field} /></FormControl>
                      <FormMessage className="apt-field-error" /></FormItem>
                  )} />
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem className="apt-field">
                      <label className="apt-field-label">Comentarios <span style={{ fontWeight: 400, opacity: 0.6 }}>(opcional)</span></label>
                      <FormControl><textarea className="apt-input apt-textarea" rows={3} placeholder="¿Algún modelo de interés?" {...field} /></FormControl>
                      <FormMessage className="apt-field-error" /></FormItem>
                  )} />
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            {mobileStep === 1 && (
              <div className="apt-mwiz-footer apt-mwiz-footer-dark">
                <button type="button" className="apt-mwiz-btn apt-mwiz-btn-white" disabled={!selectedDate}
                  onClick={() => setMobileStep(2)}>
                  Siguiente <ChevronRight size={18} strokeWidth={2.5} />
                </button>
                <p className="apt-mwiz-note apt-mwiz-note-dark">
                  {selectedDate ? `${formattedDate} seleccionado` : "Elegí una fecha para continuar"}
                </p>
              </div>
            )}

            {mobileStep === 2 && (
              <div className="apt-mwiz-footer apt-mwiz-footer-dark">
                <button type="button" className="apt-mwiz-btn apt-mwiz-btn-white" disabled={!selectedTime}
                  onClick={() => setMobileStep(3)}>
                  Siguiente <ChevronRight size={18} strokeWidth={2.5} />
                </button>
                <p className="apt-mwiz-note apt-mwiz-note-dark">
                  {selectedTime ? `${selectedTime} hs seleccionado` : "Elegí un horario para continuar"}
                </p>
              </div>
            )}

            {mobileStep === 3 && (
              <div className="apt-mwiz-footer apt-mwiz-footer-light">
                <button type="submit" disabled={isSubmitting} className="apt-mwiz-btn apt-mwiz-btn-dark">
                  {isSubmitting ? <><Loader2Icon size={16} className="animate-spin" />Agendando…</> : "Confirmar turno"}
                </button>
                <p className="apt-mwiz-note apt-mwiz-note-light">Sin cargo ni compromiso · Confirmación por email</p>
              </div>
            )}

          </div>
        </form>
      </Form>
    </>
  );
}
