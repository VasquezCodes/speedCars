import nodemailer from "nodemailer";

export interface AppointmentEmailData {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
    vehicleName?: string;
    sellerName?: string;
    sellerEmail?: string;
}

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.BREVO_SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_LOGIN,
        pass: process.env.BREVO_SMTP_PASSWORD,
    },
});

const FROM = `"${process.env.BREVO_FROM_NAME || "AutosDealer"}" <${process.env.BREVO_FROM_EMAIL}>`;

export interface LeadData {
    name: string;
    phone: string;
    email?: string;
    message?: string;
    vehicleSlug?: string;
    vehicleName?: string;
    sellerCode?: string;
    sellerName?: string;
    sellerEmail?: string;
    vehiclesViewed?: string[];
}

export async function sendAdminNotification(lead: LeadData) {
    const viewedList =
        lead.vehiclesViewed && lead.vehiclesViewed.length > 0
            ? `<ul style="margin:8px 0; padding-left:20px;">${lead.vehiclesViewed.map((v) => `<li>${v}</li>`).join("")}</ul>`
            : "<p style='color:#888'>Ninguno registrado</p>";

    const sellerSection = lead.sellerName
        ? `<tr><td style="padding:8px; color:#555; font-weight:600;">Referido por:</td><td style="padding:8px;">${lead.sellerName} (código: <b>${lead.sellerCode}</b>)</td></tr>`
        : `<tr><td style="padding:8px; color:#555; font-weight:600;">Referido por:</td><td style="padding:8px;">Sin referido (contacto directo)</td></tr>`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
      <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">🚗 Nuevo Lead — AutosDealer</h1>
      </div>
      <div style="background: #fff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
        <h2 style="color: #1a1a2e; font-size: 16px; margin: 0 0 16px;">Datos del Cliente</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f5f5f5;">
            <td style="padding:8px; color:#555; font-weight:600;">Nombre:</td>
            <td style="padding:8px;"><b>${lead.name}</b></td>
          </tr>
          <tr>
            <td style="padding:8px; color:#555; font-weight:600;">Teléfono:</td>
            <td style="padding:8px;"><a href="https://wa.me/${lead.phone.replace(/\D/g, "")}" style="color: #25D366;">📱 ${lead.phone}</a></td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding:8px; color:#555; font-weight:600;">Email:</td>
            <td style="padding:8px;">${lead.email || "No indicado"}</td>
          </tr>
          <tr>
            <td style="padding:8px; color:#555; font-weight:600;">Vehículo de interés:</td>
            <td style="padding:8px;">${lead.vehicleName || "No especificado"}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding:8px; color:#555; font-weight:600;">Mensaje:</td>
            <td style="padding:8px;">${lead.message || "Sin mensaje"}</td>
          </tr>
          ${sellerSection}
        </table>
        <h3 style="color: #1a1a2e; font-size: 14px; margin: 20px 0 8px;">Vehículos Vistos Antes de Contactar</h3>
        ${viewedList}
        <div style="margin-top: 24px; padding: 12px; background: #f0f4ff; border-radius: 6px; font-size: 13px; color: #666;">
          Este email fue generado automáticamente por el sistema de AutosDealer.
        </div>
      </div>
    </div>
  `;

    await transporter.sendMail({
        from: FROM,
        to: process.env.ADMIN_EMAIL,
        subject: `🚗 Nuevo lead: ${lead.name} — ${lead.vehicleName || "Consulta general"}`,
        html,
    });
}

export async function sendSellerNotification(lead: LeadData) {
    if (!lead.sellerEmail || !lead.sellerName) return;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
      <div style="background: #16213e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">🎉 ¡Tu cliente hizo una consulta!</h1>
      </div>
      <div style="background: #fff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="font-size: 16px; color: #333;">Hola <b>${lead.sellerName}</b>,</p>
        <p style="color: #555;">Un cliente que llegó a través de tu enlace acaba de enviar una consulta oficial:</p>
        <div style="background: #f0f4ff; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
          <p style="margin:4px 0;"><b>👤 Nombre:</b> ${lead.name}</p>
          <p style="margin:4px 0;"><b>📱 Teléfono:</b> <a href="https://wa.me/${lead.phone.replace(/\D/g, "")}" style="color:#25D366;">${lead.phone}</a></p>
          <p style="margin:4px 0;"><b>🚗 Vehículo:</b> ${lead.vehicleName || "Consulta general"}</p>
          ${lead.message ? `<p style="margin:4px 0;"><b>💬 Mensaje:</b> ${lead.message}</p>` : ""}
        </div>
        <p style="color: #555; font-size: 14px;">Comunícate con tu cliente lo antes posible para concretar la venta. 🚀</p>
      </div>
    </div>
  `;

    await transporter.sendMail({
        from: FROM,
        to: lead.sellerEmail,
        subject: `🎉 Tu cliente ${lead.name} hizo una consulta — ${lead.vehicleName || "Consulta general"}`,
        html,
    });
}

