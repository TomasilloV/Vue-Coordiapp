<template>
  <div class="nuevo-registro-container">
    <!-- Spinner de carga para modo automático -->
    <div v-if="cargandoAutomatico" class="spinner-overlay">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p class="spinner-text">Cargando datos...</p>
      </div>
    </div>
    
    <h1 class="titulo">{{ pasoActual > 1 ? 'Menu de pasos' : 'Nuevo Registro' }}</h1>
    
    <div v-if="pasoActual > 1 && folioPisa" class="os-folio-header">
      <span class="os-label">Folio :</span>
      <span class="os-folio">{{ folioPisa }}</span>
    </div>
    
    <!-- Menú de navegación de pasos -->
    <div v-if="pasoActual > 1" class="menu-pasos">
      <div class="menu-titulo">
        <p class="menu-descripcion">Seleccione el paso que desea completar</p>
      </div>
      <button @click="volverAMenu" class="boton-secundario boton-volver-global">Volver al Menú</button>
      <div class="pasos-grid">
        <div 
          class="paso-card" 
          :class="{ 
            'activo': pasoSeleccionado === 'domicilio',
            'completado': pasosCompletados.domicilio,
            'deshabilitado': pasosCompletados.domicilio
          }"
          @click="seleccionarPaso('domicilio')"
        >
          <div class="paso-icono">
            <font-awesome-icon icon="home" />
          </div>
          <div class="paso-nombre">Domicilio</div>
          <div class="paso-estado" :class="getEstadoPaso('domicilio')"></div>
        </div>
        
        <div 
          class="paso-card" 
          :class="{ 
            'activo': pasoSeleccionado === 'servicio',
            'completado': pasosCompletados.servicio,
            'deshabilitado': pasosCompletados.servicio
          }"
          @click="seleccionarPaso('servicio')"
        >
          <div class="paso-icono">
            <font-awesome-icon icon="file-circle-plus" />
          </div>
          <div class="paso-nombre">Registro Servicio</div>
          <div class="paso-estado" :class="getEstadoPaso('servicio')"></div>
        </div>
        
        <div 
          class="paso-card" 
          :class="{ 
            'activo': pasoSeleccionado === 'ont',
            'completado': pasosCompletados.ont,
            'deshabilitado': pasosCompletados.ont
          }"
          @click="seleccionarPaso('ont')"
        >
          <div class="paso-icono">
            <font-awesome-icon icon="wifi" />
          </div>
          <div class="paso-nombre">ONT/Modem</div>
          <div class="paso-estado" :class="getEstadoPaso('ont')"></div>
        </div>
        
        <div 
          class="paso-card" 
          :class="{ 
            'activo': pasoSeleccionado === 'cliente',
            'completado': pasosCompletados.cliente,
            'deshabilitado': pasosCompletados.cliente
          }"
          @click="seleccionarPaso('cliente')"
        >
          <div class="paso-icono">
            <font-awesome-icon icon="user" />
          </div>
          <div class="paso-nombre">Cliente</div>
          <div class="paso-estado" :class="getEstadoPaso('cliente')"></div>
        </div>
        
        <div 
          class="paso-card" 
          :class="{ 
            'activo': pasoSeleccionado === 'terminal',
            'completado': pasosCompletados.terminal,
            'deshabilitado': pasosCompletados.terminal
          }"
          @click="seleccionarPaso('terminal')"
        >
          <div class="paso-icono">
            <font-awesome-icon icon="network-wired" />
          </div>
          <div class="paso-nombre">Terminal</div>
          <div class="paso-estado" :class="getEstadoPaso('terminal')"></div>
        </div>
      </div>
    </div>
    
    <!-- Contenedor de pasos -->
    <div class="pasos-contenedor">
      <!-- Paso 1: Validación (solo mostrar si no es modo automático) -->
      <div v-if="pasoActual === 1 && !esModoAutomatico" class="paso-contenido paso-contenido-scroll">
        <div class="tarjeta">
          <h2>Validación de Orden</h2>
          
          <div class="campo-formulario">
            <label for="folioPisa">Folio Pisa:</label>
            <input 
              type="text" 
              id="folioPisa" 
              v-model="folioPisa" 
              placeholder="Ingrese el folio pisa"
              :disabled="validando"
              maxlength="9"
              pattern="[0-9]*"
              inputmode="numeric"
              @input="folioPisa = $event.target.value.replace(/[^0-9]/g, '').slice(0, 9)"
            />
            <p v-if="mensajeError" class="mensaje-error">
              <font-awesome-icon icon="exclamation-circle" /> {{ mensajeError }}
            </p>
          </div>
          
          <div class="campo-formulario">
            <label for="telefono">Teléfono:</label>
            <input 
              type="tel" 
              id="telefono" 
              v-model="telefono" 
              placeholder="Ingrese el número telefónico"
              :disabled="validando"
              maxlength="10"
              pattern="[0-9]*"
              inputmode="numeric"
              @input="telefono = $event.target.value.replace(/[^0-9]/g, '').slice(0, 10)"
            />
          </div>
          
          <div class="campo-formulario">
            <label for="estatus">Estatus:</label>
            <select 
              id="estatus" 
              v-model="estatus" 
              :disabled="validando"
              class="select-estatus"
            >
              <option value="">Seleccione un estatus</option>
              <option 
                value="objetada" 
                :disabled="estatusActual === 'COMPLETADA'"
              >
                Objetada{{ estatusActual === 'COMPLETADA' ? ' (No disponible para órdenes completadas)' : '' }}
              </option>
              <option value="completada">Completada</option>
            </select>
            <p v-if="estatusActual === 'COMPLETADA'" class="mensaje-info">
              <font-awesome-icon icon="info-circle" /> Esta orden ya está completada y no puede ser objetada.
            </p>
          </div>
          
          <!-- Coordenadas en tiempo real para validación -->
          <div class="campo-formulario">
            <label>Latitud:</label>
            <span :class="'coordenada-' + estadoCoordenadas">
              {{ latitudValidacion !== null ? latitudValidacion.toFixed(6) : 'Cargando...' }}
              <span v-if="estadoCoordenadas === 'cargando'" class="indicador-estado">
                <font-awesome-icon icon="spinner" spin /> Cargando...
              </span>
              <span v-else-if="estadoCoordenadas === 'aproximadas'" class="indicador-estado">
                <font-awesome-icon icon="location-arrow" /> Aproximadas
              </span>
              <span v-else-if="estadoCoordenadas === 'precisas'" class="indicador-estado">
                <font-awesome-icon icon="crosshairs" /> Precisas
              </span>
              <span v-else-if="estadoCoordenadas === 'error'" class="indicador-estado">
                <font-awesome-icon icon="exclamation-triangle" />
              </span>
            </span>
          </div>
          <div class="campo-formulario">
            <label>Longitud:</label>
            <span :class="'coordenada-' + estadoCoordenadas">
              {{ longitudValidacion !== null ? longitudValidacion.toFixed(6) : 'Cargando...' }}
            </span>
          </div>
          <div v-if="precisionCoordenadas !== null" class="campo-formulario">
            <label>Precisión:</label>
            <span :class="'precision-' + estadoCoordenadas">
              ±{{ precisionCoordenadas.toFixed(1) }} metros
            </span>
          </div>
          
          <div v-if="ordenValidada" class="resultado-validacion">
            <h3>Información de la Orden</h3>
            <div class="info-orden">
              <div class="info-item">
                <span class="etiqueta">Cliente:</span>
                <span class="valor">{{ ordenInfo.cliente }}</span>
              </div>
              <div class="info-item">
                <span class="etiqueta">Fecha:</span>
                <span class="valor">{{ ordenInfo.fecha }}</span>
              </div>
              <div class="info-item">
                <span class="etiqueta">Estado:</span>
                <span class="valor" :class="'estado-' + ordenInfo.estado.toLowerCase()">{{ ordenInfo.estado }}</span>
              </div>
            </div>
          </div>
          
          <div class="acciones">
            <button 
              @click="cancelar" 
              class="boton-secundario"
            >
              Cancelar
            </button>
            <button 
              @click="siguientePaso" 
              class="boton-primario"
              :disabled="procesando || validando"
            >
              {{ procesando ? 'Procesando...' : 'Continuar' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Paso 2+: Contenido dinámico basado en el paso seleccionado -->
      <div v-if="pasoActual > 1" class="paso-contenido">
        <div v-if="!pasosCompletados[pasoSeleccionado]" class="tarjeta">
          <!-- Domicilio -->
          <div v-if="pasoSeleccionado === 'domicilio' && !pasosCompletados.domicilio" class="paso-detalle">
            <h2>Información de Domicilio</h2>
            <div class="campo-formulario">
              <label for="division">División:</label>
              <select id="division" v-model="selectedDivision" @change="onDivisionChange" class="select-estatus">
                <option value="">Seleccione una división</option>
                <option v-for="opt in opciones.divisiones" :key="opt.idDivision" :value="opt.idDivision">{{ opt.nameDivision }}</option>
              </select>
            </div>
            
            <div class="campo-formulario">
              <label for="area">Área:</label>
              <select id="area" v-model="selectedArea" @change="onAreaChange" class="select-estatus">
                <option value="">Seleccione un área</option>
                <option v-for="opt in opciones.areas" :key="opt.idAreas" :value="opt.idAreas">{{ opt.nameArea }}</option>
              </select>
            </div>
            
            <div class="campo-formulario">
              <label for="cope">Cope:</label>
              <select id="cope" v-model="selectedCope" @change="onCopeChange" class="select-estatus">
                <option value="">Seleccione un cope</option>
                <option v-for="opt in opciones.copes" :key="opt.idCope" :value="opt.idCope">{{ opt.COPE }}</option>
              </select>
            </div>
            
            <div class="campo-formulario">
              <label for="estado">Estado:</label>
              <select id="estado" v-model="selectedEstado" @change="onEstadoChange" class="select-estatus">
                <option value="">Seleccione un estado</option>
                <option v-for="opt in opciones.estados" :key="opt.idEstado" :value="opt.idEstado">{{ opt.nameEstado }}</option>
              </select>
            </div>
            
            <div class="campo-formulario">
              <label for="ciudad">Ciudad:</label>
              <select id="ciudad" v-model="selectedCiudad" @change="onCiudadChange" class="select-estatus">
                <option value="">Seleccione una ciudad</option>
                <option v-for="opt in opciones.ciudades" :key="opt.idMunicipio" :value="opt.idMunicipio">{{ opt.nameMunicipio }}</option>
              </select>
            </div>
            
            <div class="campo-formulario">
              <label for="colonia">Colonia:</label>
              <select 
                id="colonia" 
                :value="selectedColonia" 
                @input="onColoniaChange($event)" 
                class="select-estatus" 
                :key="'colonia-select-' + selectedCiudad + '-' + opciones.colonias.length"
              >
                <option value="">Seleccione una colonia</option>
                <!-- Importante: Asegurarse de que estamos usando idMunicipio como valor, no el índice -->
                <option 
                  v-for="(opt, index) in opciones.colonias" 
                  :key="opt.idMunicipio" 
                  :value="opt.idMunicipio"
                  :data-index="index"
                >
                  {{ opt.nameColonia }}
                </option>
              </select>
            </div>
            
            <div class="campo-formulario">
              <label for="codigoPostal">Código Postal:</label>
              <input type="text" id="codigoPostal" v-model="codigoPostal" placeholder="Ingrese el código postal" maxlength="5" pattern="[0-9]*" inputmode="numeric" @input="codigoPostal = $event.target.value.replace(/[^0-9]/g, '').slice(0, 5)" />
            </div>
            
            <div class="campo-formulario">
              <label for="calle">Calle:</label>
              <input type="text" id="calle" v-model="domicilio.calle" placeholder="Ingrese la calle" maxlength="15" @input="domicilio.calle = $event.target.value.slice(0, 15).toUpperCase()" />
            </div>
            
            <div class="campo-formulario">
              <label for="numero">Número:</label>
              <input type="text" id="numero" v-model="domicilio.numero" placeholder="Ingrese el número" maxlength="7" pattern="[0-9]*" inputmode="numeric" @input="domicilio.numero = $event.target.value.replace(/[^0-9]/g, '').slice(0, 7).toUpperCase()" />
            </div>
            
            <!-- Foto de Fachada -->
            <div class="campo-formulario foto-fachada">
              <label>Foto de Fachada:</label>
              <div class="contenedor-foto">
                <img v-if="domicilio.tieneFoto" :src="domicilio.fotoFachada" alt="Foto de fachada" class="preview-foto" />
                <button v-if="soporteWebcam" type="button" class="boton-foto" @click="() => abrirWebcamModal('fachada')" style="margin-left:8px;">Usar cámara directa</button>
              </div>
            </div>
          </div>
          
          <!-- Registro Servicio -->
          <div v-if="pasoSeleccionado === 'servicio' && !pasosCompletados.servicio" class="paso-detalle">
            <h2>Registro de Servicio</h2>
            <div class="campo-formulario">
              <label for="distrito">Distrito:</label>
              <input type="text" id="distrito" v-model="servicio.distrito" placeholder="Ingrese el distrito" maxlength="10" @input="servicio.distrito = $event.target.value.slice(0, 10).toUpperCase()" />
            </div>
            
            <div class="campo-formulario">
              <label for="tecnologia">Tecnología:</label>
              <select id="tecnologia" v-model="servicio.tecnologia" class="select-estatus" @change="servicio.tecnologia = servicio.tecnologia ? servicio.tecnologia.toUpperCase() : ''">
                <option value="">Seleccione la tecnología</option>
                <option value="FIBRA">FIBRA</option>
                <option value="COBRE">COBRE</option>
              </select>
            </div>
            
            <div class="campo-formulario">
              <label for="metraje">Metraje:</label>
              <input type="text" id="metraje" v-model="servicio.metraje" placeholder="Ingrese el metraje" maxlength="3" pattern="[0-9]*" inputmode="numeric" @input="servicio.metraje = $event.target.value.replace(/[^0-9]/g, '').slice(0, 3).toUpperCase()" />
            </div>
            
            <div class="campo-formulario">
              <label for="tipoInstalacion">Tipo de Instalación:</label>
              <select id="tipoInstalacion" v-model="servicio.tipoInstalacion" class="select-estatus" @change="servicio.tipoInstalacion = servicio.tipoInstalacion ? servicio.tipoInstalacion.toUpperCase() : ''">
                <option value="">Seleccione el tipo de instalación</option>
                <option value="SUBTERRANEA">SUBTERRANEA</option>
                <option value="AEREA">AEREA</option>
              </select>
            </div>
            
            <!-- Foto OS -->
            <div class="campo-formulario foto-fachada">
              <label>Fotografía OS:</label>
              <div class="contenedor-foto">
                <img v-if="servicio.tieneFotoOS" :src="servicio.fotoOS" alt="Fotografía OS" class="preview-foto" />
                <button v-if="soporteWebcam" type="button" class="boton-foto" @click="() => abrirWebcamModal('os')" style="margin-left:8px;">Usar cámara directa</button>
              </div>
            </div>
          </div>
          
          <!-- ONT/Modem -->
          <div v-if="pasoSeleccionado === 'ont' && !pasosCompletados.ont" class="paso-detalle">
            <h2>Información de ONT/Modem</h2>
            <div class="campo-formulario">
              <label for="ont">ONT:</label>
              <select id="ont" v-model="ont.ont" class="select-estatus" @change="ont.ont = ont.ont ? ont.ont.toUpperCase() : ''">
                <option value="">Seleccione una ONT</option>
                <option v-for="option in ontOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            
            <!-- Foto ONT -->
            <div class="campo-formulario foto-fachada">
              <label>Fotografía ONT/Modem:</label>
              <div class="contenedor-foto">
                <img v-if="ont.tieneFotoONT" :src="ont.fotoONT" alt="Fotografía ONT/Modem" class="preview-foto" />
                <button v-if="soporteWebcam" type="button" class="boton-foto" @click="() => abrirWebcamModal('ont')" style="margin-left:8px;">Usar cámara directa</button>
              </div>
            </div>
            
            <!-- Foto Serie ONT -->
            <div class="campo-formulario foto-fachada">
              <label>Fotografía no. serie ONT/Modem:</label>
              <div class="contenedor-foto">
                <img v-if="ont.tieneFotoSerieONT" :src="ont.fotoSerieONT" alt="Fotografía no. serie ONT/Modem" class="preview-foto" />
                <button v-if="soporteWebcam" type="button" class="boton-foto" @click="() => abrirWebcamModal('serieONT')" style="margin-left:8px;">Usar cámara directa</button>
              </div>
            </div>
          </div>
          
          <!-- Cliente -->
          <div v-if="pasoSeleccionado === 'cliente' && !pasosCompletados.cliente" class="paso-detalle">
            <h2>Información del Cliente</h2>
<div class="form-group" style="margin-bottom: 16px;">
  <label for="nombreTitular">Nombre titular</label>
  <input id="nombreTitular" v-model="cliente.nombreTitular" type="text" class="form-control" maxlength="20" placeholder="Ingrese el nombre del titular" @input="cliente.nombreTitular = $event.target.value.slice(0, 20).toUpperCase()" />
</div>
<div class="form-group" style="margin-bottom: 16px;">
  <label for="apellidoPaternoTitular">Apellido paterno Titular</label>
  <input id="apellidoPaternoTitular" v-model="cliente.apellidoPaternoTitular" type="text" class="form-control" maxlength="10" placeholder="Ingrese el apellido paterno" @input="cliente.apellidoPaternoTitular = $event.target.value.slice(0, 10).toUpperCase()" />
</div>
<div class="form-group" style="margin-bottom: 16px;">
  <label for="apellidoMaternoTitular">Apellido materno Titular</label>
  <input id="apellidoMaternoTitular" v-model="cliente.apellidoMaternoTitular" type="text" class="form-control" maxlength="10" placeholder="Ingrese el apellido materno" @input="cliente.apellidoMaternoTitular = $event.target.value.slice(0, 10).toUpperCase()" />
</div>
<div class="form-group" style="margin-bottom: 16px;">
  <label for="personaRecibe">Persona que recibe</label>
  <input id="personaRecibe" v-model="cliente.personaRecibe" type="text" class="form-control" maxlength="40" placeholder="Ingrese el nombre de la persona que recibe" @input="cliente.personaRecibe = $event.target.value.slice(0, 40).toUpperCase()" />
</div>
<div class="form-group" style="margin-bottom: 16px;">
  <label for="telefonoCliente">Teléfono cliente</label>
  <input id="telefonoCliente" v-model="cliente.telefonoCliente" type="text" class="form-control" maxlength="10" pattern="[0-9]*" inputmode="numeric" placeholder="Ingrese el teléfono del cliente" @input="cliente.telefonoCliente = $event.target.value.replace(/[^0-9]/g, '').slice(0, 10)" />
</div>
          </div>
          
          <!-- Terminal -->
          <div v-if="pasoSeleccionado === 'terminal' && !pasosCompletados.terminal" class="paso-detalle">
              <h2>Información de Terminal</h2>
              <div class="campo-formulario">
                <label for="puerto">Puerto:</label>
                <select id="puerto" v-model="terminal.puerto" class="select-estatus">
                  <option value="">Seleccione un puerto</option>
                  <option v-for="n in 24" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
              
              <div class="campo-formulario">
                <label for="terminalTexto">Terminal:</label>
                <input type="text" id="terminalTexto" v-model="terminal.terminalTexto" placeholder="Ingrese el terminal" maxlength="2" @input="terminal.terminalTexto = $event.target.value.slice(0, 2).toUpperCase()" />
              </div>
              
              <!-- Coordenadas en tiempo real para terminal -->
              <div class="campo-formulario">
                <label>Latitud:</label>
                <span :class="'coordenada-' + estadoCoordenadasTerminal">
                  {{ terminal.latitud !== null ? Number(terminal.latitud).toFixed(6) : 'Cargando...' }}
                  <span v-if="estadoCoordenadasTerminal === 'cargando'" class="indicador-estado">
                    <font-awesome-icon icon="spinner" spin /> Cargando...
                  </span>
                  <span v-else-if="estadoCoordenadasTerminal === 'aproximadas'" class="indicador-estado">
                    <font-awesome-icon icon="location-arrow" /> Aproximadas
                  </span>
                  <span v-else-if="estadoCoordenadasTerminal === 'precisas'" class="indicador-estado">
                    <font-awesome-icon icon="crosshairs" /> Precisas
                  </span>
                  <span v-else-if="estadoCoordenadasTerminal === 'error'" class="indicador-estado">
                    <font-awesome-icon icon="exclamation-triangle" />
                  </span>
                </span>
              </div>
              <div class="campo-formulario">
                <label>Longitud:</label>
                <span :class="'coordenada-' + estadoCoordenadasTerminal">
                  {{ terminal.longitud !== null ? Number(terminal.longitud).toFixed(6) : 'Cargando...' }}
                </span>
              </div>
              <div v-if="precisionCoordenadasTerminal !== null" class="campo-formulario">
                <label>Precisión:</label>
                <span :class="'precision-' + estadoCoordenadasTerminal">
                  ±{{ precisionCoordenadasTerminal.toFixed(1) }} metros
                </span>
              </div>

              <!-- Foto Terminal -->
              <div class="campo-formulario foto-fachada">
                <label>Foto Terminal:</label>
                <div ref="webcamContainer">
                  <div v-if="webcamModalVisible && webcamFotoTipo === 'terminal'" class="webcam-box">
                    <h3 class="webcam-title">Capturar foto con cámara</h3>
                    <video ref="webcamVideo" autoplay playsinline class="webcam-video"></video>
                    <canvas ref="webcamCanvas" style="display:none;"></canvas>
                    <div v-if="webcamError" class="mensaje-error">{{ webcamError }}</div>
                    <div class="webcam-actions">
                      <button @click="capturarFotoWebcam" class="boton-primario">Capturar</button>
                      <button @click="cerrarWebcamModal" class="boton-secundario">Cancelar</button>
                    </div>
                  </div>
                </div>
                <div class="contenedor-foto">
                  <img v-if="terminal.tieneFotoTerminal" :src="terminal.fotoTerminal" alt="Foto Terminal" class="preview-foto" />
                  <button v-if="soporteWebcam" type="button" class="boton-foto" @click="() => abrirWebcamModal('terminal')">Usar cámara directa</button>
                </div>
              </div>
            </div>
          
          <!-- Botones de acción para todos los pasos -->
          <div class="acciones-menu">
            <button 
              @click="guardarPaso" 
              class="boton-primario"
              :disabled="botonGuardarDeshabilitado || guardandoPaso"
              :class="{ 
                'boton-deshabilitado': botonGuardarDeshabilitado,
                'boton-procesando': guardandoPaso 
              }"
            >
              {{ 
                botonGuardarDeshabilitado ? 'Ya Guardado' : 
                guardandoPaso ? 'Guardando...' : 'Guardar' 
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal de webcam multiuso -->
  <div v-if="webcamModalVisible" class="camera-modal-overlay">
    <div class="camera-modal-content">
      <h3>Capturar foto con cámara</h3>
      <video ref="webcamVideo" autoplay playsinline style="width:100%;max-width:320px;"></video>
      <canvas ref="webcamCanvas" style="display:none;"></canvas>
      <div v-if="webcamError" class="mensaje-error">{{ webcamError }}</div>
      <div style="margin-top:12px; display: flex; gap: 12px; justify-content: center;">
        <button @click="capturarFotoWebcam" class="boton-primario">Capturar</button>
        <button @click="cerrarWebcamModal" class="boton-secundario">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- Modal para permisos de ubicación -->
  <div v-if="locationModalVisible" class="camera-modal-overlay">
    <div class="camera-modal-content">
      <h3>Permisos de Ubicación</h3>
      <p style="color: #ccc; margin-bottom: 20px; text-align: center;">
        Para completar el registro necesitamos acceder a tu ubicación GPS.
      </p>
      <div v-if="locationError" class="mensaje-error">{{ locationError }}</div>
      <div style="margin-top:12px; display: flex; gap: 12px; justify-content: center;">
        <button @click="solicitarPermisosUbicacion" class="boton-primario" :disabled="solicitandoPermisos">
          {{ solicitandoPermisos ? 'Solicitando...' : 'Permitir Ubicación' }}
        </button>
        <button @click="cerrarLocationModal" class="boton-secundario">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api, { getOntOptions } from '@/api/coordi'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

// Router para navegación
const router = useRouter()

// Estado del formulario principal
const pasoActual = ref(1)
const pasoSeleccionado = ref('domicilio')
const folioPisa = ref('')
const telefono = ref('')
const estatus = ref('')
const estatusActual = ref('') // Nueva variable para guardar el estatus actual de la orden
const validando = ref(false)
const procesando = ref(false) // Nueva variable para evitar múltiples clics
const mensajeError = ref('')
const ordenValidada = ref(false)
const ordenInfo = ref({
  cliente: '',
  fecha: '',
  estado: ''
})
const registroId = ref(null)
const validacionEnProceso = ref(false) // Flag para evitar múltiples validaciones simultáneas
const esModoAutomatico = ref(false) // Flag para modo automático desde tabla incompletas
const cargandoAutomatico = ref(false) // Flag para mostrar spinner en modo automático

// Estado para controlar el botón de guardar
const botonGuardarDeshabilitado = ref(false)
const guardandoPaso = ref(false) // Nuevo estado para evitar múltiples clics

// Estados para evitar spam en botones de foto
const tomandoFotoFachada = ref(false)
const tomandoFotoOS = ref(false)
const tomandoFotoONT = ref(false)
const tomandoFotoSerieONT = ref(false)
const tomandoFotoTerminal = ref(false)

// Estado para el menú de pasos
const pasosCompletados = ref({
  domicilio: false,
  servicio: false,
  ont: false,
  cliente: false,
  terminal: false
})

// Obtener ID del técnico desde localStorage
const obtenerIdTecnico = () => {
  const idTecnico = localStorage.getItem('idTecnico')
  const id = localStorage.getItem('id')
  
  // Si no hay idTecnico o id directo, intentar obtener del objeto usuario
  if (!idTecnico && !id) {
    const usuarioStr = localStorage.getItem('usuario')
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr)
        if (usuario && usuario.idTecnico) {
          console.log('Debug - ID obtenido del objeto usuario:', usuario.idTecnico)
          return usuario.idTecnico.toString()
        }
      } catch (error) {
        console.error('Error al parsear usuario de localStorage:', error)
      }
    }
  }
  
  const resultado = idTecnico || id || '0'
  
  console.log('Debug - obtenerIdTecnico():')
  console.log('  idTecnico:', idTecnico)
  console.log('  id:', id)
  console.log('  resultado:', resultado)
  
  return resultado
}

