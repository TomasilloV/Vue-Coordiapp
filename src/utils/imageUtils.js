/**
 * Convierte un archivo de imagen a base64
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} - String base64 de la imagen
 */
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Comprime una imagen antes de convertirla a base64
 * @param {File} file - Archivo de imagen
 * @param {number} maxWidth - Ancho máximo en píxeles
 * @param {number} quality - Calidad de compresión (0-1)
 * @returns {Promise<string>} - String base64 de la imagen comprimida
 */
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo la proporción
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      const newWidth = img.width * ratio
      const newHeight = img.height * ratio
      
      canvas.width = newWidth
      canvas.height = newHeight
      
      // Dibujar la imagen redimensionada
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      
      // Convertir a base64 con la calidad especificada
      const base64 = canvas.toDataURL('image/jpeg', quality)
      resolve(base64)
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Valida si un archivo es una imagen válida
 * @param {File} file - Archivo a validar
 * @param {number} maxSize - Tamaño máximo en MB
 * @returns {Object} - Objeto con isValid y message
 */
export const validateImageFile = (file, maxSize = 5) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSizeBytes = maxSize * 1024 * 1024 // Convertir MB a bytes
  
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'Solo se permiten archivos de imagen (JPEG, PNG, WebP)'
    }
  }
  
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      message: `El archivo es demasiado grande. Máximo ${maxSize}MB`
    }
  }
  
  return {
    isValid: true,
    message: 'Archivo válido'
  }
}

/**
 * Crea una URL temporal para previsualizar una imagen
 * @param {File} file - Archivo de imagen
 * @returns {string} - URL temporal
 */
export const createPreviewURL = (file) => {
  return URL.createObjectURL(file)
}

/**
 * Libera una URL temporal creada con createPreviewURL
 * @param {string} url - URL temporal a liberar
 */
export const revokePreviewURL = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
} 