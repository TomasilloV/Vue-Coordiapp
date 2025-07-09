import api from '../api/coordi.js'

/**
 * Función para probar la conexión con la API
 */
export const testApiConnection = async () => {
  try {
    console.log('Probando conexión con la API...')
    
    // Probar conexión básica (GET sin prefijo)
    const response = await api.get('/test-connection')
    
    if (response.data && response.data.status === 'success') {
      console.log('✅ Conexión exitosa con la API')
      return {
        success: true,
        message: 'Conexión exitosa con la API',
        data: response.data
      }
    } else {
      console.log('❌ Respuesta inesperada de la API')
      return {
        success: false,
        message: 'Respuesta inesperada de la API',
        data: response.data
      }
    }
  } catch (error) {
    console.error('❌ Error al conectar con la API:', error)
    
    let errorMessage = 'Error desconocido'
    
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      if (error.response.status === 404) {
        errorMessage = 'Endpoint no encontrado. Verifique que el servidor esté ejecutándose.'
      } else if (error.response.status === 500) {
        errorMessage = 'Error interno del servidor.'
      } else {
        errorMessage = `Error del servidor: ${error.response.status}`
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      errorMessage = 'No se pudo conectar con el servidor. Verifique que Laravel esté ejecutándose en http://127.0.0.1:8000'
    } else {
      // Algo pasó al configurar la petición
      errorMessage = 'Error al configurar la petición.'
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.message
    }
  }
}

/**
 * Función para probar endpoints específicos
 */
export const testSpecificEndpoints = async () => {
  const endpoints = [
    '/orden/test',
    '/registro-pasos/test',
    '/comparativa',
    '/ordenes-completas/1',
    '/ordenes-incompletas/1'
  ]
  
  console.log('🧪 Probando endpoints específicos...')
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Probando: ${endpoint}`)
      const response = await api.get(endpoint)
      console.log(`✅ ${endpoint}: ${response.status}`)
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status || 'Error de red'}`)
    }
  }
}

/**
 * Función para mostrar información de configuración
 */
export const showApiConfig = () => {
  console.log('⚙️ Configuración de la API:')
  console.log('📍 Base URL:', api.defaults.baseURL)
  console.log('⏱️ Timeout:', api.defaults.timeout)
  console.log('📋 Headers:', api.defaults.headers)
} 