// Datos para cada paso
const domicilio = reactive({
  division: '',
  area: '',
  cope: '',
  estado: '',
  ciudad: '',
  colonia: '',
  calle: '',
  numero: '',
  codigoPostal: '',
  fotoFachada: null,
  tieneFoto: false,
  fotoFachadaBase64: null
})

const servicio = reactive({
  distrito: '',
  tecnologia: '',
  metraje: '',
  tipoInstalacion: '',
  fotoOS: null,
  tieneFotoOS: false,
  fotoOSBase64: null
})

const ont = reactive({
  ont: '',
  fotoONT: null,
  tieneFotoONT: false,
  fotoONTBase64: null,
  fotoSerieONT: null,
  tieneFotoSerieONT: false,
  fotoSerieONTBase64: null
})

  const cliente = reactive({
    nombreTitular: '',
    apellidoPaternoTitular: '',
    apellidoMaternoTitular: '',
    personaRecibe: '',
    telefonoCliente: ''
  });

const terminal = reactive({
  puerto: '',
  terminalTexto: '',
  tieneFotoTerminal: false,
  fotoTerminal: '',
  fotoTerminalBase64: null,

  latitud: null,
  longitud: null
})

// Variables para el seguimiento de ubicación en tiempo real
const latitudValidacion = ref(null)
const longitudValidacion = ref(null)
const watchId = ref(null)

// Variables reactivas para las opciones de los spinners
const opciones = ref({
  divisiones: [],
  areas: [],
  copes: [],
  areasPorDivision: {},
  copesPorArea: {},
  estados: [],
  ciudades: [],
  colonias: []
})

// Variables para manejar la selección en cascada
const selectedDivision = ref('')
const selectedArea = ref('')
const selectedCope = ref('')
const selectedEstado = ref('')
const selectedCiudad = ref('')
const selectedColonia = ref('')
const selectedColoniaObj = ref(null) // Objeto completo de la colonia seleccionada
const codigoPostal = ref('')

