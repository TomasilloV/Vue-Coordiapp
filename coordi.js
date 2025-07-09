import axios from 'axios'

const baseURL = import.meta.env.PROD
  ? 'https://api.ed-intra.com'
  : '/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000,
  withCredentials: true // <-- Esto es clave para sesiones Laravel
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    const method = config.method?.toLowerCase()
    if (['post', 'put', 'delete', 'patch'].includes(method) && 
        !config.url.startsWith('/api')) {
      config.url = `/api${config.url}`
    }
    
    console.log('Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Función que estás intentando importar
export const getOntOptions = async () => {
  try {
    const response = await api.get('/ont-options') // o la ruta que corresponda
    return response.data
  } catch (error) {
    console.error('Error obteniendo opciones ONT:', error)
    throw error
  }
}

export default api