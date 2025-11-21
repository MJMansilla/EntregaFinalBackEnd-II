const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendPasswordReset(to, resetLink) {
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject: "Restablecer contraseña",
    html: `<p>Has solicitado restablecer tu contraseña. Haz click en el botón para continuar:</p>
    <p><a href="${resetLink}" style="display:inline-block;padding:10px 20px;border-radius:6px;text-decoration:none;background:#1a73e8;color:#fff">Restablecer contraseña</a></p>
    <p>El enlace expirará en 1 hora.</p>`,
  });
  return info;
}

module.exports = { sendPasswordReset };