// Variables para geolocalización optimizada
const coordenadasCache = ref(null)
const intentosGeolocalizacion = ref(0)
const maxIntentos = 3
const estadoCoordenadas = ref('cargando') // 'cargando', 'aproximadas', 'precisas', 'error'
const precisionCoordenadas = ref(null)

// Variables específicas para coordenadas del terminal
const estadoCoordenadasTerminal = ref('cargando')
const precisionCoordenadasTerminal = ref(null)
const coordenadasCacheTerminal = ref(null)

// Variables para autocomplete de ONT
const ontOptions = ref([])
const filteredOntOptions = ref([])
const showOntDropdown = ref(false)
const ontSearchTerm = ref('')

// Función para obtener coordenadas rápidas (aproximadas)
const obtenerCoordenadasRapidas = () => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout en coordenadas rápidas'))
    }, 3000) // Solo 3 segundos para coordenadas rápidas

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout)
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        clearTimeout(timeout)
        reject(error)
      },
      {
        enableHighAccuracy: false, // Coordenadas aproximadas para velocidad
        maximumAge: 60000, // Usar coordenadas de hasta 1 minuto
        timeout: 3000 // Timeout de 3 segundos
      }
    )
  })
}

// Función para obtener coordenadas súper rápidas (para terminal)
const obtenerCoordenadasSuperRapidas = () => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout en coordenadas súper rápidas'))
    }, 1500) // Solo 1.5 segundos para coordenadas súper rápidas

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout)
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        clearTimeout(timeout)
        reject(error)
      },
      {
        enableHighAccuracy: false, // Coordenadas aproximadas para máxima velocidad
        maximumAge: 120000, // Usar coordenadas de hasta 2 minutos
        timeout: 1500 // Timeout de 1.5 segundos
      }
    )
  })
}

// Función para obtener coordenadas precisas
const obtenerCoordenadasPrecisas = () => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout en coordenadas precisas'))
    }, 8000) // 8 segundos para coordenadas precisas

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout)
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        clearTimeout(timeout)
        reject(error)
      },
      {
        enableHighAccuracy: true, // Coordenadas precisas
        maximumAge: 0, // Siempre obtener nuevas coordenadas
        timeout: 8000 // Timeout de 8 segundos
      }
    )
  })
}

// Función optimizada para iniciar el seguimiento de ubicación
const startWatchingLocation = async () => {
  if (!navigator.geolocation) {
    console.error('Geolocalización no soportada en este navegador')
    return
  }

  try {
    // Primero intentar obtener coordenadas rápidas
    console.log('Obteniendo coordenadas rápidas...')
    const coordenadasRapidas = await obtenerCoordenadasRapidas()
    
    // Actualizar coordenadas inmediatamente con valores aproximados
    actualizarCoordenadas(coordenadasRapidas.latitude, coordenadasRapidas.longitude, coordenadasRapidas.accuracy)
    console.log('Coordenadas rápidas obtenidas:', coordenadasRapidas)
    
    // Guardar en caché
    coordenadasCache.value = coordenadasRapidas
    
    // Intentar obtener coordenadas precisas en segundo plano
    setTimeout(async () => {
      try {
        console.log('Obteniendo coordenadas precisas...')
        const coordenadasPrecisas = await obtenerCoordenadasPrecisas()
        
        // Solo actualizar si las coordenadas precisas son mejores
        if (coordenadasPrecisas.accuracy < (coordenadasCache.value?.accuracy || 100)) {
          actualizarCoordenadas(coordenadasPrecisas.latitude, coordenadasPrecisas.longitude, coordenadasPrecisas.accuracy)
          coordenadasCache.value = coordenadasPrecisas
          console.log('Coordenadas precisas obtenidas:', coordenadasPrecisas)
        }
      } catch (error) {
        console.log('No se pudieron obtener coordenadas precisas, usando aproximadas:', error.message)
      }
    }, 1000)

  } catch (error) {
    console.error('Error al obtener coordenadas rápidas:', error)
    estadoCoordenadas.value = 'error'
    // Si falla, intentar con coordenadas precisas
    try {
      const coordenadasPrecisas = await obtenerCoordenadasPrecisas()
      actualizarCoordenadas(coordenadasPrecisas.latitude, coordenadasPrecisas.longitude, coordenadasPrecisas.accuracy)
      coordenadasCache.value = coordenadasPrecisas
      console.log('Coordenadas precisas obtenidas como fallback:', coordenadasPrecisas)
    } catch (error2) {
      console.error('Error al obtener coordenadas precisas:', error2)
      estadoCoordenadas.value = 'error'
    }
  }

  // Iniciar seguimiento continuo con configuración optimizada
  watchId.value = navigator.geolocation.watchPosition(
    (position) => {
      const nuevasCoordenadas = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }
      
      // Solo actualizar si las nuevas coordenadas son mejores
      if (!coordenadasCache.value || nuevasCoordenadas.accuracy < coordenadasCache.value.accuracy) {
        actualizarCoordenadas(nuevasCoordenadas.latitude, nuevasCoordenadas.longitude, nuevasCoordenadas.accuracy)
        coordenadasCache.value = nuevasCoordenadas
        console.log('Coordenadas actualizadas:', nuevasCoordenadas)
      }
    },
    (error) => {
      console.error('Error en seguimiento continuo:', error)
    },
    {
      enableHighAccuracy: true,
      maximumAge: 30000, // Usar coordenadas de hasta 30 segundos
      timeout: 10000 // Timeout de 10 segundos
    }
  )
}

// Función específica para cargar coordenadas del terminal de forma rápida
const cargarCoordenadasTerminal = async () => {
  if (!navigator.geolocation) {
    console.error('Geolocalización no soportada en este navegador')
    estadoCoordenadasTerminal.value = 'error'
    return
  }

  // Si ya tenemos coordenadas en caché del terminal, usarlas inmediatamente
  if (coordenadasCacheTerminal.value) {
    console.log('Usando coordenadas en caché del terminal:', coordenadasCacheTerminal.value)
    actualizarCoordenadasTerminal(
      coordenadasCacheTerminal.value.latitude,
      coordenadasCacheTerminal.value.longitude,
      coordenadasCacheTerminal.value.accuracy
    )
    return
  }

  // Si tenemos coordenadas de validación, usarlas como fallback rápido
  if (latitudValidacion.value && longitudValidacion.value) {
    console.log('Usando coordenadas de validación como fallback rápido para terminal')
    actualizarCoordenadasTerminal(latitudValidacion.value, longitudValidacion.value, precisionCoordenadas.value)
    return
  }

  try {
    // Intentar obtener coordenadas súper rápidas para terminal
    console.log('Obteniendo coordenadas súper rápidas para terminal...')
    const coordenadasSuperRapidas = await obtenerCoordenadasSuperRapidas()
    
    // Actualizar coordenadas del terminal inmediatamente
    actualizarCoordenadasTerminal(coordenadasSuperRapidas.latitude, coordenadasSuperRapidas.longitude, coordenadasSuperRapidas.accuracy)
    console.log('Coordenadas súper rápidas para terminal obtenidas:', coordenadasSuperRapidas)
    
    // Guardar en caché del terminal
    coordenadasCacheTerminal.value = coordenadasSuperRapidas
    
    // Intentar obtener coordenadas precisas en segundo plano
    setTimeout(async () => {
      try {
        console.log('Obteniendo coordenadas precisas para terminal...')
        const coordenadasPrecisas = await obtenerCoordenadasPrecisas()
        
        // Solo actualizar si las coordenadas precisas son mejores
        if (coordenadasPrecisas.accuracy < (coordenadasCacheTerminal.value?.accuracy || 100)) {
          actualizarCoordenadasTerminal(coordenadasPrecisas.latitude, coordenadasPrecisas.longitude, coordenadasPrecisas.accuracy)
          coordenadasCacheTerminal.value = coordenadasPrecisas
          console.log('Coordenadas precisas para terminal obtenidas:', coordenadasPrecisas)
        }
      } catch (error) {
        console.log('No se pudieron obtener coordenadas precisas para terminal, usando aproximadas:', error.message)
      }
    }, 300) // Aún más rápido que las coordenadas de validación

  } catch (error) {
    console.error('Error al obtener coordenadas súper rápidas para terminal:', error)
    estadoCoordenadasTerminal.value = 'error'
    // Si falla, intentar con coordenadas rápidas normales
    try {
      const coordenadasRapidas = await obtenerCoordenadasRapidas()
      actualizarCoordenadasTerminal(coordenadasRapidas.latitude, coordenadasRapidas.longitude, coordenadasRapidas.accuracy)
      coordenadasCacheTerminal.value = coordenadasRapidas
      console.log('Coordenadas rápidas para terminal obtenidas como fallback:', coordenadasRapidas)
    } catch (error2) {
      console.error('Error al obtener coordenadas rápidas para terminal:', error2)
      // Si también falla, intentar con coordenadas precisas
      try {
        const coordenadasPrecisas = await obtenerCoordenadasPrecisas()
        actualizarCoordenadasTerminal(coordenadasPrecisas.latitude, coordenadasPrecisas.longitude, coordenadasPrecisas.accuracy)
        coordenadasCacheTerminal.value = coordenadasPrecisas
        console.log('Coordenadas precisas para terminal obtenidas como fallback final:', coordenadasPrecisas)
      } catch (error3) {
        console.error('Error al obtener coordenadas precisas para terminal:', error3)
        estadoCoordenadasTerminal.value = 'error'
      }
    }
  }
}

// Función para actualizar coordenadas según el paso actual
const actualizarCoordenadas = (latitud, longitud, precision = null) => {
  // Siempre actualizar coordenadas, independientemente del tipo de registro
  if (pasoActual.value === 1) {
    latitudValidacion.value = Number(latitud)
    longitudValidacion.value = Number(longitud)
    console.log('Debug - Coordenadas de validación actualizadas:', latitudValidacion.value, longitudValidacion.value)
  } else if (pasoSeleccionado.value === 'terminal') {
    terminal.latitud = Number(latitud)
    terminal.longitud = Number(longitud)
    console.log('Debug - Coordenadas de terminal actualizadas:', terminal.latitud, terminal.longitud)
  }
  
  // Actualizar estado y precisión solo para indicadores visuales (no se guardan)
  if (precision !== null) {
    precisionCoordenadas.value = precision
    if (precision < 10) {
      estadoCoordenadas.value = 'precisas'
    } else if (precision < 50) {
      estadoCoordenadas.value = 'aproximadas'
    } else {
      estadoCoordenadas.value = 'aproximadas'
    }
  }
}

// Función específica para actualizar coordenadas del terminal
const actualizarCoordenadasTerminal = (latitud, longitud, precision = null) => {
  // Siempre actualizar coordenadas del terminal, independientemente del tipo de registro
  terminal.latitud = Number(latitud)
  terminal.longitud = Number(longitud)
  console.log('Debug - Coordenadas de terminal actualizadas:', terminal.latitud, terminal.longitud)
  
  // Actualizar estado y precisión del terminal
  if (precision !== null) {
    precisionCoordenadasTerminal.value = precision
    if (precision < 10) {
      estadoCoordenadasTerminal.value = 'precisas'
    } else if (precision < 50) {
      estadoCoordenadasTerminal.value = 'aproximadas'
    } else {
      estadoCoordenadasTerminal.value = 'aproximadas'
    }
  }
}

// Función para detener el seguimiento de ubicación
const stopWatchingLocation = () => {
  if (watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value)
    watchId.value = null
  }
}

// Función para cargar opciones de ONT
const cargarOpcionesOnt = async () => {
  try {
    const idTecnico = obtenerIdTecnico()
    console.log('Cargando opciones de ONT para técnico:', idTecnico)
    
    const options = await getOntOptions(idTecnico)
    ontOptions.value = options
    console.log('Opciones de ONT cargadas:', options.length, 'opciones:', options)
    
    // Si no hay opciones, mostrar mensaje
    if (options.length === 0) {
      console.warn('No se encontraron opciones de ONT para el técnico:', idTecnico)
    }
  } catch (error) {
    console.error('Error al cargar opciones de ONT:', error)
    ontOptions.value = []
  }
}

