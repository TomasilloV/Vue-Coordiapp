<template>
  <div class="menu">
    <img src="/icons/icon-512.png" alt="Logo .tel" class="logo" />

    <div class="tecnico" v-if="nombreTecnico">
      Bienvenido, {{ nombreTecnico }}
    </div>

    <div class="grid">
      <button class="btn verde" @click="ir('/ordenes-completas')">
        <font-awesome-icon icon="briefcase" />
        <span>Completadas</span>
        <span class="badge" v-if="contador.completadas">{{ contador.completadas }}</span>
      </button>
      <button class="btn naranja" @click="ir('/ordenes-incompletas')">
        <font-awesome-icon icon="exclamation-circle" />
        <span>Incompletas</span>
        <span class="badge" v-if="contador.incompletas">{{ contador.incompletas }}</span>
      </button>
      <button class="btn azul" @click="ir('/comparativo')">
        <font-awesome-icon icon="balance-scale" />
        <span>Produccion</span>
      </button>
      <button class="btn blanco" @click="ir('/nuevo-registro')">
        <font-awesome-icon icon="file-circle-plus" />
        <span>Nueva OS</span>
      </button>
      <button class="btn gris" @click="ir('/inventario')">
        <font-awesome-icon icon="tools" />
        <span>Inventario</span>
        <span class="badge" v-if="contador.inventario">{{ contador.inventario }}</span>
      </button>
      <button class="btn rojo" @click="cerrarSesion">
        <font-awesome-icon icon="power-off" />
        <span>Salir</span>
      </button>
    </div>

    <div class="version">
      v4.0.0
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'
import api from '@/api/coordi'
import Swal from 'sweetalert2'

const router = useRouter()

function ir(ruta) {
  router.push(ruta)
}

async function cerrarSesion() {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: '¿Seguro que quieres cerrar sesión?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  })
  if (result.isConfirmed) {
    try {
      console.log('Iniciando cierre de sesión en el servidor...')
      // Obtener idTecnico del localStorage o del usuario
      const usuario = localStorage.getItem('usuario')
      let idTecnico = null
      if (usuario) {
        try {
          const usuarioData = JSON.parse(usuario)
          idTecnico = usuarioData.idTecnico || localStorage.getItem('idTecnico') || localStorage.getItem('id')
        } catch (e) {
          idTecnico = localStorage.getItem('idTecnico') || localStorage.getItem('id')
        }
      } else {
        idTecnico = localStorage.getItem('idTecnico') || localStorage.getItem('id')
      }
      // Llamar al endpoint de cerrar sesión en el backend, enviando el idTecnico como parámetro
      const response = await api.get('/login-coordiapp-vue/cerrar-sesion', { params: { idTecnico } })
      console.log('Respuesta del servidor:', response.data)
      console.log('Sesión cerrada correctamente en el servidor')
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error)
      console.error('Detalles del error:', error.response?.data)
      // Continuar con el cierre de sesión local aunque falle la llamada al servidor
    }
    // Limpiar completamente el localStorage
    localStorage.clear()
    sessionStorage.clear()
    // Limpiar cualquier cookie que pueda existir
    document.cookie.split(';').forEach(function(c) {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
    // Limpiar el historial del navegador para evitar el botón atrás
    window.history.pushState(null, '', '/login')
    // Forzar la redirección al login con replace para no dejar historial
    window.location.replace('/login')
  }
}

const nombreTecnico = ref('')
const contador = reactive({
  completadas: 0,
  incompletas: 0,
  inventario: 0,
})

onMounted(async () => {
  // Verificar si el usuario está autenticado
  const usuario = localStorage.getItem('usuario')
  if (!usuario) {
    // Si no hay usuario, redirigir al login
    localStorage.clear()
    sessionStorage.clear()
    window.location.replace('/login')
    return
  }

  try {
    const usuarioData = JSON.parse(usuario)

    if (usuarioData) {
      const { Nombre_T, Apellidos_T, idTecnico } = usuarioData
      nombreTecnico.value = `${Nombre_T ?? ''} ${Apellidos_T ?? ''}`.trim().toUpperCase()

      console.log('Debug - ID del técnico:', idTecnico)

      // Obtén las órdenes completadas
      console.log('Debug - Llamando a completadas...')
      const resCompletadas = await api.get(`/coordiapp/completadas-tecnico-vue/${idTecnico}`)
      console.log('Debug - Respuesta completadas:', resCompletadas.data)
      contador.completadas = (resCompletadas.data.items || []).length

      // Obtén las órdenes incompletas
      console.log('Debug - Llamando a incompletas...')
      const resIncompletas = await api.get(`/coordiapp/incompletas-tecnico-vue/${idTecnico}`)
      console.log('Debug - Respuesta incompletas:', resIncompletas.data)
      contador.incompletas = (resIncompletas.data.items || []).length
      
      // Obtén el inventario
      console.log('Debug - Llamando a inventario...')
      const resInventario = await api.get(`/materiales/${idTecnico}`)
      console.log('Debug - Respuesta inventario:', resInventario.data)
      contador.inventario = (resInventario.data.items || []).length

    } else {
      // Si no hay datos válidos, redirigir al login
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace('/login')
    }
  } catch (error) {
    console.error('Debug - Error en MenuPrincipal:', error)
    console.error('Debug - Error response:', error.response?.data)
    
    // Si hay error de autenticación, redirigir al login
    if (error.response?.status === 401) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace('/login')
      return
    }
    
    nombreTecnico.value = 'TÉCNICO'
  }
})
</script>

<style scoped>
.menu {
  background-color: #121212;
  min-height: 100vh;
  padding: 0 20px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.logo {
  width: 140px;
  margin-bottom: 20px;
}

.tecnico {
  font-size: 1.2rem;
  margin-bottom: 32px;
  color: #ecf0f1;
  text-align: center;
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.btn {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 20px;
  height: 130px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  text-align: center;
  transition: transform 0.15s ease-in-out;
  color: #fff;
}

.btn:hover {
  transform: scale(1.04);
}

.btn svg {
  font-size: 1.8rem;
}

.verde    { background-color: #2ecc71; }
.naranja  { background-color: #e67e22; }
.azul     { background-color: #3498db; }
.blanco   { background-color: #ecf0f1; color: #2c3e50; }
.gris     { background-color: #95a5a6; }
.rojo     { background-color: #e74c3c; }

.badge {
  position: absolute;
  top: 6px;
  right: 12px;
  background-color: red;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 4px 7px;
  border-radius: 999px;
}

.version {
  margin-top: 36px;
  font-size: 0.8rem;
  color: #bdc3c7;
  font-weight: 500;
}
</style>