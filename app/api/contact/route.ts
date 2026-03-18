import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.BREVO_SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_LOGIN,
        pass: process.env.BREVO_SMTP_PASSWORD,
    },
});

const FROM = `"${process.env.BREVO_FROM_NAME || "FF Speed Cars"}" <${process.env.BREVO_FROM_EMAIL}>`;

export async function POST(req: NextRequest) {
    try {
        const { name, email, phone, message } = await req.json();

        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
  <div style="background: #0a0a0a; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; border-bottom: 3px solid #d11119;">
    <h1 style="color: #fff; margin: 0; font-size: 20px; letter-spacing: 0.05em;">📩 NUEVO MENSAJE — FF SPEED CARS</h1>
  </div>
  <div style="background: #fff; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background: #f5f5f5;">
        <td style="padding:10px 12px; color:#555; font-weight:600; width:130px;">Nombre</td>
        <td style="padding:10px 12px;"><b>${name}</b></td>
      </tr>
      <tr>
        <td style="padding:10px 12px; color:#555; font-weight:600;">Email</td>
        <td style="padding:10px 12px;"><a href="mailto:${email}" style="color:#d11119;">${email}</a></td>
      </tr>
      ${phone ? `
      <tr style="background: #f5f5f5;">
        <td style="padding:10px 12px; color:#555; font-weight:600;">Teléfono</td>
        <td style="padding:10px 12px;"><a href="tel:${phone}" style="color:#d11119;">${phone}</a></td>
      </tr>` : ""}
      <tr style="background: #f5f5f5;">
        <td style="padding:10px 12px; color:#555; font-weight:600; vertical-align:top;">Mensaje</td>
        <td style="padding:10px 12px; line-height:1.6;">${message.replace(/\n/g, "<br/>")}</td>
      </tr>
    </table>
    <div style="margin-top: 24px; padding: 14px; background: #fff8f0; border-left: 4px solid #d11119; border-radius: 0 6px 6px 0; font-size: 13px; color: #666;">
      Mensaje recibido desde el formulario de contacto de ffspeedcars.com
    </div>
  </div>
</div>`;

        await transporter.sendMail({
            from: FROM,
            to: process.env.ADMIN_EMAIL,
            replyTo: email,
            subject: `📩 Nuevo mensaje de ${name} — FF Speed Cars`,
            html,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Contact form error:", err);
        return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }
}