// Función para filtrar opciones de ONT
const filtrarOpcionesOnt = (searchTerm) => {
  console.log('Filtrando opciones de ONT con término:', searchTerm)
  console.log('Opciones disponibles:', ontOptions.value)
  
  if (!searchTerm || searchTerm.length < 2) {
    filteredOntOptions.value = []
    showOntDropdown.value = false
    return
  }
  
  const filtered = ontOptions.value.filter(option => 
    option && option.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  filteredOntOptions.value = filtered.slice(0, 10) // Limitar a 10 resultados
  showOntDropdown.value = filtered.length > 0
  
  console.log('Opciones filtradas:', filteredOntOptions.value)
}

// Función para seleccionar una opción de ONT
const seleccionarOnt = (ontValue) => {
  ont.ont = ontValue
  ontSearchTerm.value = ontValue
  showOntDropdown.value = false
  console.log('ONT seleccionado:', ontValue)
}

// Función para manejar el input del campo ONT
const onOntInput = (event) => {
  const value = event.target.value
  ontSearchTerm.value = value
  ont.ont = value
  filtrarOpcionesOnt(value)
}

// Cargar el estado de los pasos desde el servidor
const cargarEstadoPasos = async () => {
  try {
    if (!folioPisa.value || !telefono.value) return
    if (!/^[0-9]{10}$/.test(telefono.value)) {
      alert('El teléfono debe tener 10 dígitos válidos');
      return;
    }
    
    // Llamar a la API para obtener el estado de los pasos (GET sin prefijo)
    const response = await api.get(`/registro-pasos-vue/${folioPisa.value}`, {
      params: { telefonoRegistro: telefono.value }
    })
    
    if (response.data && response.data.items && response.data.items.length > 0) {
      const estadoPasos = response.data.items[0]
      
      // Actualizar el estado de los pasos completados
      pasosCompletados.value.domicilio = estadoPasos.paso_1 === 1
      pasosCompletados.value.servicio = estadoPasos.paso_2 === 1
      pasosCompletados.value.ont = estadoPasos.paso_3 === 1
      pasosCompletados.value.cliente = estadoPasos.paso_4 === 1
      pasosCompletados.value.terminal = estadoPasos.paso_5 === 1
      
      console.log('Estado de pasos cargado correctamente')
      
      // Verificar si todos los pasos están completados
      const todosLosPasosCompletados = Object.values(pasosCompletados.value).every(paso => paso === true)
      
      if (todosLosPasosCompletados) {
        await Swal.fire({
          icon: 'info',
          title: 'Orden completada',
          text: 'Esta orden ya ha sido completada. Todos los pasos han sido finalizados.',
          confirmButtonText: 'Entendido'
        })
        // Redirigir al menú principal si la orden ya está completada
        router.push('/menu')
        return
      }
    }
  } catch (error) {
    console.error('Error al cargar estado de pasos:', error)
  }
}

// Cargar datos del registro actual
const cargarDatosRegistro = async () => {
  try {
    if (!folioPisa.value) return
    
    // Llamar a la API para obtener los datos del registro (usando ruta API para consistencia)
    const response = await api.get(`/orden-vue/${folioPisa.value}`)
    
    if (response.data && response.data.item) {
      const orden = response.data.item
      
      // Guardar el ID del registro
      registroId.value = orden.idtecnico_instalaciones_coordiapp
      
      // Cargar datos en los objetos reactivos según corresponda
      if (orden.FK_Division) domicilio.division = orden.FK_Division
      if (orden.FK_Area) domicilio.area = orden.FK_Area
      if (orden.FK_Cope) domicilio.cope = orden.FK_Cope
      if (orden.FK_Estado) domicilio.estado = orden.FK_Estado
      if (orden.FK_Ciudad) domicilio.ciudad = orden.FK_Ciudad
      if (orden.FK_Colonia) domicilio.colonia = orden.FK_Colonia
      if (orden.Calle) domicilio.calle = orden.Calle
      if (orden.Numero) domicilio.numero = orden.Numero
      if (orden.Codigo_Postal) domicilio.codigoPostal = orden.Codigo_Postal
      if (orden.Foto_Casa_Cliente) {
        domicilio.fotoFachada = orden.Foto_Casa_Cliente
        domicilio.tieneFoto = true
      }
      
      if (orden.Distrito) servicio.distrito = orden.Distrito
      if (orden.Tecnologia) servicio.tecnologia = orden.Tecnologia
      if (orden.Metraje) servicio.metraje = orden.Metraje
      if (orden.Tipo_Instalacion) servicio.tipoInstalacion = orden.Tipo_Instalacion
      if (orden.Foto_OS) {
        servicio.fotoOS = orden.Foto_OS
        servicio.tieneFotoOS = true
      }
      
      if (orden.Ont) {
        ont.ont = orden.Ont
        ontSearchTerm.value = orden.Ont
      }
      if (orden.Foto_Ont) {
        ont.fotoONT = orden.Foto_Ont
        ont.tieneFotoONT = true
      }
      if (orden.No_Serie_ONT) {
        ont.fotoSerieONT = orden.No_Serie_ONT
        ont.tieneFotoSerieONT = true
      }
      
      if (orden.Cliente_Titular) cliente.nombreTitular = orden.Cliente_Titular
      if (orden.Apellido_Paterno_Titular) cliente.apellidoPaternoTitular = orden.Apellido_Paterno_Titular
      if (orden.Apellido_Materno_Titular) cliente.apellidoMaternoTitular = orden.Apellido_Materno_Titular
      if (orden.Cliente_Recibe) cliente.personaRecibe = orden.Cliente_Recibe
      if (orden.Telefono_Cliente) cliente.telefonoCliente = orden.Telefono_Cliente
      
      if (orden.Puerto) terminal.puerto = orden.Puerto
      if (orden.Terminal) terminal.terminalTexto = orden.Terminal
      if (orden.Latitud_Terminal) terminal.latitud = Number(orden.Latitud_Terminal)
      if (orden.Longitud_Terminal) terminal.longitud = Number(orden.Longitud_Terminal)
      if (orden.Foto_Terminal) {
        terminal.fotoTerminal = orden.Foto_Terminal
        terminal.tieneFotoTerminal = true
      }
      
      console.log('Datos del registro cargados correctamente')
    }
  } catch (error) {
    console.error('Error al cargar datos del registro:', error)
  }
}

// Iniciar seguimiento cuando el componente se monta
onMounted(() => {
  startWatchingLocation()
  cargarOpcionesIniciales()
  
  // Verificar si hay parámetros en la URL para pre-cargar datos
  const urlParams = new URLSearchParams(window.location.search)
  const folioFromUrl = urlParams.get('folio')
  const telefonoFromUrl = urlParams.get('telefono')
  const estatusFromUrl = urlParams.get('estatus')
  const autoFromUrl = urlParams.get('auto')
  
  if (folioFromUrl && telefonoFromUrl) {
    console.log('Datos pre-cargados desde URL:', { folio: folioFromUrl, telefono: telefonoFromUrl, estatus: estatusFromUrl, auto: autoFromUrl })
    
    // Pre-cargar los datos
    folioPisa.value = folioFromUrl
    telefono.value = telefonoFromUrl
    
    if (estatusFromUrl) {
      estatus.value = estatusFromUrl
    }
    
    // Si viene con estatus completada, validar automáticamente y pasar al menú de pasos
    if (estatusFromUrl === 'completada') {
      console.log('Estatus completada detectado, validando automáticamente...')
      
      // Si es auto=true, ir directamente al menú de pasos sin mostrar validación
      if (autoFromUrl === 'true') {
        console.log('Modo automático detectado, saltando validación...')
        esModoAutomatico.value = true
        cargandoAutomatico.value = true
        setTimeout(async () => {
          try {
            // Validar la orden en segundo plano
            await validarOrden()
            if (ordenValidada.value) {
              // Cargar estado de pasos y datos del registro
              await cargarEstadoPasos()
              await cargarDatosRegistro()
              
              // Ir directamente al menú de pasos
              pasoActual.value = 2
              pasoSeleccionado.value = 'domicilio'
            }
          } catch (error) {
            console.error('Error en validación automática:', error)
          } finally {
            cargandoAutomatico.value = false
          }
        }, 500)
      } else {
        // Modo normal: mostrar validación y luego pasar al menú
        setTimeout(async () => {
          try {
            await validarOrden()
            if (ordenValidada.value) {
              // Cargar estado de pasos y pasar al menú
              await cargarEstadoPasos()
              pasoActual.value = 2
              pasoSeleccionado.value = 'domicilio'
            }
          } catch (error) {
            console.error('Error en validación automática:', error)
          }
        }, 1000)
      }
    }
  }
  
  // Precargar coordenadas para terminal en segundo plano
  setTimeout(() => {
    console.log('Precargando coordenadas para terminal...')
    cargarCoordenadasTerminal()
  }, 2000) // Esperar 2 segundos para no interferir con la carga inicial
})

// Detener seguimiento cuando el componente se desmonta
onUnmounted(() => {
  stopWatchingLocation()
})

// Watchers para actualizar el estado del botón de guardar
watch(pasoSeleccionado, () => {
  actualizarEstadoBotonGuardar()
})

// Watchers para campos del paso domicilio
watch([selectedDivision, selectedArea, selectedCope, selectedEstado, selectedCiudad, selectedColonia], () => {
  if (pasoSeleccionado.value === 'domicilio') {
    actualizarEstadoBotonGuardar()
  }
})

watch([() => domicilio.calle, () => domicilio.numero, () => domicilio.codigoPostal, () => domicilio.tieneFoto], () => {
  if (pasoSeleccionado.value === 'domicilio') {
    actualizarEstadoBotonGuardar()
  }
})

// Watchers para campos del paso servicio
watch([() => servicio.distrito, () => servicio.tecnologia, () => servicio.tipoInstalacion, () => servicio.metraje, () => servicio.tieneFotoOS], () => {
  if (pasoSeleccionado.value === 'servicio') {
    actualizarEstadoBotonGuardar()
  }
})

// Watchers para campos del paso ont
watch([() => ont.ont, () => ont.tieneFotoONT, () => ont.tieneFotoSerieONT], () => {
  if (pasoSeleccionado.value === 'ont') {
    actualizarEstadoBotonGuardar()
  }
})

// Watchers para campos del paso cliente
watch([() => cliente.nombreTitular, () => cliente.apellidoPaternoTitular, () => cliente.apellidoMaternoTitular, () => cliente.personaRecibe, () => cliente.telefonoCliente], () => {
  if (pasoSeleccionado.value === 'cliente') {
    actualizarEstadoBotonGuardar()
  }
})

// Watchers para campos del paso terminal
watch([() => terminal.puerto, () => terminal.terminalTexto, () => terminal.latitud, () => terminal.longitud, () => terminal.tieneFotoTerminal], () => {
  if (pasoSeleccionado.value === 'terminal') {
    actualizarEstadoBotonGuardar()
  }
})

// Método para validar la orden
const validarOrden = async () => {
  if (!folioPisa.value || !telefono.value) return
  
  // Evitar múltiples validaciones simultáneas
  if (validando.value) {
    console.log('Ya se está validando, ignorando llamada adicional')
    return
  }
  
  validando.value = true
  mensajeError.value = ''
  ordenValidada.value = false
  
  try {
    // Obtener fecha actual en formato YYYY-MM-DD HH:MM:SS
    const fechaActual = new Date()
    const fecha = fechaActual.toISOString().slice(0, 19).replace('T', ' ')
    
    // Obtener coordenadas
    const latitud = latitudValidacion.value ? latitudValidacion.value.toString() : '0'
    const longitud = longitudValidacion.value ? longitudValidacion.value.toString() : '0'
    
    // ID del técnico
    const idTecnico = obtenerIdTecnico()
    
    console.log('Iniciando validación de orden:', {
      folioPisa: folioPisa.value,
      telefono: telefono.value,
      latitud,
      longitud,
      idTecnico,
      fecha
    })
    
    // Llamada a la API para validar la orden (usando ruta API para consistencia)
    const response = await api.get(`/orden-vue/${folioPisa.value}`, {
      params: {
        Telefono: telefono.value,
        Latitud: String(latitud),
        Longitud: String(longitud),
        FK_Tecnico_apps: idTecnico,
        Fecha_Coordiapp: fecha
      }
    })
    
    console.log('Respuesta de validación:', response.data)
    
    // Procesar respuesta
    if (response.data && (response.data.item || response.data.id)) {
      // Si hay un item, es un registro existente
      if (response.data.item) {
        ordenInfo.value = {
          cliente: response.data.item.Cliente_Titular || 'Sin nombre',
          fecha: new Date(response.data.item.Fecha_Coordiapp || fechaActual).toLocaleDateString(),
          estado: response.data.item.Estatus_Orden || 'Pendiente'
        }
        // Guardar el estatus actual de la orden
        estatusActual.value = response.data.item.Estatus_Orden || 'PENDIENTE'
        console.log('Debug - Estatus actual de la orden:', estatusActual.value)
        
        // Si es un registro existente, usar el ID del item
        registroId.value = response.data.item.idtecnico_instalaciones_coordiapp
        console.log('Debug - ID guardado (existente):', registroId.value, 'tipo:', typeof registroId.value)
      } else {
        // Si hay un id, es un registro nuevo
        ordenInfo.value = {
          cliente: 'Nuevo registro',
          fecha: new Date(fechaActual).toLocaleDateString(),
          estado: 'Pendiente'
        }
        // Para registros nuevos, el estatus actual es PENDIENTE
        estatusActual.value = 'PENDIENTE'
        console.log('Debug - Estatus actual de la orden (nuevo):', estatusActual.value)
        
        // Guardar el ID del nuevo registro
        registroId.value = response.data.id
        console.log('Debug - ID guardado (nuevo):', registroId.value, 'tipo:', typeof registroId.value)
      }
      ordenValidada.value = true
    } else {
      mensajeError.value = response.data.mensaje || 'No se pudo validar la orden'
    }
  } catch (error) {
    console.error('Error al validar orden:', error)
    if (error.response?.status === 404) {
      mensajeError.value = 'Orden no encontrada. Verifique el folio PISA.'
    } else if (error.response?.status === 500) {
      mensajeError.value = 'Error del servidor. Intente nuevamente.'
    } else {
      mensajeError.value = 'Error de conexión. Verifique su conexión a internet.'
    }
  } finally {
    validando.value = false
  }
}

// Método para ir al siguiente paso (sin requerir validación)
const siguientePaso = async () => {
  // Evitar múltiples ejecuciones simultáneas
  if (procesando.value) {
    console.log('Ya se está procesando, ignorando clic adicional')
    return
  }
  
  procesando.value = true
  
  try {
    if (pasoActual.value === 1) {
      // Validar que se haya ingresado el folio pisa y el teléfono
      if (!folioPisa.value || !telefono.value) {
        await Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor ingrese el folio pisa y el teléfono' })
        return
      }
      
      // Validar formato del folio pisa (solo números, máximo 9)
      if (!/^\d{1,9}$/.test(folioPisa.value)) {
        await Swal.fire({ icon: 'warning', title: 'Atención', text: 'El folio Pisa debe contener solo números y máximo 9 dígitos' })
        return
      }
      
      // Validar formato del teléfono (exactamente 10 dígitos)
      if (!/^\d{10}$/.test(telefono.value)) {
        await Swal.fire({ icon: 'warning', title: 'Atención', text: 'El teléfono debe contener exactamente 10 dígitos numéricos' })
        return
      }
      // Validar que se haya seleccionado un estatus
      if (!estatus.value) {
        await Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor selecciona un estatus (Completada u Objetada)' })
        return
      }
      
      // Verificar permisos de ubicación después de validar campos
      const permisosOtorgados = await verificarPermisosUbicacion()
      if (!permisosOtorgados) {
        abrirLocationModal()
        return
      }
      
      // Intentar obtener coordenadas actuales
      try {
        const coordenadasActuales = await obtenerCoordenadasActuales()
        latitudValidacion.value = coordenadasActuales.latitude
        longitudValidacion.value = coordenadasActuales.longitude
        console.log('Coordenadas de validación obtenidas:', coordenadasActuales)
      } catch (error) {
        console.log('No se pudieron obtener coordenadas actuales, usando coordenadas registradas')
      }
      
      // Validar la orden antes de continuar
      await validarOrden()
      
      if (!ordenValidada.value) {
        await Swal.fire({ icon: 'warning', title: 'Atención', text: 'No se pudo validar la orden. Por favor verifique los datos.' })
        return
      }
      
      // Verificar si el estatus es "objetada"
      if (estatus.value === 'objetada') {
        // Validar que no se esté intentando cambiar de COMPLETADA a OBJETADA
        if (estatusActual.value === 'COMPLETADA') {
          await Swal.fire({ icon: 'warning', title: 'Atención', text: 'No se puede cambiar el estatus de una orden COMPLETADA a OBJETADA. La orden ya está finalizada.' })
          return
        }
        
        // Guardar los datos del paso de validación
        const datosValidacion = prepararDatos()
        console.log('Debug - Datos de validación (objetada) a enviar:', datosValidacion)
        
        // Actualizar el paso de validación en el servidor
        const response = await actualizarPasoEnServidor(datosValidacion)
        
        if (response.data && response.data.mensaje) {
          console.log('Paso de validación (objetada) guardado correctamente:', response.data.mensaje)
        }
        
        // Actualizar el estado de los pasos en el servidor
        await actualizarEstadoPasos()
        
        // Mostrar mensaje de éxito y regresar al menú principal
        await Swal.fire({ icon: 'success', title: 'Éxito', text: 'Orden objetada exitosamente' })
        router.push('/menu')
        return
      }
      
      // Si el estatus es "completada", permitir el cambio (de OBJETADA a COMPLETADA está permitido)
      if (estatus.value === 'completada') {
        console.log('Debug - Cambiando estatus a COMPLETADA. Estatus anterior:', estatusActual.value)
        // Actualizar el estatus actual para futuras validaciones
        estatusActual.value = 'COMPLETADA'
      }
      
      // Guardar los datos del paso de validación
      const datosValidacion = prepararDatos()
      console.log('Debug - Datos de validación a enviar:', datosValidacion)
      console.log('Debug - Latitud:', latitudValidacion.value)
      console.log('Debug - Longitud:', longitudValidacion.value)
      console.log('Debug - FK_Tecnico_apps:', obtenerIdTecnico())
      console.log('Debug - Estatus_Orden:', estatus.value)
      console.log('Debug - Telefono:', telefono.value)
      console.log('Debug - registroId.value:', registroId.value)
      console.log('Debug - pasoActual.value:', pasoActual.value)
      
      // Actualizar el paso de validación en el servidor
      const response = await actualizarPasoEnServidor(datosValidacion)
      
      if (response.data && response.data.mensaje) {
        console.log('Paso de validación guardado correctamente:', response.data.mensaje)
      }
      
      // Solo cargar el estado de los pasos, no los datos del registro (ya se obtuvieron en validarOrden)
      await cargarEstadoPasos()
      
      pasoActual.value = 2
      pasoSeleccionado.value = 'domicilio' // Iniciar con el paso de domicilio
    } else if (pasoSeleccionado.value === 'terminal') {
      // Guardar las coordenadas actuales del paso de terminal
      if (terminal.latitud && terminal.longitud) {
        console.log('Coordenadas guardadas en terminal:', 
          Number(terminal.latitud).toFixed(6), 
          Number(terminal.longitud).toFixed(6))
        // Aquí se podría mostrar un mensaje al usuario
        await Swal.fire({ icon: 'info', title: 'Información', text: `Coordenadas guardadas:\nLatitud: ${Number(terminal.latitud).toFixed(6)}\nLongitud: ${Number(terminal.longitud).toFixed(6)}` })
      }
    }
  } catch (error) {
    console.error('Error al avanzar al siguiente paso:', error)
    await Swal.fire({ icon: 'warning', title: 'Atención', text: 'Error al avanzar al siguiente paso. Por favor intente nuevamente.' })
  } finally {
    procesando.value = false
  }
}

// Método para seleccionar un paso específico
const seleccionarPaso = async (paso) => {
  // Verificar si el paso ya está completado
  if (pasosCompletados.value[paso]) {
    await Swal.fire({
      icon: 'info',
      title: 'Paso completado',
      text: 'Este paso ya ha sido completado y no se puede editar.',
      confirmButtonText: 'Entendido'
    })
    return
  }
  
  pasoSeleccionado.value = paso
  
  // Si se selecciona el paso terminal, cargar coordenadas específicamente para terminal
  if (paso === 'terminal') {
    console.log('Paso terminal seleccionado, cargando coordenadas específicas...')
    cargarCoordenadasTerminal()
  }
  
  // Si se selecciona el paso ont, cargar opciones de ONT
  if (paso === 'ont') {
    console.log('Paso ONT seleccionado, cargando opciones de ONT...')
    cargarOpcionesOnt()
  }
  
  // Actualizar el estado del botón de guardar al cambiar de paso
  actualizarEstadoBotonGuardar()
}

// Método para obtener el estado de un paso (para estilos)
const getEstadoPaso = (paso) => {
  if (pasosCompletados.value[paso]) {
    return 'completado'
  }
  return pasoSeleccionado.value === paso ? 'activo' : ''
}

// Función para verificar si todos los campos del paso actual están completos
const verificarCamposCompletos = () => {
  switch (pasoSeleccionado.value) {
    case 'domicilio':
      return selectedDivision.value && 
             selectedArea.value && 
             selectedCope.value && 
             selectedEstado.value && 
             selectedCiudad.value && 
             selectedColonia.value && 
             domicilio.calle && 
             domicilio.numero && 
             domicilio.codigoPostal &&
             domicilio.tieneFoto
    
    case 'servicio':
      return servicio.distrito && 
             servicio.tecnologia && 
             servicio.tipoInstalacion && 
             servicio.metraje &&
             servicio.tieneFotoOS
    
    case 'ont':
      return ont.tieneFotoONT && ont.tieneFotoSerieONT
    
    case 'cliente':
      return cliente.nombreTitular && 
             cliente.apellidoPaternoTitular && 
             cliente.apellidoMaternoTitular && 
             cliente.personaRecibe && 
             cliente.telefonoCliente
    
    case 'terminal':
      return terminal.puerto && 
             terminal.terminalTexto && 
             terminal.tieneFotoTerminal
    
    default:
      return false
  }
}

// Función para actualizar el estado del botón de guardar
const actualizarEstadoBotonGuardar = () => {
  // Solo deshabilitar si el paso ya está completado, no si está completo
  botonGuardarDeshabilitado.value = pasosCompletados.value[pasoSeleccionado.value] === true
}

// Método para guardar el paso actual
const guardarPaso = async () => {
  // Evitar múltiples clics simultáneos
  if (guardandoPaso.value) {
    console.log('Ya se está guardando, ignorando clic adicional')
    return
  }
  
  guardandoPaso.value = true
  
      try {
      // PRIMERO: Validar campos según el paso seleccionado (sin coordenadas)
      if (!(await validarCamposPaso())) {
        guardandoPaso.value = false
        return
      }
      
      // SEGUNDO: Verificar permisos de ubicación
      const permisosOtorgados = await verificarPermisosUbicacion()
      if (!permisosOtorgados) {
        abrirLocationModal()
        guardandoPaso.value = false
        return
      }
      
      // TERCERO: Intentar obtener coordenadas actuales según el paso
      if (pasoSeleccionado.value === 'terminal') {
        try {
          const coordenadasActuales = await obtenerCoordenadasActuales()
          terminal.latitud = coordenadasActuales.latitude
          terminal.longitud = coordenadasActuales.longitude
          console.log('Coordenadas del terminal obtenidas:', coordenadasActuales)
        } catch (error) {
          console.log('No se pudieron obtener coordenadas actuales del terminal, usando coordenadas registradas')
        }
      }
    
    // Preparar datos para enviar al servidor
    const datos = prepararDatos()
    
    console.log('Debug - Datos a enviar:', datos)
    
    // Actualizar el paso en el servidor
    const response = await actualizarPasoEnServidor(datos)
    
    if (response.data && response.data.mensaje) {
      // Marcar el paso como completado
      pasosCompletados.value[pasoSeleccionado.value] = true
      
      // Actualizar el estado del botón de guardar
      actualizarEstadoBotonGuardar()
      
      // Mostrar mensaje de éxito
      await Swal.fire({ icon: 'success', title: 'Éxito', text: `Paso ${pasoSeleccionado.value} guardado correctamente: ${response.data.mensaje}` })
      
      // Actualizar el estado de los pasos en el servidor
      await actualizarEstadoPasos()
      
      // Verificar si todos los 5 pasos están completados
      const todosLosPasosCompletados = Object.values(pasosCompletados.value).every(paso => paso === true)
      
      if (todosLosPasosCompletados) {
        // Si todos los pasos están completados, enviar la actualización final
        const datosFinales = {
          idtecnico_instalaciones_coordiapp: String(registroId.value),
          Step_Registro: 5,
          FK_Tecnico_apps: obtenerIdTecnico(),
          Fecha_Coordiapp: fechaMonterrey
        }
        
        console.log('Debug - Todos los pasos completados, enviando actualización final:', datosFinales)
        
        const responseFinal = await actualizarPasoEnServidor(datosFinales)
        
        if (responseFinal.data && responseFinal.data.mensaje) {
          console.log('Registro completado correctamente:', responseFinal.data.mensaje)
          await Swal.fire({ icon: 'success', title: 'Éxito', text: 'Registro de orden exitoso' })
          router.push('/menu')
        }
      }
    }
  } catch (error) {
    console.error('Error al guardar paso:', error)
    await Swal.fire({ icon: 'warning', title: 'Atención', text: `Error al guardar paso: ${error.response?.data?.mensaje || error.message || 'Error desconocido'}` })
  } finally {
    // Siempre resetear el estado de guardando
    guardandoPaso.value = false
  }
}

// Validar campos según el paso seleccionado
const validarCamposPaso = async () => {
  let valido = true
  let mensaje = ''
  
  switch (pasoSeleccionado.value) {
    case 'domicilio':
      if (!selectedDivision.value || !selectedArea.value || !selectedCope.value || !selectedEstado.value || !selectedCiudad.value || !selectedColonia.value || !domicilio.calle || !domicilio.numero || !domicilio.codigoPostal) {
        mensaje = 'Por favor complete todos los campos obligatorios del domicilio'
        valido = false
      } else {
        // Validar número exterior (máximo 7 caracteres)
        if (domicilio.numero && domicilio.numero.length > 7) {
          mensaje = 'El número exterior debe tener máximo 7 caracteres'
          valido = false
        }
        // Validar calle (máximo 15 caracteres)
        if (domicilio.calle && domicilio.calle.length > 15) {
          mensaje = 'La calle debe tener máximo 15 caracteres'
          valido = false
        }
        // Validar que la foto de la fachada esté presente
        if (!domicilio.tieneFoto) {
          mensaje = 'Por favor tome una foto de la fachada de la casa'
          valido = false
        }
      }
      break
      
    case 'servicio':
      if (!servicio.distrito || !servicio.tecnologia || !servicio.tipoInstalacion || !servicio.metraje) {
        mensaje = 'Por favor complete todos los campos obligatorios del servicio'
        valido = false
      } else {
        // Validar distrito (máximo 10 caracteres)
        if (servicio.distrito && servicio.distrito.length > 10) {
          mensaje = 'El distrito debe tener máximo 10 caracteres'
          valido = false
        }
        // Validar tecnología (debe ser FIBRA o COBRE)
        if (servicio.tecnologia && !['FIBRA', 'COBRE'].includes(servicio.tecnologia.toUpperCase())) {
          mensaje = 'La tecnología debe ser FIBRA o COBRE'
          valido = false
        }
        // Validar metraje (solo números, máximo 3 dígitos)
        if (servicio.metraje && (!/^[0-9]{1,3}$/.test(servicio.metraje.toString()))) {
          mensaje = 'El metraje debe contener solo números y máximo 3 dígitos'
          valido = false
        }
        // Validar tipo de instalación (debe ser SUBTERRANEA o AEREA)
        if (servicio.tipoInstalacion && !['SUBTERRANEA', 'AEREA'].includes(servicio.tipoInstalacion.toUpperCase())) {
          mensaje = 'El tipo de instalación debe ser SUBTERRANEA o AEREA'
          valido = false
        }
      }
      if (!servicio.tieneFotoOS) {
        mensaje = 'Por favor tome una foto de la OS'
        valido = false
      }
      break
      
    case 'ont':
      // Solo validar las fotos, no el campo ont.ont
      if (!ont.tieneFotoONT) {
        mensaje = 'Por favor tome una foto del ONT/Modem'
        valido = false
      }
      if (!ont.tieneFotoSerieONT) {
        mensaje = 'Por favor tome una foto del número de serie del ONT/Modem'
        valido = false
      }
      break
      
    case 'cliente':
      if (!cliente.nombreTitular || !cliente.apellidoPaternoTitular || !cliente.apellidoMaternoTitular || !cliente.personaRecibe || !cliente.telefonoCliente) {
        mensaje = 'Por favor complete todos los campos obligatorios del cliente'
        valido = false
      } else {
        // Validar nombre titular (máximo 30 caracteres)
        if (cliente.nombreTitular && cliente.nombreTitular.length > 30) {
          mensaje = 'El nombre del titular debe tener máximo 30 caracteres'
          valido = false
        }
        // Validar apellido paterno titular (máximo 15 caracteres)
        if (cliente.apellidoPaternoTitular && cliente.apellidoPaternoTitular.length > 15) {
          mensaje = 'El apellido paterno del titular debe tener máximo 15 caracteres'
          valido = false
        }
        // Validar apellido materno titular (máximo 15 caracteres)
        if (cliente.apellidoMaternoTitular && cliente.apellidoMaternoTitular.length > 15) {
          mensaje = 'El apellido materno del titular debe tener máximo 15 caracteres'
          valido = false
        }
        // Validar persona que recibe (máximo 50 caracteres)
        if (cliente.personaRecibe && cliente.personaRecibe.length > 50) {
          mensaje = 'La persona que recibe debe tener máximo 50 caracteres'
          valido = false
        }
        // Validar teléfono cliente (exactamente 10 dígitos)
        if (cliente.telefonoCliente && !/^[0-9]{10}$/.test(cliente.telefonoCliente)) {
          await Swal.fire({ icon: 'warning', title: 'Atención', text: 'El teléfono del cliente debe contener exactamente 10 dígitos numéricos' })
          return
        }
      }
      break
      
    case 'terminal':
      if (!terminal.puerto || !terminal.terminalTexto) {
        mensaje = 'Por favor complete todos los campos obligatorios de la terminal'
        valido = false
      } else {
        // Validar terminal (máximo 2 caracteres)
        if (terminal.terminalTexto && terminal.terminalTexto.length > 2) {
          mensaje = 'La terminal debe tener máximo 2 caracteres'
          valido = false
        }
      }
      if (!terminal.tieneFotoTerminal) {
        mensaje = 'Por favor tome una foto de la terminal'
        valido = false
      }
      break
  }
  
  if (!valido) {
    await Swal.fire({ icon: 'warning', title: 'Atención', text: mensaje })
  }
  
  return valido
}

// Preparar datos según el paso actual
const prepararDatos = () => {
  console.log('Debug - registroId.value:', registroId.value, 'tipo:', typeof registroId.value)
  
  const datos = {
    FK_Tecnico_apps: obtenerIdTecnico(),
    Fecha_Coordiapp: fechaMonterrey
    // NO enviar Step_Registro en pasos intermedios
  }
  
  // Solo agregar el ID si existe y es válido
  if (registroId.value && registroId.value !== '0' && registroId.value !== 0) {
    datos.idtecnico_instalaciones_coordiapp = String(registroId.value)
    console.log('Debug - ID agregado:', datos.idtecnico_instalaciones_coordiapp)
  } else {
    console.log('Debug - No se agregó ID, valor:', registroId.value)
  }
  
  // Agregar datos específicos según el paso
  switch (pasoSeleccionado.value) {
    case 'domicilio':
      Object.assign(datos, {
        FK_Cope: selectedCope.value,
        Foto_Casa_Cliente: domicilio.fotoFachadaBase64 || convertirImagenABase64(domicilio.fotoFachada),
        Direccion_Cliente: (() => {
          console.log('Construyendo dirección con:', {
            selectedColonia: selectedColonia.value,
            selectedColoniaObj: selectedColoniaObj.value,
            colonias: opciones.value.colonias
          });
          
          // Usar el objeto de colonia guardado si está disponible
          const nombreColonia = selectedColoniaObj.value ? selectedColoniaObj.value.nameColonia : 
            (selectedColonia.value && opciones.value.colonias.length > 0 ? 
              (opciones.value.colonias.find(c => String(c.idMunicipio) === String(selectedColonia.value))?.nameColonia || '') : '');
          
          return `${domicilio.calle} ${domicilio.numero}, ${nombreColonia}, ${domicilio.codigoPostal}, ${selectedCiudad.value && opciones.value.ciudades.length > 0 ? (opciones.value.ciudades.find(c => c.idMunicipio === selectedCiudad.value)?.nameMunicipio || '') : ''}, ${selectedEstado.value && opciones.value.estados.length > 0 ? (opciones.value.estados.find(e => e.idEstado === selectedEstado.value)?.nameEstado || '') : ''}`;
        })()
      })
      break
      
    case 'servicio':
      Object.assign(datos, {
        Distrito: servicio.distrito,
        Tecnologia: servicio.tecnologia,
        Metraje: servicio.metraje,
        Tipo_Instalacion: servicio.tipoInstalacion,
        Foto_INE: servicio.fotoOSBase64 || convertirImagenABase64(servicio.fotoOS)
      })
      break
      
    case 'ont':
      Object.assign(datos, {
        Ont: ont.ont,
        Foto_Ont: ont.fotoONTBase64 || convertirImagenABase64(ont.fotoONT),
        No_Serie_ONT: ont.fotoSerieONTBase64 || convertirImagenABase64(ont.fotoSerieONT)
      })
      break
      
    case 'cliente':
      Object.assign(datos, {
        Cliente_Titular: cliente.nombreTitular,
        Apellido_Paterno_Titular: cliente.apellidoPaternoTitular,
        Apellido_Materno_Titular: cliente.apellidoMaternoTitular,
        Cliente_Recibe: cliente.personaRecibe,
        Telefono_Cliente: cliente.telefonoCliente
      })
      break
      
    case 'terminal':
      Object.assign(datos, {
        Puerto: String(terminal.puerto),
        Terminal: terminal.terminalTexto,
        // Siempre enviar coordenadas del terminal como strings
        Latitud_Terminal: String(terminal.latitud || 0),
        Longitud_Terminal: String(terminal.longitud || 0),
        Foto_Puerto: terminal.fotoTerminalBase64 || convertirImagenABase64(terminal.fotoTerminal)
      })
      console.log('Debug - Enviando coordenadas del terminal (como strings):', {
        latitud: String(terminal.latitud || 0),
        longitud: String(terminal.longitud || 0)
      })
      break
  }
  
  // Si estamos en el paso de validación (pasoActual === 1), agregar solo los campos necesarios para validación
  if (pasoActual.value === 1) {
    Object.assign(datos, {
      // Solo los campos necesarios para validación
      Latitud: String(latitudValidacion.value || 0),
      Longitud: String(longitudValidacion.value || 0),
      FK_Tecnico_apps: obtenerIdTecnico(),
      Estatus_Orden: (estatus.value || 'PENDIENTE').toUpperCase(),
      Telefono: telefono.value || '0'
      // NO agregar Direccion_Cliente, FK_Cope, Foto_Casa_Cliente, etc.
    })
    console.log('Debug - Enviando coordenadas de validación (como strings):', {
      latitud: String(latitudValidacion.value || 0),
      longitud: String(longitudValidacion.value || 0)
    })
  }
  
  return datos
}

// Convertir imágenes a base64 si es necesario
const convertirImagenABase64 = (url) => {
  if (!url) return null
  
  // Si la URL ya es una cadena base64, devolverla directamente
  if (typeof url === 'string' && url.startsWith('data:image')) {
    return url
  }
  
  // Si es un objeto URL creado con URL.createObjectURL
  if (url instanceof Object) {
    // En una implementación real, aquí se convertiría la imagen a base64
    // usando FileReader o Canvas
    
    // Por ahora, devolvemos un placeholder para simular la conversión
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q=='
  }
  
  return null
}

// Función para limpiar campos de domicilio vacíos antes de enviar
function limpiarCamposDomicilio(obj) {
  const camposDomicilio = [
    'Direccion_Cliente',
    'FK_Cope',
    'Foto_Casa_Cliente'
    // agrega aquí cualquier otro campo de domicilio que no quieras enviar vacío
  ];
  camposDomicilio.forEach(campo => {
    if (
      obj[campo] === '' ||
      obj[campo] === null ||
      obj[campo] === undefined ||
      obj[campo] === ' , , , , '
    ) {
      delete obj[campo];
    }
  });
  return obj;
}

// Actualizar el paso en el servidor
const actualizarPasoEnServidor = async (datos) => {
  // Hacer una copia plana del objeto para evitar problemas con la reactividad de Vue
  let datosLimpios = JSON.parse(JSON.stringify(datos));
  datosLimpios = limpiarCamposDomicilio(datosLimpios);
  console.log('Payload FINAL a enviar:', datosLimpios);
  // Llamar a la API para actualizar el registro (POST con prefijo /api)
  return await api.post('/actualizar-vue', datosLimpios);
}

// Actualizar el estado de los pasos en el servidor
const actualizarEstadoPasos = async () => {
  try {
    // Mapear los pasos completados a valores 0/1 para el backend
    const pasos = {
      Folio_Pisa: folioPisa.value,
      Paso_1: pasosCompletados.value.domicilio ? 1 : 0,
      Paso_2: pasosCompletados.value.servicio ? 1 : 0,
      Paso_3: pasosCompletados.value.ont ? 1 : 0,
      Paso_4: pasosCompletados.value.cliente ? 1 : 0,
      Paso_5: pasosCompletados.value.terminal ? 1 : 0,
      fecha_ultimo_avance: fechaMonterrey
    }
    
    console.log('Debug - Datos de pasos a enviar:', pasos)
    
    // Llamar a la API para actualizar el estado de los pasos (POST con prefijo /api)
    await api.post('/registro-pasos-vue', pasos, {
      params: { telefonoRegistro: telefono.value }
    })
    
    console.log('Estado de pasos actualizado correctamente')
  } catch (error) {
    console.error('Error al actualizar estado de pasos:', error)
  }
}

// Método para volver al menú de pasos
const volverAMenu = async () => {
  const result = await Swal.fire({
    title: '¿Seguro que quieres volver al menú principal?',
    text: 'Se perderán los cambios no guardados.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, volver',
    cancelButtonText: 'Cancelar'
  })
  if (result.isConfirmed) {
    router.push('/menu')
  }
}

// Método para cancelar y volver al menú principal
const cancelar = () => {
  router.push('/menu')
}

// Referencias a los inputs de tipo file para las fotos
const inputFoto = ref(null)
const inputFotoOS = ref(null)
const inputFotoONT = ref(null)
const inputFotoSerieONT = ref(null)
const inputFotoTerminal = ref(null)
const inputFotoINE = ref(null)
const inputFotoPuerto = ref(null)

// Método para activar la cámara para foto de fachada
const tomarFoto = async () => {
  // Evitar múltiples clics simultáneos
  if (tomandoFotoFachada.value) {
    console.log('Ya se está tomando foto de fachada, ignorando clic adicional')
    return
  }
  
  tomandoFotoFachada.value = true
  
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      inputFoto.value.click()
      
      // Timeout de seguridad: si después de 10 segundos no se ha procesado foto, resetear estado
      setTimeout(() => {
        if (tomandoFotoFachada.value) {
          console.log('Timeout: reseteando estado de foto fachada')
          tomandoFotoFachada.value = false
        }
      }, 10000)
    } else {
      await Swal.fire({ icon: 'error', title: 'Cámara no soportada', text: 'Tu dispositivo no soporta el acceso a la cámara' })
      tomandoFotoFachada.value = false
    }
  } catch (error) {
    console.error('Error al tomar foto de fachada:', error)
    tomandoFotoFachada.value = false
  }
}

