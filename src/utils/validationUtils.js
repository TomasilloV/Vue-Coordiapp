/**
 * Valida un número de teléfono mexicano
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} - true si es válido
 */
export const validateMexicanPhone = (phone) => {
  // Formato: 10 dígitos, puede empezar con 55, 56, 33, etc.
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Valida un código postal mexicano
 * @param {string} postalCode - Código postal a validar
 * @returns {boolean} - true si es válido
 */
export const validateMexicanPostalCode = (postalCode) => {
  // Formato: 5 dígitos
  const postalCodeRegex = /^[0-9]{5}$/
  return postalCodeRegex.test(postalCode.replace(/\s/g, ''))
}

/**
 * Valida un folio PISA
 * @param {string} folio - Folio PISA a validar
 * @returns {boolean} - true si es válido
 */
export const validatePisaFolio = (folio) => {
  // Formato: al menos 5 caracteres alfanuméricos
  const folioRegex = /^[a-zA-Z0-9]{5,}$/
  return folioRegex.test(folio)
}

/**
 * Valida coordenadas GPS
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} - true si son válidas
 */
export const validateCoordinates = (lat, lng) => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/**
 * Valida que un campo no esté vacío
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima
 * @returns {boolean} - true si es válido
 */
export const validateRequired = (value, minLength = 1) => {
  return value && value.toString().trim().length >= minLength
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida un número entero positivo
 * @param {string|number} value - Valor a validar
 * @returns {boolean} - true si es válido
 */
export const validatePositiveInteger = (value) => {
  const num = parseInt(value)
  return !isNaN(num) && num > 0
}

/**
 * Valida un número decimal positivo
 * @param {string|number} value - Valor a validar
 * @returns {boolean} - true si es válido
 */
export const validatePositiveDecimal = (value) => {
  const num = parseFloat(value)
  return !isNaN(num) && num > 0
}

/**
 * Formatea un número de teléfono para mostrar
 * @param {string} phone - Número de teléfono
 * @returns {string} - Número formateado
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

/**
 * Formatea un código postal para mostrar
 * @param {string} postalCode - Código postal
 * @returns {string} - Código postal formateado
 */
export const formatPostalCode = (postalCode) => {
  const cleaned = postalCode.replace(/\D/g, '')
  if (cleaned.length === 5) {
    return cleaned
  }
  return postalCode
} 