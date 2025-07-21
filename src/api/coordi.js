import axios from 'axios'

const baseURL = 'http://127.0.0.1:8000' // URL de desarrollo local

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 segundos de timeout
  withCredentials: true // <-- Esto es clave para sesiones Laravel
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Agregar ID del técnico si existe
    const idTecnico = localStorage.getItem('idTecnico') || localStorage.getItem('id')
    if (idTecnico && !config.params?.FK_Tecnico_apps) {
      config.params = { ...config.params, FK_Tecnico_apps: idTecnico }
    }
    
    // Configuración específica para tu API Laravel con rutas -vue:
    // GET sin prefijo, POST/PUT/DELETE con prefijo /api
    const method = config.method?.toLowerCase()
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      config.url = `/api${config.url}`
    }
    
    console.log('Request:', config.method?.toUpperCase(), config.url, config.params || config.data)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data)
    
    // Manejar errores específicos
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      // Acceso denegado
      alert('No tiene permisos para realizar esta acción')
    } else if (error.response?.status === 404) {
      // Recurso no encontrado
      console.warn('Recurso no encontrado:', error.config.url)
    } else if (error.response?.status >= 500) {
      // Error del servidor
      alert('Error del servidor. Por favor intente nuevamente más tarde.')
    } else if (!error.response) {
      // Error de red
      alert('Error de conexión. Verifique su conexión a internet.')
    }
    
    return Promise.reject(error)
  }
)

// Función para obtener opciones de ONT para autocomplete
export const getOntOptions = async (idTecnico) => {
  try {
    const response = await api.get('/coordiapp/opciones-vue', {
      params: {
        step: '6',
        idTecnico: idTecnico
      }
    })
    
    // Extraer los números de serie de ONT de la respuesta
    const options = response.data
      ?.map(item => item.Num_Serie_Salida_Det)
      ?.filter(item => item) // Filtrar valores null/undefined
      ?.sort() || []
    
    console.log('Opciones de ONT obtenidas:', options)
    return options
  } catch (error) {
    console.error('Error al obtener opciones de ONT:', error)
    return []
  }
}

export default api