// Método para procesar la foto de fachada tomada
const procesarFoto = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Crear un objeto URL para la vista previa
    domicilio.fotoFachada = URL.createObjectURL(file)
    domicilio.tieneFoto = true
    
    // Convertir la imagen a base64 para almacenarla
    convertirFileABase64(file, (base64) => {
      // Guardar la imagen en base64 para enviarla al servidor
      domicilio.fotoFachadaBase64 = base64
      console.log('Foto fachada convertida a base64')
    })
  }
  
  // Resetear el estado de toma de foto
  tomandoFotoFachada.value = false
  
  // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
  event.target.value = ''
}

// Método para activar la cámara para foto OS
const tomarFotoOS = async () => {
  // Evitar múltiples clics simultáneos
  if (tomandoFotoOS.value) {
    console.log('Ya se está tomando foto OS, ignorando clic adicional')
    return
  }
  
  tomandoFotoOS.value = true
  
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      inputFotoOS.value.click()
      
      // Timeout de seguridad: si después de 10 segundos no se ha procesado foto, resetear estado
      setTimeout(() => {
        if (tomandoFotoOS.value) {
          console.log('Timeout: reseteando estado de foto OS')
          tomandoFotoOS.value = false
        }
      }, 10000)
    } else {
      await Swal.fire({ icon: 'error', title: 'Cámara no soportada', text: 'Tu dispositivo no soporta el acceso a la cámara' })
      tomandoFotoOS.value = false
    }
  } catch (error) {
    console.error('Error al tomar foto OS:', error)
    tomandoFotoOS.value = false
  }
}

