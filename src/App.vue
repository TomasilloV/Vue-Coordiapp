<template>
  <div id="app">
    <!-- Si la ruta es /, no mostramos layout general -->
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Verificar autenticación cada vez que la página se carga
  const checkAuth = () => {
    const usuario = localStorage.getItem('usuario')
    const currentPath = window.location.pathname
    
    // Si no está autenticado y no está en login, redirigir
    if (!usuario && currentPath !== '/login') {
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace('/login')
      return
    }
    
    // Si está autenticado y está en login, redirigir al menú
    if (usuario && currentPath === '/login') {
      window.location.replace('/menu')
      return
    }
  }

  // Verificar inmediatamente
  checkAuth()
  
  // Verificar cada 2 segundos (para detectar cambios en localStorage)
  setInterval(checkAuth, 2000)
  
  // Detectar cuando el usuario usa el botón atrás del navegador
  window.addEventListener('popstate', checkAuth)
  
  // Detectar cuando la página se carga desde caché
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      checkAuth()
    }
  })
  
  // Detectar cuando la página se oculta
  window.addEventListener('pagehide', () => {
    const usuario = localStorage.getItem('usuario')
    if (!usuario) {
      localStorage.clear()
      sessionStorage.clear()
    }
  })
})
</script>

<style>
:root {
  --bg: #ffffff;
  --fg: #121212;
  --primary: #0d47a1;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #121212;
    --fg: #e0e0e0;
    --primary: #90caf9;
  }
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg);
  color: var(--fg);
  font-family: 'Segoe UI', sans-serif;
  transition: background-color 0.3s, color 0.3s;
}

#app {
  min-height: 100vh;
}
</style>