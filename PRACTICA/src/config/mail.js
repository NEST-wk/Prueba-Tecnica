import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail', // O usa 'smtp' para otro servicio
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password o token
    },
});
