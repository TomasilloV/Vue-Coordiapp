<template>
  <section class="ordenes-completadas">
    <img src="/icons/icon-192.png" alt="Logo CoordiApp" class="logo" />
    <h2 class="titulo">Órdenes Incompletas</h2>
    <button @click="regresar" class="boton-regresar">← Regresar</button>
    <div v-if="ordenes.length">
      <div class="tabla-wrapper" ref="tablaWrapperRef">
        <table class="tabla-completa" ref="tablaRef">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Teléfono</th>
              <th>Fecha</th>
              <th>Ultimo Paso</th>
              <th class="accion-columna">Acción</th>
              <th class="dummy-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(orden, index) in ordenesPaginadas" :key="`${orden.Folio_Pisa}-${pagina}-${index}`">
              <td>{{ orden.Folio_Pisa }}</td>
              <td>{{ orden.Telefono || 'N/A' }}</td>
              <td>{{ orden.Fecha_Coordiapp }}</td>
              <td>{{ orden.Step_Registro }}</td>
              <td class="accion-columna">
                <button 
                  @click="terminarOrden(orden.Folio_Pisa)" 
                  class="boton-terminar"
                  :disabled="procesando"
                >
                  {{ procesando ? 'Procesando...' : 'Terminar' }}
                </button>
              </td>
              <td class="dummy-col"></td>
            </tr>
          </tbody>
        </table>

        <!-- Overlay flotante solo en móvil -->
        <div class="accion-overlay" v-if="mostrarOverlay" :style="overlayStyle">
          <div v-for="(orden, index) in ordenesPaginadas" :key="`overlay-${orden.Folio_Pisa}-${pagina}-${index}`" class="overlay-boton" :style="getOverlayBtnStyle(index)">
            <button 
              @click="terminarOrden(orden.Folio_Pisa)" 
              class="boton-terminar"
              :disabled="procesando"
            >
              {{ procesando ? '...' : 'Terminar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de pruebas hardcodeada -->
      <div class="tabla-pruebas-container">
        <h3>Tabla de Pruebas</h3>
        <table class="tabla-pruebas">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Teléfono</th>
              <th>Tipo de Tarea</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1029384756</td>
              <td>9284019248</td>
              <td>A01LP4G</td>
              <td><button class="boton-iniciar" @click="iniciarTareaDesdePrueba('A01LP4G')">Iniciar</button></td>
            </tr>
            <tr>
              <td>1029384756</td>
              <td>8293838201</td>
              <td>QMSMPZOG</td>
              <td><button class="boton-iniciar" @click="iniciarTareaDesdePrueba('QMSMPZOG')">Iniciar</button></td>
            </tr>
            <tr>
              <td>1029384756</td>
              <td>0293847383</td>
              <td>TSMSMPZ4G</td>
              <td><button class="boton-iniciar" @click="iniciarTareaDesdePrueba('TSMSMPZ4G')">Iniciar</button></td>
            </tr>
            <tr>
              <td>1029384756</td>
              <td>7383828291</td>
              <td>D21LP4N</td>
              <td><button class="boton-iniciar" @click="iniciarTareaDesdePrueba('D21LP4N')">Iniciar</button></td>
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
    <p v-else class="mensaje-vacio">No hay órdenes incompletas.</p>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/coordi'
import Swal from 'sweetalert2'

const router = useRouter()
const ordenes = ref([])
const pagina = ref(1)
const porPagina = 5
const procesando = ref(false)

const tablaRef = ref(null)
const tablaWrapperRef = ref(null)
const mostrarOverlay = ref(false)
const overlayStyle = ref({})

const totalPaginas = computed(() =>
  Math.ceil(ordenes.value.length / porPagina)
)

const ordenesPaginadas = computed(() => {
  const inicio = (pagina.value - 1) * porPagina
  return ordenes.value.slice(inicio, inicio + porPagina)
})

// Función que devuelve texto y tipo numérico sin texto adicional
function EmuladorTipo(tipo_tarea) {
  tipo_tarea = tipo_tarea.toUpperCase();

  if (tipo_tarea.substring(0, 2) !== "A4") {
    if (tipo_tarea.charAt(0) === "A") {
      return { texto: "ALTA", tipo: 1 };
    }
  }

  if (tipo_tarea.charAt(0) === "D") {
    return { texto: "CAMBIO DOMICILIO", tipo: 2 };
  }

  const migracionPrefixes = ["FC", "TI", "TS", "TV"];
  if (migracionPrefixes.includes(tipo_tarea.substring(0, 2))) {
    return { texto: "MIGRACIÓN", tipo: 4 };
  }

  if (tipo_tarea.substring(0, 2) === "A4") {
    return { texto: "RECONEXIÓN (A4)", tipo: 5 };
  }

  const queja = ["Q", "R", "C"];
  const queja2 = ["EB", "EI", "EU", "GD", "MG"];
  const queja3 = ["F597", "F841"];
  if (
    queja.includes(tipo_tarea.charAt(0)) ||
    queja2.includes(tipo_tarea.substring(0, 2)) ||
    queja3.includes(tipo_tarea.substring(0, 4))
  ) {
    return { texto: "QUEJA (PSR)", tipo: 3 };
  }

  return { texto: "", tipo: 0 };
}

function iniciarTareaDesdePrueba(tipoTarea) {
  const tipoDetectado = EmuladorTipo(tipoTarea)
  console.log(`Tipo de tarea detectado: texto="${tipoDetectado.texto}", tipo=${tipoDetectado.tipo}`)

  // Redirigir a la ruta /nuevo-registro 
  router.push({
    name: 'NuevoRegistro',
    query: {
      tipo: tipoDetectado.tipo,
      texto: tipoDetectado.texto || ''
    }
  })
}

const getOverlayBtnStyle = (index) => {
  if (!tablaRef.value) return {}
  const filas = tablaRef.value.querySelectorAll('tbody tr')
  if (!filas[index]) return {}
  const rect = filas[index].getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.top}px`,
    right: '0px',
    width: '100px',
    height: `${rect.height}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}

const syncOverlay = () => {
  if (!tablaWrapperRef.value || !tablaRef.value) return
  const tabla = tablaRef.value
  const theadHeight = tabla.tHead.offsetHeight
  const tbodyHeight = tabla.tBodies[0].offsetHeight
  overlayStyle.value = {
    position: 'fixed',
    top: `${tabla.getBoundingClientRect().top + theadHeight}px`,
    right: '0px',
    width: '100px',
    height: `${tbodyHeight}px`,
    background: 'linear-gradient(to left, rgba(44,62,80,0.98) 85%, rgba(44,62,80,0.0) 100%)',
    boxShadow: '-4px 0 16px rgba(0,0,0,0.28)',
    zIndex: 100,
    borderRadius: '0 8px 8px 0',
    pointerEvents: 'none',
    display: 'block',
    overflow: 'hidden',
  }
}

const checkOverlay = () => {
  mostrarOverlay.value = window.innerWidth < 769
  nextTick(() => syncOverlay())
}

watch([pagina, ordenes], () => {
  nextTick(() => {
    syncOverlay()
  })
})

onMounted(async () => {
  checkOverlay()
  window.addEventListener('resize', () => {
    checkOverlay()
    syncOverlay()
  })
  if (tablaWrapperRef.value) {
    tablaWrapperRef.value.addEventListener('scroll', syncOverlay)
  }
  window.addEventListener('scroll', syncOverlay)

  const tecnico = JSON.parse(localStorage.getItem('usuario'))
  const tecnicoId = tecnico?.idTecnico
  if (!tecnicoId) {
    console.warn('No se encontró el ID del técnico en localStorage.')
    return
  }
  try {
    const response = await api.get(`/coordiapp/incompletas-tecnico-vue/${tecnicoId}`)
    ordenes.value = response.data.items || []
    pagina.value = 1
  } catch (error) {
    console.error('Error al obtener órdenes incompletas:', error)
  }
})

async function terminarOrden(folioPisa) {
  if (procesando.value) return
  procesando.value = true
  try {
    await Swal.fire({
      title: '¿Terminar orden?',
      text: `¿Estás seguro de que quieres terminar la orden ${folioPisa}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#a3ca38',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, terminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const orden = ordenes.value.find(o => o.Folio_Pisa === folioPisa)
        if (!orden || !orden.Telefono) {
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró el teléfono de la orden'
          })
          return
        }

        // Obtener tipo de tarea y tipo numérico
        const { texto: tipoTexto, tipo: tipoNum } = EmuladorTipo(orden.Step_Registro)
        console.log(`Tipo de tarea: ${tipoTexto}, Tipo numérico: ${tipoNum}`)

        const fechaActual = new Date()
        const fecha = fechaActual.toISOString().slice(0, 19).replace('T', ' ')
        const tecnico = JSON.parse(localStorage.getItem('usuario'))
        const idTecnico = tecnico?.idTecnico || '0'
        const response = await api.get(`/orden-vue/${folioPisa}`, {
          params: {
            Telefono: orden.Telefono,
            Latitud: '0',
            Longitud: '0',
            FK_Tecnico_apps: String(idTecnico),
            Fecha_Coordiapp: fecha
          }
        })
        if (response.data && (response.data.item || response.data.id)) {
          const registroId = response.data.item ? response.data.item.idtecnico_instalaciones_coordiapp : response.data.id
          const datosActualizacion = {
            idtecnico_instalaciones_coordiapp: String(registroId),
            FK_Tecnico_apps: String(idTecnico),
            Fecha_Coordiapp: fecha,
            Estatus_Orden: 'COMPLETADA',
            Telefono: orden.Telefono
          }
          const updateResponse = await api.post('/actualizar-vue', datosActualizacion)
          if (updateResponse.data && updateResponse.data.mensaje) {
            try {
              const pasosResponse = await api.get(`/registro-pasos-vue/${folioPisa}`, {
                params: { telefonoRegistro: orden.Telefono }
              })
              if (pasosResponse.data && pasosResponse.data.items && pasosResponse.data.items.length > 0) {
                const estadoPasos = pasosResponse.data.items[0]
                const todosLosPasosCompletados = estadoPasos.paso_1 === 1 &&
                  estadoPasos.paso_2 === 1 &&
                  estadoPasos.paso_3 === 1 &&
                  estadoPasos.paso_4 === 1 &&
                  estadoPasos.paso_5 === 1
                if (todosLosPasosCompletados) {
                  await Swal.fire({
                    icon: 'info',
                    title: 'Orden completada',
                    text: 'Esta orden ya ha sido completada. Todos los pasos han sido finalizados.',
                    confirmButtonText: 'Entendido'
                  })
                  const tecnico = JSON.parse(localStorage.getItem('usuario'))
                  const tecnicoId = tecnico?.idTecnico
                  if (tecnicoId) {
                    const response = await api.get(`/coordiapp/incompletas-tecnico-vue/${tecnicoId}`)
                    ordenes.value = response.data.items || []
                    pagina.value = 1
                  }
                  return
                }
              }
            } catch (error) {
              console.error('Error al cargar estado de pasos:', error)
            }
            router.push(`/nuevo-registro?folio=${folioPisa}&telefono=${orden.Telefono}&estatus=completada&auto=true`)
          } else {
            throw new Error('No se pudo actualizar el estatus')
          }
        } else {
          throw new Error(response.data.mensaje || 'No se pudo validar la orden')
        }
      }
    })
  } catch (error) {
    console.error('Error al procesar la orden:', error)
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `No se pudo procesar la orden: ${error.message || 'Error desconocido'}`
    })
  } finally {
    procesando.value = false
  }
}

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
  position: relative;
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

.boton-terminar {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}
.boton-terminar:hover:not(:disabled) {
  background-color: #c0392b;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
.boton-terminar:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
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

.tabla-pruebas-container {
  margin-top: 2.5rem;
  text-align: left;
}
.tabla-pruebas {
  width: 100%;
  border-collapse: collapse;
  background: #23272f;
  color: #ecf0f1;
  margin-top: 0.5rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.tabla-pruebas th, .tabla-pruebas td {
  padding: 10px 14px;
  border-bottom: 1px solid #34495e;
}
.tabla-pruebas th {
  background: #a3ca38;
  color: #23272f;
}
.tabla-pruebas tr:last-child td {
  border-bottom: none;
}
.boton-iniciar {
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.boton-iniciar:hover {
  background: #217dbb;
}

@media (max-width: 768px) {
  .tabla-completa {
    min-width: 900px;
    font-size: 1rem;
    padding-right: 0 !important;
  }
  .tabla-completa th.accion-columna,
  .tabla-completa td.accion-columna {
    display: none !important;
  }
  .tabla-completa th.dummy-col,
  .tabla-completa td.dummy-col {
    display: table-cell !important;
    min-width: 120px;
    width: 120px;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
  }
  .accion-overlay {
    display: block !important;
  }
}
@media (min-width: 769px) {
  .tabla-completa th.dummy-col,
  .tabla-completa td.dummy-col {
    display: none !important;
  }
  .accion-overlay {
    display: none !important;
  }
}
.dummy-col {
  display: none;
}
.accion-overlay {
  pointer-events: none;
  position: fixed;
  right: 0;
  top: 0;
  width: 100px;
  background: linear-gradient(to left, rgba(44,62,80,0.98) 85%, rgba(44,62,80,0.0) 100%);
  box-shadow: -4px 0 16px rgba(0,0,0,0.28);
  z-index: 100;
  border-radius: 0 8px 8px 0;
  display: none;
}
.overlay-boton {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  position: fixed;
  right: 0;
}
</style>