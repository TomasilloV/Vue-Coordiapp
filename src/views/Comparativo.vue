<template>
  <section class="comparativa">
    <h2>Registros en CoordiApp</h2>
    <button @click="regresar" class="boton-regresar" aria-label="Volver">← Regresar</button>
    <div class="mes-selector">
      <label for="mesSelect">Mes:</label>
      <select id="mesSelect" v-model="mesSeleccionado" @change="actualizarGrafica">
        <option v-for="(mes, idx) in mesesDisponibles" :key="idx" :value="idx + 1">{{ mes }}</option>
      </select>
      <label for="anioSelect">Año:</label>
      <select id="anioSelect" v-model="anioSeleccionado" @change="actualizarGrafica">
        <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
      </select>
    </div>
    <div class="grafica-container">
      <canvas ref="grafica"></canvas>
      <div v-if="!hayDatos" class="no-datos-overlay">
        No se encontraron datos para esas fechas
      </div>
    </div>
  </section>
</template>

<script setup>

/**
 * Componente Comparativo.vue
 * Visualiza una gráfica comparativa de registros Telmex y ED
 * para el técnico autenticado, usando Chart.js.
 */

import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/coordi'
import Chart from 'chart.js/auto'

const grafica = ref(null)
const router = useRouter()
let chartInstance = null
const hayDatos = ref(true)

const now = new Date()
const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const mesesDisponibles = meses.slice(0, now.getMonth() + 1)
const mesSeleccionado = ref(now.getMonth() + 1)
const anioActual = now.getFullYear()
const aniosDisponibles = []
for (let y = 2020; y <= anioActual; y++) {
  aniosDisponibles.push(y)
}
const anioSeleccionado = ref(anioActual)

function regresar() {
  router.back()
}

async function consultarGrafica(mes, anio) {
  const tecnico = JSON.parse(localStorage.getItem('usuario'))
  if (!tecnico?.idTecnico) {
    console.warn('No se encontró el ID del técnico.')
    return
  }
  const payload = {
    anio: anio,
    mes: mes,
    idTecnico: tecnico.idTecnico,
    opcion: 1
  }
  try {
    const { data } = await api.post('/comparativa-vue', payload)
    if (!Array.isArray(data) || data.length === 0 ||
        (data[0] && (!data[0].Registros_Telmex && !data[0].Registros_ED))) {
      hayDatos.value = false
      if (chartInstance) {
        chartInstance.destroy()
        chartInstance = null
      }
      return
    }
    hayDatos.value = true
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
    const registros = data[0]
    chartInstance = new Chart(grafica.value, {
      type: 'bar',
      data: {
        labels: ['Registros Telmex', 'Registros ED'],
        datasets: [{
          label: 'Cantidad de Registros',
          data: [registros.Registros_Telmex, registros.Registros_ED],
          backgroundColor: ['#3498db', '#e67e22'],
          borderColor: ['#2980b9', '#d35400'],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Registros del mes de ${meses[(registros.Mes ? registros.Mes : payload.mes) - 1]} de ${registros.Anio ? registros.Anio : payload.anio}`,
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: 20,
            color: '#ecf0f1'
          },
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              font: {
                size: 14
              },
              color: '#ecf0f1'
            },
            grid: {
              color: 'rgba(236, 240, 241, 0.2)'
            }
          },
          x: {
            ticks: {
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#ecf0f1'
            },
            grid: {
              color: 'rgba(236, 240, 241, 0.2)'
            }
          }
        },
        layout: {
          padding: {
            top: 20,
            bottom: 20
          }
        }
      }
    })
  } catch (error) {
    hayDatos.value = false
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
    console.error('Error en la petición:', error)
    console.error('Error al obtener los datos de la comparativa:', error)
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data)
    }
  }
}

function actualizarGrafica() {
  consultarGrafica(mesSeleccionado.value, anioSeleccionado.value)
}

onMounted(() => {
  consultarGrafica(mesSeleccionado.value, anioSeleccionado.value)
})
</script>

<style scoped>
  .comparativa {
    max-width: 800px;
    margin: 2rem auto;
    text-align: center;
    padding: 0 1rem;
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
    z-index: 2;
    position: relative;
  }
  .boton-regresar:hover {
    background-color: #8bb02e;
  }

  .grafica-container {
    height: 550px;
    margin: 2rem 0;
    position: relative;
    background: #2c3e50;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    border: 1px solid #34495e;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
    min-height: 300px;
    display: block;
  }

  .mes-selector {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    margin-bottom: 18px;
  }
  .mes-selector label {
    font-weight: bold;
    color: #ecf0f1;
  }
  .mes-selector select {
    font-size: 1.1rem;
    padding: 6px 14px;
    border-radius: 6px;
    border: 1.5px solid #bdc3c7;
    background: #2c3e50;
    color: #ecf0f1;
  }

  .no-datos {
    color: #e74c3c;
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    margin: 60px 0;
  }

  .no-datos-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(44, 62, 80, 0.85);
    color: #bdc3c7;
    font-size: 1.5rem;
    font-weight: 400;
    font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    border-radius: 12px;
    text-align: center;
    pointer-events: none;
    text-shadow: 0 2px 8px rgba(0,0,0,0.18);
    letter-spacing: 0.5px;
  }
  .grafica-container {
    position: relative;
    min-height: 480px;
    height: 480px;
  }
</style>