import { google } from 'googleapis';
import { logger } from '../lib/logger.js';

// Configurar autenticación con Application Default Credentials
const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    // No necesitas especificar credenciales - usa las del entorno Cloud Run
});

// Crear cliente Gmail con impersonation para enviar como usuario específico
const getGmailClient = async () => {
    const authClient = await auth.getClient();

    // Configurar subject (usuario a impersonar) para Domain-Wide Delegation
    authClient.subject = process.env.GMAIL_SENDER_EMAIL;

    return google.gmail({ version: 'v1', auth: authClient });
};

const buildEmailTemplate = (data) => {
    return `
<div style="background: linear-gradient(135deg, #00A651, #003DA5); padding: 20px; text-align: center;">
  <h1 style="color: white; margin: 0;">Bancamía</h1>
</div>

<div style="padding: 30px; font-family: Arial, sans-serif; color: #333;">
  <h2>¡Hola ${data.nombreCompleto}!</h2>
  <p>Hemos recibido exitosamente tu solicitud de autorización de datos.</p>
  
  <h3>Resumen de tu solicitud:</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td><strong>Nombre:</strong></td><td>${data.nombreCompleto}</td></tr>
    <tr><td><strong>Documento:</strong></td><td>${data.tipoDocumento} ${data.numeroDocumento}</td></tr>
    <tr><td><strong>Ciudad:</strong></td><td>${data.ciudadNegocio}</td></tr>
    <tr><td><strong>Dirección:</strong></td><td>${data.direccionNegocio}</td></tr>
    <tr><td><strong>Celular:</strong></td><td>${data.celularNegocio}</td></tr>
  </table>
  
  <h3>Próximos Pasos:</h3>
  <ul>
    <li>Revisaremos tu información en las próximas 24-48 horas</li>
    <li>Te contactaremos al celular registrado</li>
    <li>Prepara tu documentación adicional</li>
  </ul>
  
  <p>Si tienes preguntas, contáctanos en: <a href="mailto:servicio@bancamia.com.co">servicio@bancamia.com.co</a></p>
</div>

<div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
  <p>© 2026 Bancamía - Todos los derechos reservados</p>
  <p>Este es un correo automático, por favor no responder.</p>
</div>
  `;
};

const buildPlainTextEmail = (data) => {
    return `Confirmación de Autorización de Datos - Bancamía
¡Hola ${data.nombreCompleto}!
Hemos recibido exitosamente tu solicitud de autorización de datos.
RESUMEN DE TU SOLICITUD:
- Nombre: ${data.nombreCompleto}
- Documento: ${data.tipoDocumento} ${data.numeroDocumento}
- Ciudad: ${data.ciudadNegocio}
- Dirección: ${data.direccionNegocio}
- Celular: ${data.celularNegocio}
PRÓXIMOS PASOS:
- Revisaremos tu información en las próximas 24-48 horas
- Te contactaremos al celular registrado
- Prepara tu documentación adicional
Si tienes preguntas, contáctanos en: servicio@bancamia.com.co
---
© 2026 Bancamía - Todos los derechos reservados
Este es un correo automático, por favor no responder.`;
};

export const sendConfirmationEmail = async (solicitudData) => {
    try {
        const gmail = await getGmailClient();

        // Construct email
        const subject = 'Confirmación de Solicitud - Bancamía';
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
            `From: ${process.env.GMAIL_SENDER_NAME} <${process.env.GMAIL_SENDER_EMAIL}>`,
            `To: ${solicitudData.email}`,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            'Content-Type: multipart/alternative; boundary="boundary_string"',
            '',
            '--boundary_string',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            buildPlainTextEmail(solicitudData),
            '',
            '--boundary_string',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            buildEmailTemplate(solicitudData),
            '',
            '--boundary_string--'
        ];

        const message = messageParts.join('\n');
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        logger.info('Email de confirmación enviado', { email: solicitudData.email });
    } catch (error) {
        logger.error('Error enviando email', { error: error.message, stack: error.stack });
        throw error;
    }
};