// Método para procesar la foto OS tomada
const procesarFotoOS = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Crear un objeto URL para la vista previa
    servicio.fotoOS = URL.createObjectURL(file)
    servicio.tieneFotoOS = true
    
    // Convertir la imagen a base64 para almacenarla
    convertirFileABase64(file, (base64) => {
      // Guardar la imagen en base64 para enviarla al servidor
      servicio.fotoOSBase64 = base64
      console.log('Foto OS convertida a base64')
    })
  }
  
  // Resetear el estado de toma de foto
  tomandoFotoOS.value = false
  
  // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
  event.target.value = ''
}

// Método para activar la cámara para foto INE
const tomarFotoINE = async () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    inputFotoINE.value.click()
  } else {
    await Swal.fire({ icon: 'error', title: 'Cámara no soportada', text: 'Tu dispositivo no soporta el acceso a la cámara' })
  }
}

// Método para procesar la foto INE tomada
const procesarFotoINE = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Crear un objeto URL para la vista previa
    servicio.fotoINE = URL.createObjectURL(file)
    servicio.tieneFotoINE = true
    
    // Convertir la imagen a base64 para almacenarla
    convertirFileABase64(file, (base64) => {
      // Guardar la imagen en base64 para enviarla al servidor
      servicio.fotoINEBase64 = base64
      console.log('Foto INE convertida a base64')
    })
  }
}

// Método para activar la cámara para foto ONT/Modem
const tomarFotoONT = async () => {
  // Evitar múltiples clics simultáneos
  if (tomandoFotoONT.value) {
    console.log('Ya se está tomando foto ONT, ignorando clic adicional')
    return
  }
  
  tomandoFotoONT.value = true
  
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      inputFotoONT.value.click()
      
      // Timeout de seguridad: si después de 10 segundos no se ha procesado foto, resetear estado
      setTimeout(() => {
        if (tomandoFotoONT.value) {
          console.log('Timeout: reseteando estado de foto ONT')
          tomandoFotoONT.value = false
        }
      }, 10000)
    } else {
      await Swal.fire({ icon: 'error', title: 'Cámara no soportada', text: 'Tu dispositivo no soporta el acceso a la cámara' })
      tomandoFotoONT.value = false
    }
  } catch (error) {
    console.error('Error al tomar foto ONT:', error)
    tomandoFotoONT.value = false
  }
}

// Método para procesar la foto ONT/Modem tomada
const procesarFotoONT = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Crear un objeto URL para la vista previa
    ont.fotoONT = URL.createObjectURL(file)
    ont.tieneFotoONT = true
    
    // Convertir la imagen a base64 para almacenarla
    convertirFileABase64(file, (base64) => {
      // Guardar la imagen en base64 para enviarla al servidor
      ont.fotoONTBase64 = base64
      console.log('Foto ONT convertida a base64')
    })
  }
  
  // Resetear el estado de toma de foto
  tomandoFotoONT.value = false
  
  // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
  event.target.value = ''
}

