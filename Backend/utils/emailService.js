// utils/emailService.js
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com'
  port: process.env.EMAIL_PORT, // e.g., 587
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER, // Tu correo electrónico
    pass: process.env.EMAIL_PASS, // Tu contraseña o token de aplicación
  },
});

// Configurar opciones de Handlebars
const handlebarOptions = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: path.resolve('./templates/emails/'),
    layoutsDir: path.resolve('./templates/emails/'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./templates/emails/'),
  extName: '.hbs',
};

// Adjuntar el plugin de Handlebars al transporter
transporter.use('compile', hbs(handlebarOptions));

export const sendEmail = async (options) => {
  const mailOptions = {
    from: `"Fedes Cloud" <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    template: options.template, // Nombre del archivo de plantilla (sin extensión)
    context: options.context, // Contexto para la plantilla
  };

  await transporter.sendMail(mailOptions);
};