export async function sendAppointmentClientConfirmation(data: AppointmentEmailData): Promise<void> {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
      <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">✅ ¡Tu turno está confirmado!</h1>
      </div>
      <div style="background: #fff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="font-size: 16px; color: #333;">Hola <b>${data.clientName}</b>,</p>
        <p style="color: #555;">Tu visita ha sido agendada con éxito. Te esperamos en nuestro local.</p>
        <div style="background: #f0f4ff; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
          <p style="margin:4px 0;"><b>📅 Fecha:</b> ${data.appointmentDate}</p>
          <p style="margin:4px 0;"><b>🕐 Hora:</b> ${data.appointmentTime} hs</p>
          ${data.vehicleName ? `<p style="margin:4px 0;"><b>🚗 Vehículo de interés:</b> ${data.vehicleName}</p>` : ""}
          ${data.notes ? `<p style="margin:4px 0;"><b>📝 Notas:</b> ${data.notes}</p>` : ""}
        </div>
        <p style="color: #555; font-size: 14px;">Si necesitas cambiar o cancelar tu turno, comunícate con nosotros.</p>
      </div>
    </div>
  `;

    await transporter.sendMail({
        from: FROM,
        to: data.clientEmail,
        subject: `✅ Turno confirmado — ${data.appointmentDate} a las ${data.appointmentTime} hs`,
        html,
    });
}

export async function sendAppointmentManagementNotification(data: AppointmentEmailData): Promise<void> {
    const sellerSection = data.sellerName
        ? `<tr style="background: #f5f5f5;"><td style="padding:8px; color:#555; font-weight:600;">Referido por:</td><td style="padding:8px;">${data.sellerName}</td></tr>`
        : `<tr style="background: #f5f5f5;"><td style="padding:8px; color:#555; font-weight:600;">Referido por:</td><td style="padding:8px;">Sin referido (contacto directo)</td></tr>`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
      <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">📅 Nuevo turno agendado</h1>
      </div>
      <div style="background: #fff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
        <h2 style="color: #1a1a2e; font-size: 16px; margin: 0 0 16px;">Datos del Turno</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding:8px; color:#555; font-weight:600;">Fecha:</td>
            <td style="padding:8px;"><b>${data.appointmentDate}</b></td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding:8px; color:#555; font-weight:600;">Hora:</td>
            <td style="padding:8px;"><b>${data.appointmentTime} hs</b></td>
          </tr>
          <tr>
            <td style="padding:8px; color:#555; font-weight:600;">Cliente:</td>
            <td style="padding:8px;">${data.clientName}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding:8px; color:#555; font-weight:600;">Teléfono:</td>
            <td style="padding:8px;"><a href="https://wa.me/${data.clientPhone.replace(/\D/g, "")}" style="color: #25D366;">📱 ${data.clientPhone}</a></td>
          </tr>
          <tr>
            <td style="padding:8px; color:#555; font-weight:600;">Email:</td>
            <td style="padding:8px;">${data.clientEmail}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding:8px; color:#555; font-weight:600;">Vehículo de interés:</td>
            <td style="padding:8px;">${data.vehicleName || "No especificado"}</td>
          </tr>
          <tr>
            <td style="padding:8px; color:#555; font-weight:600;">Notas:</td>
            <td style="padding:8px;">${data.notes || "Sin notas"}</td>
          </tr>
          ${sellerSection}
        </table>
        <div style="margin-top: 24px; padding: 12px; background: #f0f4ff; border-radius: 6px; font-size: 13px; color: #666;">
          Este email fue generado automáticamente por el sistema de FF Speed Cars.
        </div>
      </div>
    </div>
  `;

    const mailOptions: Parameters<typeof transporter.sendMail>[0] = {
        from: FROM,
        to: process.env.ADMIN_EMAIL,
        subject: `📅 Nuevo turno: ${data.clientName} — ${data.appointmentDate} ${data.appointmentTime} hs`,
        html,
    };

    if (data.sellerEmail) {
        mailOptions.cc = data.sellerEmail;
    }

    await transporter.sendMail(mailOptions);
}

export async function sendAppointmentCancellation(data: AppointmentEmailData): Promise<void> {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
      <div style="background: #7f1d1d; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">❌ Tu turno fue cancelado</h1>
      </div>
      <div style="background: #fff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="font-size: 16px; color: #333;">Hola <b>${data.clientName}</b>,</p>
        <p style="color: #555;">Lamentamos informarte que tu turno agendado ha sido cancelado.</p>
        <div style="background: #fff5f5; border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
          <p style="margin:4px 0;"><b>📅 Fecha:</b> ${data.appointmentDate}</p>
          <p style="margin:4px 0;"><b>🕐 Hora:</b> ${data.appointmentTime} hs</p>
          ${data.vehicleName ? `<p style="margin:4px 0;"><b>🚗 Vehículo:</b> ${data.vehicleName}</p>` : ""}
        </div>
        <p style="color: #555;">Si deseas reagendar tu visita, no dudes en contactarnos. Estaremos encantados de encontrar un nuevo horario para vos.</p>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">Disculpá los inconvenientes causados.</p>
      </div>
    </div>
  `;

    await transporter.sendMail({
        from: FROM,
        to: data.clientEmail,
        subject: `❌ Turno cancelado — ${data.appointmentDate} a las ${data.appointmentTime} hs`,
        html,
    });
}

export async function sendAppointmentCompleted(data: AppointmentEmailData): Promise<void> {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
      <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">🙌 ¡Gracias por visitarnos!</h1>
      </div>
      <div style="background: #fff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="font-size: 16px; color: #333;">Hola <b>${data.clientName}</b>,</p>
        <p style="color: #555;">Fue un placer recibirte en nuestro local. Esperamos que la visita haya sido de tu agrado${data.vehicleName ? ` y que hayas encontrado todo lo que buscabas en el <b>${data.vehicleName}</b>` : ""}.</p>
        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
          <p style="margin:0; color: #15803d; font-weight: 600;">¡Te esperamos pronto de vuelta! 🚗</p>
        </div>
        <p style="color: #555; font-size: 14px;">Si tenés alguna pregunta sobre el vehículo o querés coordinar una nueva visita, no dudes en contactarnos. Estamos para ayudarte en todo lo que necesites.</p>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">El equipo de FF Speed Cars</p>
      </div>
    </div>
  `;

    await transporter.sendMail({
        from: FROM,
        to: data.clientEmail,
        subject: `🙌 ¡Gracias por visitarnos, ${data.clientName}! Te esperamos pronto`,
        html,
    });
}
