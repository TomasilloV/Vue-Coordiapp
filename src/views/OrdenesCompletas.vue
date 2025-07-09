<template>
  <section class="ordenes-completadas">
    <img src="/icons/icon-192.png" alt="Logo CoordiApp" class="logo" />
    <h2 class="titulo">Órdenes Completadas</h2>
    
    <button @click="regresar" class="boton-regresar">← Regresar</button>
    <div v-if="ordenes.length">
      <div class="tabla-wrapper">
        <table class="tabla-completa">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha</th>
              <th>Tecnología</th>
              <th>Ont</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="orden in ordenesPaginadas" :key="orden.Folio_Pisa">
              <td>{{ orden.Folio_Pisa }}</td>
              <td>{{ orden.Fecha_Coordiapp }}</td>
              <td>{{ orden.Tecnologia }}</td>
              <td>{{ orden.Ont }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalPaginas > 1" class="paginacion">
        <button @click="pagina--" :disabled="pagina === 1">Anterior</button>
        <span>Página {{ pagina }} de {{ totalPaginas }}</span>
        <button @click="pagina++" :disabled="pagina === totalPaginas">Siguiente</button>
      </div>
    </div>
    <p v-else class="mensaje-vacio">No hay órdenes completadas.</p>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/coordi'

const router = useRouter()
const ordenes = ref([])
const pagina = ref(1)
const porPagina = 5

const totalPaginas = computed(() =>
  Math.ceil(ordenes.value.length / porPagina)
)

const ordenesPaginadas = computed(() => {
  const inicio = (pagina.value - 1) * porPagina
  return ordenes.value.slice(inicio, inicio + porPagina)
})

onMounted(async () => {
  const tecnico = JSON.parse(localStorage.getItem('usuario'))
  const tecnicoId = tecnico?.idTecnico

  if (!tecnicoId) {
    console.warn('No se encontró el ID del técnico en localStorage.')
    return
  }

  try {
    const response = await api.get(`/coordiapp/completadas-tecnico-vue/${tecnicoId}`)
    ordenes.value = response.data.items || []
    pagina.value = 1
  } catch (error) {
    console.error('Error al obtener órdenes completadas:', error)
  }
})

function regresar() {
  router.back()
}
</script>

<style scoped>
.ordenes-completadas {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
}

.boton-regresar {
  background-color: #a3ca38;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}
.boton-regresar:hover {
  background-color: #8bb02e;
}

.logo {
  width: 80px;
  margin: 0 auto 1rem;
  display: block;
}

.titulo {
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.tabla-wrapper {
  overflow-x: auto;
}

.tabla-completa {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background-color: #2c3e50;
  border: 1px solid #34495e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tabla-completa thead {
  background-color: #a3ca38;
  color: black;
}

.tabla-completa th,
.tabla-completa td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #34495e;
  color: #ecf0f1;
}

.tabla-completa tr:hover {
  background-color: #34495e;
  transition: background-color 0.3s ease;
}

.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.paginacion button {
  background-color: #a3ca38;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
}

.paginacion button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.mensaje-vacio {
  margin-top: 2rem;
  color: #6b7280;
}
</style>