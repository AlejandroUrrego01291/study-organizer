import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail(
    email: string,
    resetToken: string
) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: email,
        subject: "Recupera tu contraseña — Study Organizer",
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Study Organizer</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el botón para crear una nueva contraseña. Este enlace expira en <strong>1 hora</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block; background:#6366f1; color:#fff;
                  padding:12px 24px; border-radius:8px; text-decoration:none;
                  font-weight:bold; margin: 16px 0;">
          Restablecer contraseña
        </a>
        <p style="color:#888; font-size:12px;">
          Si no solicitaste esto, ignora este correo.
        </p>
      </div>
    `,
    })
}