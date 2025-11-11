/**
 * Utilidades de validación y seguridad
 */

/**
 * Valida formato de email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida fortaleza de contraseña
 * Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
 */
export const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  if (password.length < 8) {
    return false;
  }
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Sanitiza string para prevenir inyección
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Oculta parte de un token para logging seguro
 */
export const maskToken = (token) => {
  if (!token || typeof token !== 'string' || token.length < 10) {
    return '***';
  }
  const start = token.substring(0, 4);
  const end = token.substring(token.length - 4);
  return `${start}...${end}`;
};

/**
 * Valida que un UID tenga formato válido de Firebase
 */
export const isValidFirebaseUid = (uid) => {
  if (!uid || typeof uid !== 'string') {
    return false;
  }
  // Firebase UIDs suelen tener entre 20 y 128 caracteres
  return uid.length >= 20 && uid.length <= 128;
};

export default {
  isValidEmail,
  isValidPassword,
  sanitizeString,
  maskToken,
  isValidFirebaseUid
};