// Método para activar la cámara para foto de serie ONT/Modem
const tomarFotoSerieONT = async () => {
  // Evitar múltiples clics simultáneos
  if (tomandoFotoSerieONT.value) {
    console.log('Ya se está tomando foto serie ONT, ignorando clic adicional')
    return
  }
  
  tomandoFotoSerieONT.value = true
  
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      inputFotoSerieONT.value.click()
      
      // Timeout de seguridad: si después de 10 segundos no se ha procesado foto, resetear estado
      setTimeout(() => {
        if (tomandoFotoSerieONT.value) {
          console.log('Timeout: reseteando estado de foto serie ONT')
          tomandoFotoSerieONT.value = false
        }
      }, 10000)
    } else {
      await Swal.fire({ icon: 'error', title: 'Cámara no soportada', text: 'Tu dispositivo no soporta el acceso a la cámara' })
      tomandoFotoSerieONT.value = false
    }
  } catch (error) {
    console.error('Error al tomar foto serie ONT:', error)
    tomandoFotoSerieONT.value = false
  }
}

// Método para procesar la foto de serie ONT/Modem tomada
const procesarFotoSerieONT = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Crear un objeto URL para la vista previa
    ont.fotoSerieONT = URL.createObjectURL(file)
    ont.tieneFotoSerieONT = true
    
    // Convertir la imagen a base64 para almacenarla
    convertirFileABase64(file, (base64) => {
      // Guardar la imagen en base64 para enviarla al servidor
      ont.fotoSerieONTBase64 = base64
      console.log('Foto serie ONT convertida a base64')
    })
  }
  
  // Resetear el estado de toma de foto
  tomandoFotoSerieONT.value = false
  
  // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
  event.target.value = ''
}

// Función para convertir un archivo a base64
const convertirFileABase64 = (file, callback) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target.result
    callback(base64)
  }
  reader.readAsDataURL(file)
}

// Método para activar la cámara para foto Terminal
const tomarFotoTerminal = async () => {
  // Evitar múltiples clics simultáneos
  if (tomandoFotoTerminal.value) {
    console.log('Ya se está tomando foto terminal, ignorando clic adicional')
    return
  }
  
  tomandoFotoTerminal.value = true
  
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      inputFotoTerminal.value.click()
      
      // Timeout de seguridad: si después de 10 segundos no se ha procesado foto, resetear estado
      setTimeout(() => {
        if (tomandoFotoTerminal.value) {
          console.log('Timeout: reseteando estado de foto terminal')
          tomandoFotoTerminal.value = false
        }
      }, 10000)
    } else {
      await Swal.fire({ icon: 'error', title: 'Cámara no soportada', text: 'Tu dispositivo no soporta el acceso a la cámara' })
      tomandoFotoTerminal.value = false
    }
  } catch (error) {
    console.error('Error al tomar foto terminal:', error)
    tomandoFotoTerminal.value = false
  }
}

// Método para procesar la foto Terminal tomada
const procesarFotoTerminal = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Crear un objeto URL para la vista previa
    terminal.fotoTerminal = URL.createObjectURL(file)
    terminal.tieneFotoTerminal = true
    
    // Convertir la imagen a base64 para almacenarla
    convertirFileABase64(file, (base64) => {
      // Guardar la imagen en base64 para enviarla al servidor
      terminal.fotoTerminalBase64 = base64
      console.log('Foto Terminal convertida a base64')
    })
  }
  
  // Resetear el estado de toma de foto
  tomandoFotoTerminal.value = false
  
  // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
  event.target.value = ''
}

// Método para probar la conexión API
const probarConexionAPI = async () => {
  try {
    // Obtener fecha actual en formato YYYY-MM-DD HH:MM:SS
    const fechaActual = new Date()
    const fecha = fechaActual.toISOString().slice(0, 19).replace('T', ' ')
    
    // Obtener coordenadas
    const latitud = latitudValidacion.value ? latitudValidacion.value.toString() : '0'
    const longitud = longitudValidacion.value ? longitudValidacion.value.toString() : '0'
    
    // ID del técnico
    const idTecnico = obtenerIdTecnico()
    
    // Llamada a la API para probar la conexión
    const response = await api.get('/probar-conexion', {
      params: {
        Telefono: telefono.value,
        Latitud: latitud,
        Longitud: longitud,
        FK_Tecnico_apps: idTecnico,
        Fecha_Coordiapp: fecha
      }
    })
    
    // Procesar respuesta
    if (response.data && response.data.mensaje) {
      await Swal.fire({ icon: 'info', title: 'Mensaje', text: response.data.mensaje })
    } else {
      await Swal.fire({ icon: 'warning', title: 'Atención', text: 'Error al probar la conexión API' })
    }
  } catch (error) {
    console.error('Error al probar la conexión API:', error)
    await Swal.fire({ icon: 'warning', title: 'Atención', text: 'Error al probar la conexión API' })
  }
}

// Cargar opciones iniciales
const cargarOpcionesIniciales = async () => {
  try {
    // Probar primero la ruta de prueba
    console.log('Probando ruta de prueba...')
    const testResponse = await api.get('/test-opciones', { params: { step: '1' } })
    console.log('Respuesta de prueba:', testResponse.data)
    
    // Cargar divisiones, áreas y copes
    console.log('Cargando opciones...')
    const response1 = await api.get('/coordiapp/opciones-vue', { params: { step: '1' } })
    console.log('Respuesta opciones:', response1.data)
    if (response1.data) {
      // Obtener divisiones únicas
      const divisionesUnicas = []
      const areasPorDivision = {}
      const copesPorArea = {}
      
      response1.data.forEach(item => {
        // Agregar división si no existe
        if (!divisionesUnicas.find(d => d.idDivision === item.idDivision)) {
          divisionesUnicas.push({
            idDivision: item.idDivision,
            nameDivision: item.nameDivision
          })
        }
        
        // Agrupar áreas por división
        if (!areasPorDivision[item.idDivision]) {
          areasPorDivision[item.idDivision] = []
        }
        if (!areasPorDivision[item.idDivision].find(a => a.idAreas === item.idAreas)) {
          areasPorDivision[item.idDivision].push({
            idAreas: item.idAreas,
            nameArea: item.nameArea
          })
        }
        
        // Agrupar copes por área
        if (!copesPorArea[item.idAreas]) {
          copesPorArea[item.idAreas] = []
        }
        if (!copesPorArea[item.idAreas].find(c => c.idCope === item.idCope)) {
          copesPorArea[item.idAreas].push({
            idCope: item.idCope,
            COPE: item.COPE
          })
        }
      })
      
      opciones.value.divisiones = divisionesUnicas
      opciones.value.areasPorDivision = areasPorDivision
      opciones.value.copesPorArea = copesPorArea
    }
    
    // Cargar estados
    const response2 = await api.get('/coordiapp/opciones-vue', { params: { step: '5e' } })
    if (response2.data) {
      opciones.value.estados = response2.data
    }
  } catch (error) {
    console.error('Error al cargar opciones iniciales:', error)
  }
}

// Cargar áreas por división
const cargarAreas = async (divisionId) => {
  try {
    opciones.value.areas = opciones.value.areasPorDivision[divisionId] || []
    selectedArea.value = ''
    selectedCope.value = ''
  } catch (error) {
    console.error('Error al cargar áreas:', error)
  }
}

// Cargar copes por área
const cargarCopes = async (areaId) => {
  try {
    opciones.value.copes = opciones.value.copesPorArea[areaId] || []
    selectedCope.value = ''
  } catch (error) {
    console.error('Error al cargar copes:', error)
  }
}

// Cargar ciudades por estado
const cargarCiudades = async (estadoId) => {
  try {
    const response = await api.get('/coordiapp/opciones-vue', { 
      params: { 
        step: '5m', 
        idEstado: estadoId 
      } 
    })
    if (response.data) {
      opciones.value.ciudades = response.data
    }
    selectedCiudad.value = ''
    selectedColonia.value = ''
  } catch (error) {
    console.error('Error al cargar ciudades:', error)
  }
}

// Cargar colonias por municipio
const cargarColonias = async (municipioId) => {
  try {
    console.log('Cargando colonias para municipio ID:', municipioId);
    
    // Primero resetear el valor de la colonia para evitar selecciones incorrectas
    selectedColonia.value = '';
    
    const response = await api.get('/coordiapp/opciones-vue', { 
      params: { 
        step: '5c', 
        idMunicipio: municipioId 
      } 
    });
    
    console.log('Respuesta de colonias recibida:', response.data);
    
    if (response.data && Array.isArray(response.data)) {
      // Verificar si todas las colonias tienen el mismo ID
      const idsUnicos = new Set(response.data.map(c => c.idMunicipio));
      console.log('IDs únicos de colonias:', Array.from(idsUnicos));
      
      if (idsUnicos.size === 1 && response.data.length > 1) {
        console.warn('PROBLEMA DETECTADO: Todas las colonias tienen el mismo ID:', Array.from(idsUnicos)[0]);
        
        // Asignar IDs únicos temporales para cada colonia
        const coloniasFijas = response.data.map((colonia, index) => ({
          ...colonia,
          idMunicipio: colonia.idMunicipio + '_' + index, // Crear un ID único temporal
          idOriginal: colonia.idMunicipio // Guardar el ID original
        }));
        
        console.log('Colonias con IDs corregidos:', coloniasFijas);
        
        // Ordenar colonias alfabéticamente por nameColonia
        opciones.value.colonias = coloniasFijas.sort((a, b) => 
          a.nameColonia.localeCompare(b.nameColonia, 'es', { sensitivity: 'base' })
        );
      } else {
        // Ordenar colonias alfabéticamente por nameColonia
        opciones.value.colonias = response.data.sort((a, b) => 
          a.nameColonia.localeCompare(b.nameColonia, 'es', { sensitivity: 'base' })
        );
      }
      
      console.log('Colonias ordenadas y asignadas:', opciones.value.colonias);
      console.log('Primera colonia:', opciones.value.colonias[0]);
      console.log('Estructura de colonia:', opciones.value.colonias[0] ? Object.keys(opciones.value.colonias[0]) : 'No hay colonias');
    } else {
      console.warn('No se recibieron datos de colonias o no es un array');
      opciones.value.colonias = [];
    }
  } catch (error) {
    console.error('Error al cargar colonias:', error);
    // En caso de error, asegurar que las colonias estén vacías
    opciones.value.colonias = [];
    selectedColonia.value = '';
  }
}

// Eventos de cambio en los selects
const onDivisionChange = (event) => {
  const divisionId = parseInt(event.target.value)
  selectedDivision.value = divisionId
  if (divisionId) {
    cargarAreas(divisionId)
  } else {
    opciones.value.areas = []
    opciones.value.copes = []
    selectedArea.value = ''
    selectedCope.value = ''
  }
}

const onAreaChange = (event) => {
  const areaId = parseInt(event.target.value)
  selectedArea.value = areaId
  if (areaId) {
    cargarCopes(areaId)
  } else {
    opciones.value.copes = []
    selectedCope.value = ''
  }
}

const onCopeChange = (event) => {
  selectedCope.value = parseInt(event.target.value)
}

const onEstadoChange = (event) => {
  const estadoId = parseInt(event.target.value)
  selectedEstado.value = estadoId
  if (estadoId) {
    cargarCiudades(estadoId)
  } else {
    opciones.value.ciudades = []
    opciones.value.colonias = []
    selectedCiudad.value = ''
    selectedColonia.value = ''
  }
}

const onCiudadChange = (event) => {
  const ciudadId = parseInt(event.target.value)
  selectedCiudad.value = ciudadId
  // Siempre resetear la colonia seleccionada al cambiar de ciudad
  selectedColonia.value = ''
  
  if (ciudadId) {
    // Limpiar las colonias antes de cargar las nuevas
    opciones.value.colonias = []
    // Luego cargar las nuevas colonias
    cargarColonias(ciudadId)
  } else {
    opciones.value.colonias = []
  }
}

const onColoniaChange = (event) => {
  // Obtener el elemento select y su índice seleccionado
  const select = event.target;
  const selectedIndex = select.selectedIndex;
  
  console.log('Evento de cambio de colonia:', {
    selectedIndex,
    options: select.options,
    selectedOption: select.options[selectedIndex],
    rawValue: select.value,
    eventType: event.type
  });
  
  // Usar directamente el valor del evento para evitar problemas de sincronización
  // Importante: Asegurarse de que estamos obteniendo el valor correcto, no el índice
  const coloniaIdRaw = select.value;
  
  console.log('Valor raw seleccionado en colonia:', coloniaIdRaw);
  console.log('Opciones disponibles (cantidad):', opciones.value.colonias.length);
  
  // Asignar el valor después de la validación
  selectedColonia.value = coloniaIdRaw;
  
  // Solo buscar el código postal si hay un ID válido
  if (coloniaIdRaw) {
    // Obtener código postal de la colonia seleccionada
    // Ahora manejamos tanto IDs numéricos como IDs temporales con formato string
    const colonia = opciones.value.colonias.find(c => String(c.idMunicipio) === String(coloniaIdRaw));
    console.log('Colonia encontrada:', colonia);
    
    if (colonia) {
      codigoPostal.value = colonia.CodigoPostal;
      domicilio.codigoPostal = colonia.CodigoPostal; // <-- Esto asegura que se incluya en la dirección
      console.log('Código postal asignado:', colonia.CodigoPostal);
      
      // Guardar la colonia completa para usarla en la construcción de la dirección
      selectedColoniaObj.value = colonia;
      console.log('Objeto de colonia guardado:', selectedColoniaObj.value);
    } else {
      console.warn('No se encontró la colonia con ID:', coloniaIdRaw);
      selectedColoniaObj.value = null;
    }
  } else {
    // Si no hay colonia seleccionada, limpiar el código postal
    codigoPostal.value = '';
    domicilio.codigoPostal = '';
    selectedColoniaObj.value = null;
    console.log('Código postal limpiado por no tener colonia seleccionada');
  }
  
  // Forzar la actualización del valor seleccionado
  setTimeout(() => {
    const selectElement = document.getElementById('colonia');
    if (selectElement && selectElement.value !== String(coloniaIdRaw)) {
      console.log('Valor actual en select:', selectElement.value, 'Forzando a:', coloniaIdRaw);
      selectElement.value = coloniaIdRaw;
    }
  }, 0);
}

