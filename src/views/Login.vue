<template>
  <div class="login-container">
    <img :src="logoSrc" alt="Logo de CoordiApp" class="logo" />
    <form @submit.prevent="iniciarSesion">
      <input
        v-model="usuario"
        type="text"
        placeholder="Usuario"
        required
      />
      <button type="submit">Iniciar</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/coordi'
import Swal from 'sweetalert2'

const router = useRouter()
const usuario = ref('')
const latitud = ref(null)
const longitud = ref(null)

onMounted(() => {
  // Verificar si ya está autenticado
  const usuario = localStorage.getItem('usuario')
  if (usuario) {
    // Si ya está autenticado, redirigir al menú
    window.location.replace('/menu')
    return
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latitud.value = position.coords.latitude
        longitud.value = position.coords.longitude
        console.log('Latitud:', latitud.value, 'Longitud:', longitud.value)
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          Swal.fire({ icon: 'warning', title: 'Permiso denegado', text: 'Permiso de geolocalización denegado. La aplicación no podrá obtener su ubicación.' })
        } else {
          Swal.fire({ icon: 'error', title: 'Error al obtener la ubicación', text: 'Error al obtener la ubicación: ' + error.message })
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  } else {
    Swal.fire({ icon: 'error', title: 'Geolocalización no soportada', text: 'La geolocalización no es soportada por este navegador.' })
  }
})

// Calcula la ruta del logo usando import.meta.env.BASE_URL
const logoSrc = `${import.meta.env.BASE_URL}icons/icon-192.png`

async function iniciarSesion() {
  if (!usuario.value) {
    Swal.fire({ icon: 'warning', title: 'Error', text: 'Por favor ingresa tu usuario.' })
    return
  }

  // Siempre pedir ubicación en cada intento
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        latitud.value = position.coords.latitude
        longitud.value = position.coords.longitude
        // Si se obtiene la ubicación, continuar con el login
        try {
          const response = await api.get(`/login-coordiapp-vue/iniciar-sesion/${usuario.value}`)

          if (response.data.mensaje === 'Datos Correctos') {
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario))
            router.push('/menu')
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Credenciales incorrectas.' })
          }
        } catch (error) {
          console.error(error)
          if (error.response && error.response.status === 404) {
            Swal.fire({ icon: 'error', title: 'Usuario incorrecto', text: 'El usuario no existe o está inactivo.' })
          } else if (error.response && error.response.status === 403) {
            Swal.fire({ icon: 'error', title: 'Cuenta en uso', text: 'Tu cuenta ya está siendo usada en otro dispositivo.' })
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al conectar con el servidor.' })
          }
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          Swal.fire({ icon: 'warning', title: 'Permiso denegado', text: 'Permiso de geolocalización denegado. La aplicación no podrá obtener su ubicación.' })
        } else {
          Swal.fire({ icon: 'error', title: 'Error al obtener la ubicación', text: 'Error al obtener la ubicación: ' + error.message })
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  } else {
    Swal.fire({ icon: 'error', title: 'Geolocalización no soportada', text: 'La geolocalización no es soportada por este navegador.' })
  }
}
</script>

<style scoped>
:global(html, body) {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-y: auto;
}

.login-container {
  max-width: 400px;
  margin: auto;
  padding: 24px 16px;
  background-color: var(--bg);
  color: var(--fg);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.22);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  height: auto;
  overflow-y: visible;
}

.logo {
  width: 180px;
  margin-bottom: 32px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

input {
  padding: 16px;
  font-size: 1.15rem;
  border: 1.5px solid #999;
  border-radius: 6px;
  background-color: var(--fg);
  color: var(--bg);
  width: 100%;
  max-width: 600px;
  min-width: 320px;
  box-sizing: border-box;
}

button {
  padding: 16px 0;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1.15rem;
  cursor: pointer;
  transition: background 0.3s;
  width: 100%;
  max-width: 600px;
  min-width: 320px;
}

button:hover {
  background-color: #08306b;
}
</style>