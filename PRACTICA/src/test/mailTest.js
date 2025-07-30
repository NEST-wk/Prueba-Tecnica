
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { transporter } from '../config/mail.js';

async function sendTestEmail() {
    try {
        const info = await transporter.sendMail({
            from: `"Test API" <${process.env.EMAIL_USER}>`,
            to: "devamimod@gmail.com",
            subject: "✅ Prueba de correo",
            text: "Este es un correo de prueba desde la API Node.js"
        });

        console.log("📧 Enviado:", info.messageId);
    } catch (err) {
        console.error("❌ Error al enviar:", err.message);
    }
}

sendTestEmail();