// Método para activar la cámara para foto del puerto
const tomarFotoPuerto = () => {
  // Verificar si el navegador soporta la API de cámara
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Activar el input file que abrirá la cámara
    inputFotoPuerto.value.click()
  } else {
    alert('Tu dispositivo no soporta el acceso a la cámara')
  }
}

// Método para procesar la foto del puerto tomada
const procesarFotoPuerto = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Crear un objeto URL para la vista previa
    terminal.fotoPuerto = URL.createObjectURL(file)
    terminal.tieneFotoPuerto = true
    
    // Convertir la imagen a base64 para almacenarla
    convertirFileABase64(file, (base64) => {
      // Guardar la imagen en base64 para enviarla al servidor
      terminal.fotoPuertoBase64 = base64
      console.log('Foto puerto convertida a base64')
    })
  }
}

// Donde se genera Fecha_Coordiapp:
const fechaMonterrey = dayjs().tz('America/Monterrey').format('YYYY-MM-DD HH:mm:ss')
// Usar fechaMonterrey en lugar de new Date().toISOString().slice(0, 19).replace('T', ' ')
// Ejemplo:
// Fecha_Coordiapp: fechaMonterrey

// --- WEBCAM MULTIUSO PARA FOTOS ---
const webcamModalVisible = ref(false)
const webcamVideo = ref(null)
const webcamCanvas = ref(null)
const webcamStream = ref(null)
const webcamError = ref('')
const webcamFotoTipo = ref('') // 'fachada', 'os', 'ont', 'serieONT', 'terminal'

const soporteWebcam = typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

const webcamContainer = ref(null)

function abrirWebcamModal(tipo) {
  webcamError.value = ''
  webcamFotoTipo.value = tipo
  webcamModalVisible.value = true
  nextTick(() => {
    iniciarWebcam()
    // Scroll automático al contenedor de la cámara
    if (webcamContainer.value) {
      webcamContainer.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

async function iniciarWebcam() {
  try {
    if (webcamVideo.value) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      webcamVideo.value.srcObject = stream
      webcamStream.value = stream
    }
  } catch (e) {
    webcamError.value = 'No se pudo acceder a la cámara: ' + e.message
  }
}

function cerrarWebcamModal() {
  webcamModalVisible.value = false
  detenerWebcam()
}

function detenerWebcam() {
  if (webcamStream.value) {
    webcamStream.value.getTracks().forEach(track => track.stop())
    webcamStream.value = null
  }
}

function capturarFotoWebcam() {
  if (!webcamVideo.value || !webcamCanvas.value) return
  const video = webcamVideo.value
  const canvas = webcamCanvas.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  const base64 = canvas.toDataURL('image/jpeg')
  // Asignar la foto al campo correspondiente
  switch (webcamFotoTipo.value) {
    case 'fachada':
      domicilio.fotoFachada = base64
      domicilio.fotoFachadaBase64 = base64
      domicilio.tieneFoto = true
      // Disparar validación reactiva
      actualizarEstadoBotonGuardar && actualizarEstadoBotonGuardar()
      break
    case 'os':
      servicio.fotoOS = base64
      servicio.fotoOSBase64 = base64
      servicio.tieneFotoOS = true
      break
    case 'ont':
      ont.fotoONT = base64
      ont.fotoONTBase64 = base64
      ont.tieneFotoONT = true
      break
    case 'serieONT':
      ont.fotoSerieONT = base64
      ont.fotoSerieONTBase64 = base64
      ont.tieneFotoSerieONT = true
      break
    case 'terminal':
      terminal.fotoTerminal = base64
      terminal.fotoTerminalBase64 = base64
      terminal.tieneFotoTerminal = true
      break
  }
  cerrarWebcamModal()
}

onUnmounted(() => {
  detenerWebcam()
})
// --- FIN WEBCAM MULTIUSO ---

// --- GEOLOCALIZACIÓN ---
const locationModalVisible = ref(false)
const locationError = ref('')
const solicitandoPermisos = ref(false)

// Función para verificar permisos de ubicación
const verificarPermisosUbicacion = async () => {
  if (!navigator.geolocation) return false
  
  try {
    if (navigator.permissions) {
      const status = await navigator.permissions.query({ name: 'geolocation' })
      return status.state === 'granted'
    }
    // Fallback: intentar obtener coordenadas directamente
    await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 1000 })
    })
    return true
  } catch (error) {
    return false
  }
}

// Función para obtener coordenadas actuales
const obtenerCoordenadasActuales = () => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout'))
    }, 5000)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout)
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        clearTimeout(timeout)
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  })
}

const solicitarPermisosUbicacion = async () => {
  solicitandoPermisos.value = true
  locationError.value = ''
  
  try {
    const coordenadas = await obtenerCoordenadasActuales()
    
    // Actualizar coordenadas según el paso
    if (pasoSeleccionado.value === 'terminal') {
      terminal.latitud = coordenadas.latitude
      terminal.longitud = coordenadas.longitude
    } else {
      latitudValidacion.value = coordenadas.latitude
      longitudValidacion.value = coordenadas.longitude
    }
    
    cerrarLocationModal()
    
    // Continuar con el flujo
    if (pasoActual.value === 1) {
      siguientePaso()
    } else {
      guardarPaso()
    }
    
  } catch (error) {
    console.error('Error al obtener ubicación:', error)
    locationError.value = 'Error al obtener ubicación. Verifica que el GPS esté activado.'
  } finally {
    solicitandoPermisos.value = false
  }
}

const cerrarLocationModal = () => {
  locationModalVisible.value = false
  locationError.value = ''
  solicitandoPermisos.value = false
}

const abrirLocationModal = () => {
  locationError.value = ''
  locationModalVisible.value = true
}
// --- FIN GEOLOCALIZACIÓN ---
</script>

<style scoped>
/* Variables locales */
:root {
  --primary-dark: #083378; /* Versión más oscura del color primario */
  --border-color: #e0e0e0;
}

/* Spinner de carga */
.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner-container {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #a3ca38;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.spinner-text {
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (prefers-color-scheme: dark) {
  :root {
    --primary-dark: #5d99d6; /* Versión más oscura del color primario en modo oscuro */
    --border-color: #444444;
  }
}

.nuevo-registro-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  overflow-y: auto;
  min-height: 100vh;
  height: 100vh;
}

.titulo {
  text-align: center;
  margin-bottom: 30px;
  color: var(--primary);
}

/* Estilos para el indicador de pasos */
.pasos-indicador {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.paso {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.paso-numero {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: background-color 0.3s;
}

.paso.activo .paso-numero {
  background-color: var(--primary);
  color: white;
}

.paso-texto {
  font-size: 14px;
  color: #666;
}

.paso.activo .paso-texto {
  color: var(--primary);
  font-weight: bold;
}

.linea-conexion {
  flex-grow: 1;
  height: 2px;
  background-color: #e0e0e0;
  margin: 0 10px;
  max-width: 80px;
}

/* Estilos para el contenedor de pasos */
.pasos-contenedor {
  margin-top: 20px;
}

.paso-contenido {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Estilos para la tarjeta */
.tarjeta {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

/* Estilos para el formulario */
.campo-formulario {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus, select:focus {
  border-color: var(--primary);
  outline: none;
}

.select-estatus {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  color: #333;
  transition: border-color 0.3s ease;
}

.select-estatus:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.select-estatus option {
  padding: 8px;
  font-size: 16px;
}

/* Estilos para selects deshabilitados */
.select-estatus:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

/* Animación para los selects cuando se cargan las opciones */
.select-estatus.loading {
  opacity: 0.7;
  pointer-events: none;
}

.input-con-boton {
  display: flex;
  gap: 10px;
}

.input-con-boton input {
  flex-grow: 1;
}

.boton-validar {
  min-width: 100px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.boton-validar:hover:not(:disabled) {
  background-color: #0a3d8f;
}

.boton-validar:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.mensaje-error {
  color: #d32f2f;
  margin-top: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.mensaje-info {
  color: #1976d2;
  margin-top: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #e3f2fd;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 4px solid #1976d2;
}

/* Estilos para la información de la orden */
.resultado-validacion {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.info-orden {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.etiqueta {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.valor {
  font-size: 16px;
  font-weight: 500;
}

.estado-pendiente {
  color: #f57c00;
}

.estado-completado {
  color: #388e3c;
}

.estado-cancelado {
  color: #d32f2f;
}

/* Estilos para los botones de acción */
.acciones {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.boton-primario {
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.boton-primario:hover:not(:disabled) {
  background-color: #0a3d8f;
}

.boton-primario:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.boton-deshabilitado {
  background-color: #6c757d !important;
  color: #adb5bd !important;
  cursor: not-allowed !important;
  box-shadow: 0 2px 4px rgba(108, 117, 125, 0.3) !important;
}

.boton-deshabilitado:hover {
  background-color: #6c757d !important;
  transform: none !important;
}

.boton-procesando {
  background-color: #ffc107 !important;
  color: #212529 !important;
  cursor: not-allowed !important;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3) !important;
  position: relative;
}

.boton-procesando:hover {
  background-color: #ffc107 !important;
  transform: none !important;
}

.boton-procesando::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  margin: auto;
  border: 2px solid transparent;
  border-top-color: #212529;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.boton-secundario {
  background-color: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.boton-secundario:hover {
  background-color: #f5f5f5;
  color: #333;
}

.boton-prueba {
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.boton-prueba:hover:not(:disabled) {
  background-color: #f57c00;
}

.boton-prueba:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Estilos para el menú de pasos */
.menu-pasos {
  overflow-y: auto;
  max-height: 60vh;
}

.menu-titulo {
  text-align: center;
  margin-bottom: 20px;
}

.menu-descripcion {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.pasos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.paso-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.paso-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.paso-card.activo {
  border: 2px solid var(--primary);
}

.paso-icono {
  font-size: 24px;
  margin-bottom: 10px;
  color: var(--primary);
}

.paso-nombre {
  font-weight: 500;
  margin-bottom: 5px;
}

.paso-estado {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #e0e0e0;
  position: absolute;
  top: 10px;
  right: 10px;
}

.paso-estado.completado {
  background-color: #4caf50;
}

.paso-estado.activo {
  background-color: var(--primary);
}

/* Estilos para los detalles de cada paso */
.paso-detalle {
  animation: fadeIn 0.5s;
}

/* Estilos para textarea */
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.3s;
}

textarea:focus {
  border-color: var(--primary);
  outline: none;
}

/* Estilos para los botones del menú */
.acciones-menu {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

/* Estilos para la sección de foto de fachada */
.foto-fachada {
  margin-top: 20px;
}

.contenedor-foto {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.preview-foto {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.boton-foto {
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.boton-foto:hover {
  background-color: var(--primary-dark);
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .nuevo-registro-container {
    padding: 15px;
  }
  
  .pasos-indicador {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .linea-conexion {
    max-width: 40px;
  }
  
  .info-orden {
    grid-template-columns: 1fr;
  }
  
  .acciones, .acciones-menu {
    flex-direction: column-reverse;
    gap: 10px;
  }
  
  .acciones button, .acciones-menu button {
    width: 100%;
  }
  
  .pasos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .preview-foto {
    max-height: 150px;
  }
}

@media (max-width: 480px) {
  .pasos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .tarjeta, .paso-card {
    background-color: #1e1e1e;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .paso-card:hover {
    background-color: #2a2a2a;
  }
  
  input, select, .select-estatus, textarea {
    background-color: #333;
    border-color: #444;
    color: white;
  }
  
  .boton-secundario {
    border-color: #444;
    color: #aaa;
  }
  
  .boton-secundario:hover {
    background-color: #2a2a2a;
    color: white;
  }
  
  .etiqueta, .menu-descripcion {
    color: #aaa;
  }
  
  .paso-nombre {
    color: #eee;
  }
}

/* Estilos para indicadores de coordenadas */
.coordenada-cargando {
  color: #ff9800;
  font-weight: 500;
}

.coordenada-aproximadas {
  color: #2196f3;
  font-weight: 500;
}

.coordenada-precisas {
  color: #4caf50;
  font-weight: 500;
}

.coordenada-error {
  color: #f44336;
  font-weight: 500;
}

.precision-cargando {
  color: #ff9800;
  font-size: 14px;
}

.precision-aproximadas {
  color: #2196f3;
  font-size: 14px;
}

.precision-precisas {
  color: #4caf50;
  font-size: 14px;
}

.precision-error {
  color: #f44336;
  font-size: 14px;
}

.indicador-estado {
  margin-left: 8px;
  font-size: 12px;
  font-weight: normal;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.indicador-estado .fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Estilos para autocomplete */
.autocomplete-container {
  position: relative;
  width: 100%;
}

.autocomplete-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.autocomplete-input:focus {
  border-color: var(--primary);
  outline: none;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.autocomplete-option {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.autocomplete-option:hover {
  background-color: #f5f5f5;
}

.autocomplete-option:last-child {
  border-bottom: none;
}

.autocomplete-option.no-results {
  color: #666;
  font-style: italic;
  cursor: default;
}

.autocomplete-option.no-results:hover {
  background-color: transparent;
}

/* Estilos para modo oscuro */
@media (prefers-color-scheme: dark) {
  .autocomplete-dropdown {
    background-color: #333;
    border-color: #444;
    color: white;
  }
  
  .autocomplete-option {
    border-bottom-color: #444;
  }
  
  .autocomplete-option:hover {
    background-color: #2a2a2a;
  }
}

.os-folio-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
  font-size: 2rem;
  font-weight: bold;
  color: #2ecc71;
  gap: 18px;
}
.os-label {
  color: #fff;
  text-shadow: 1px 1px 4px #222;
}
.os-folio {
  color: #a3ca38;
  background: #222;
  border-radius: 8px;
  padding: 4px 18px;
  font-size: 2.2rem;
  letter-spacing: 2px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.paso-contenido-scroll {
  overflow-y: auto;
  max-height: 80vh;
}

.webcam-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #181818;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.25);
  padding: 20px 16px 16px 16px;
  margin-bottom: 16px;
  margin-top: 8px;
}
.webcam-title {
  margin-bottom: 10px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
}
.webcam-video {
  width: 320px;
  max-width: 90vw;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.35);
  background: #000;
  margin-bottom: 12px;
}
.webcam-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.camera-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.camera-modal-content {
  background: #222;
  padding: 24px 16px 16px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
  max-width: 95vw;
}
</style>