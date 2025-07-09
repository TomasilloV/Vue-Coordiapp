import { createRouter, createWebHistory } from 'vue-router'

// Función para verificar si el usuario está autenticado
const isAutenticado = () => {
  const usuario = localStorage.getItem('usuario')
  return usuario !== null
}

const routes = [
  {
    path: '/',
    redirect: () => (isAutenticado() ? '/menu' : '/login')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/menu',
    name: 'MenuPrincipal',
    component: () => import('@/views/MenuPrincipal.vue')
  },
  {
    path: '/ordenes-completas',
    name: 'OrdenesCompletas',
    component: () => import('@/views/OrdenesCompletas.vue')
  },
  {
    path: '/ordenes-incompletas',
    name: 'OrdenesIncompletas',
    component: () => import('@/views/OrdenesIncompletas.vue')
  },
  {
    path: '/comparativo',
    name: 'Comparativo',
    component: () => import('@/views/Comparativo.vue')
  },
  {
    path: '/nuevo-registro',
    name: 'NuevoRegistro',
    component: () => import('@/views/NuevoRegistro.vue')
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: () => import('@/views/Inventario.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/menu'
  },
  {
    path: '/debug',
    name: 'DebugView',
    component: () => import('@/views/DebugView.vue')
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guardia global básico para proteger rutas
router.beforeEach((to, from, next) => {
  // Si la ruta no es login y no está autenticado, redirigir a login
  if (to.path !== '/login' && !isAutenticado()) {
    localStorage.clear()
    sessionStorage.clear()
    // Usar replace para no dejar historial
    window.location.replace('/login')
    return
  }
  
  // Si está en login y ya está autenticado, redirigir a menu
  if (to.path === '/login' && isAutenticado()) {
    window.location.replace('/menu')
    return
  }
  
  next()
})

export default router