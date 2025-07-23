// Interceptar todas las peticiones para modo offline
const allEndpoints = [
  '/coordiapp/opciones-vue',
  '/test-opciones',
  '/registro-pasos-vue',
  '/orden-vue',
  '/probar-conexion',
  '/actualizar-vue',
  '/registro-pasos',
  '/registro-pasos-vue',
  '/registro-paso',
  '/registro',
  '/queja',
  '/ont-cobre'
]

// Guardar peticiones POST en cola si está offline
function queueRequest(config) {
  const queue = JSON.parse(localStorage.getItem('requestQueue') || '[]')
  queue.push({
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.headers,
    time: Date.now()
  })
  localStorage.setItem('requestQueue', JSON.stringify(queue))
}

axios.interceptors.request.use(config => {
  // Interceptar todos los endpoints definidos
  if (allEndpoints.some(e => config.url.includes(e))) {
    if (config.method === 'get') {
      if (!navigator.onLine) {
        const cacheKey = 'cache_' + config.url + JSON.stringify(config.params || {})
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          return Promise.reject({
            config,
            response: { data: JSON.parse(cached), offline: true }
          })
        }
      }
    } else if (config.method === 'post') {
      if (!navigator.onLine) {
        // Guardar en cola y simular respuesta exitosa offline
        queueRequest(config)
        return Promise.reject({
          config,
          response: { data: { success: true, offline: true, queued: true }, offline: true }
        })
      }
    }
  }
  return config
})

axios.interceptors.response.use(response => {
  const { config } = response
  if (config.method === 'get' && allEndpoints.some(e => config.url.includes(e)) && response.data) {
    const cacheKey = 'cache_' + config.url + JSON.stringify(config.params || {})
    localStorage.setItem(cacheKey, JSON.stringify(response.data))
  }
  return response
}, error => {
  if (error.response && error.response.offline) {
    return Promise.resolve(error.response)
  }
  return Promise.reject(error)
})

// Sincronizar peticiones POST en cola cuando vuelva el internet
async function syncQueuedRequests() {
  const queue = JSON.parse(localStorage.getItem('requestQueue') || '[]')
  if (queue.length === 0) return
  for (const req of queue) {
    try {
      await axios({
        url: req.url,
        method: req.method,
        data: req.data,
        headers: req.headers
      })
    } catch (e) {
      console.log('Error al sincronizar petición:', req, e)
      // Si falla, dejar en la cola
      continue
    }
  }
  // Limpiar cola si todas se enviaron
  localStorage.setItem('requestQueue', '[]')
  console.log('Peticiones sincronizadas con el servidor')
}

window.addEventListener('online', () => {
  console.log('Conexión restaurada')
  syncQueuedRequests()
})
// Interceptar peticiones GET de catálogo y datos para cachear y usar offline
import axios from 'axios'

const cacheableEndpoints = [
  '/coordiapp/opciones-vue',
  '/test-opciones',
  '/registro-pasos-vue',
  '/orden-vue',
  '/probar-conexion'
]

axios.interceptors.request.use(config => {
  // Solo interceptar GET y endpoints cacheables
  if (config.method === 'get' && cacheableEndpoints.some(e => config.url.includes(e))) {
    if (!navigator.onLine) {
      // Buscar en localStorage
      const cacheKey = 'cache_' + config.url + JSON.stringify(config.params || {})
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        // Simular respuesta offline
        return Promise.reject({
          config,
          response: { data: JSON.parse(cached), offline: true }
        })
      }
    }
  }
  return config
})

axios.interceptors.response.use(response => {
  // Cachear solo si es GET y endpoint cacheable y hay datos
  const { config } = response
  if (config.method === 'get' && cacheableEndpoints.some(e => config.url.includes(e)) && response.data) {
    const cacheKey = 'cache_' + config.url + JSON.stringify(config.params || {})
    localStorage.setItem(cacheKey, JSON.stringify(response.data))
  }
  return response
}, error => {
  // Si es error simulado offline, devolver la respuesta cacheada
  if (error.response && error.response.offline) {
    return Promise.resolve(error.response)
  }
  return Promise.reject(error)
})
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import FontAwesomeIcon from './plugins/fontawesome'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

// Registrar el service worker de la PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker registrado con éxito:', registration)
    }).catch(error => {
      console.log('Error al registrar el Service Worker:', error)
    })
  })
}
// Detectar si está offline y usar la sesión guardada
function checkOfflineSession() {
  const usuario = localStorage.getItem('usuario')
  if (!navigator.onLine && usuario) {
    console.log('Modo offline: usando sesión guardada')
    // Puedes mostrar un mensaje o redirigir al menú principal
    // window.location.replace('/menu')
  }
}

window.addEventListener('load', checkOfflineSession)
window.addEventListener('online', () => {
  console.log('Conexión restaurada')
})
window.addEventListener('offline', checkOfflineSession)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount('#app')