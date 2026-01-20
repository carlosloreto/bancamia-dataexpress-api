import * as emailService from '../src/services/email.service.js';
import dotenv from 'dotenv';
dotenv.config();

const testData = {
    email: 'tu-email-de-prueba@gmail.com', // CAMBIAR ESTO
    nombreCompleto: 'Juan Pérez Test',
    tipoDocumento: 'CC',
    numeroDocumento: '123456789',
    ciudadNegocio: 'Bogotá',
    direccionNegocio: 'Calle 123 #45-67',
    celularNegocio: '3001234567'
};

console.log('Intentando enviar email a:', testData.email);
console.log('Remitente:', process.env.GMAIL_SENDER_EMAIL);

emailService.sendConfirmationEmail(testData)
    .then(() => console.log('✅ Email enviado exitosamente'))
    .catch(error => {
        console.error('❌ Error:', error.message);
        if (error.message.includes('invalid_grant')) {
            console.error('TIP: Asegúrate de ejecutar "gcloud auth application-default login" si estás probando localmente.');
        }
    });
