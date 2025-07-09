# Migración CoordiApp: Android a Vue.js

## Resumen de la Migración

Este proyecto representa la migración completa de la aplicación móvil CoordiApp de Android (Kotlin) a una aplicación web moderna usando Vue.js 3, manteniendo la misma funcionalidad y integración con el backend Laravel.

## Estructura del Proyecto

```
Vue-Coordiapp/
├── src/
│   ├── api/
│   │   └── coordi.js          # Configuración de API con interceptores
│   ├── utils/
│   │   ├── imageUtils.js      # Utilidades para manejo de imágenes
│   │   └── validationUtils.js # Utilidades para validaciones
│   ├── views/
│   │   ├── Login.vue          # Página de login
│   │   ├── MenuPrincipal.vue  # Menú principal
│   │   ├── NuevoRegistro.vue  # Sistema de pasos de registro
│   │   ├── OrdenesCompletas.vue
│   │   ├── OrdenesIncompletas.vue
│   │   ├── Comparativo.vue
│   │   └── Inventario.vue
│   ├── router/
│   │   └── index.js           # Configuración de rutas
│   └── plugins/
│       └── fontawesome.js     # Configuración de iconos
├── vite.config.js             # Configuración de Vite con proxy
└── package.json               # Dependencias del proyecto
```

## Funcionalidades Implementadas

### 1. Sistema de Pasos de Registro
- **Paso 1: Validación** - Validación de folio PISA y teléfono
- **Paso 2: Domicilio** - Información de dirección y foto de fachada
- **Paso 3: Servicio** - Datos del servicio y foto de OS
- **Paso 4: ONT/Modem** - Información del equipo y fotos
- **Paso 5: Cliente** - Datos del cliente titular
- **Paso 6: Terminal** - Configuración de terminal y coordenadas GPS
- **Paso 7: Cobre** - Información del cableado (nuevo)

### 2. Características Principales
- ✅ **Geolocalización en tiempo real** - Captura automática de coordenadas GPS
- ✅ **Captura de fotos** - Integración con cámara del dispositivo
- ✅ **Validaciones robustas** - Validación de campos y archivos
- ✅ **Estado persistente** - Guardado automático del progreso
- ✅ **Navegación intuitiva** - Menú de pasos con indicadores visuales
- ✅ **Manejo de errores** - Interceptores de API y validaciones
- ✅ **Responsive design** - Adaptable a diferentes dispositivos

### 3. Integración con Laravel
- ✅ **API RESTful** - Comunicación completa con el backend
- ✅ **Autenticación** - Manejo de tokens y sesiones
- ✅ **Sincronización** - Estado de pasos sincronizado con el servidor
- ✅ **Manejo de errores** - Interceptores para errores de red y servidor

## Configuración del Entorno

### Requisitos
- Node.js 18+ 
- npm o yarn
- Backend Laravel funcionando en `https://api.ed-intra.com`

### Instalación
```bash
cd Vue-Coordiapp
npm install
```

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

## Configuración de la API

El archivo `src/api/coordi.js` incluye:

- **Interceptores de requests**: Agregan automáticamente tokens y ID del técnico
- **Interceptores de responses**: Manejan errores de autenticación y red
- **Timeout configurado**: 30 segundos para requests
- **Logging**: Registro de requests y responses para debugging

## Utilidades Implementadas

### imageUtils.js
- `convertFileToBase64()` - Conversión de imágenes a base64
- `compressImage()` - Compresión de imágenes antes del envío
- `validateImageFile()` - Validación de archivos de imagen
- `createPreviewURL()` / `revokePreviewURL()` - Manejo de URLs temporales

### validationUtils.js
- `validateMexicanPhone()` - Validación de teléfonos mexicanos
- `validateMexicanPostalCode()` - Validación de códigos postales
- `validatePisaFolio()` - Validación de folios PISA
- `validateCoordinates()` - Validación de coordenadas GPS
- `validateRequired()` - Validación de campos requeridos
- Funciones de formateo para teléfonos y códigos postales

## Diferencias con Android

### Mejoras Implementadas
1. **Interfaz más moderna** - Diseño responsive con Vue.js
2. **Mejor UX** - Navegación más intuitiva entre pasos
3. **Validaciones en tiempo real** - Feedback inmediato al usuario
4. **Manejo de errores mejorado** - Mensajes más claros y específicos
5. **Compresión de imágenes** - Optimización automática antes del envío
6. **PWA ready** - Preparado para instalación como aplicación

### Funcionalidades Mantenidas
- ✅ Misma estructura de pasos
- ✅ Mismos campos de datos
- ✅ Misma integración con Laravel
- ✅ Misma lógica de validación
- ✅ Mismo manejo de coordenadas GPS
- ✅ Misma captura de fotos

## Estructura de Datos

### Paso de Validación
```javascript
{
  folioPisa: string,
  telefono: string,
  estatus: string,
  latitud: number,
  longitud: number
}
```

### Paso de Domicilio
```javascript
{
  division: string,
  area: string,
  cope: string,
  estado: string,
  ciudad: string,
  colonia: string,
  calle: string,
  numero: string,
  codigoPostal: string,
  fotoFachada: File
}
```

### Paso de Servicio
```javascript
{
  distrito: string,
  tecnologia: string,
  metraje: string,
  tipoInstalacion: string,
  fotoOS: File
}
```

### Paso de ONT/Modem
```javascript
{
  ont: string,
  fotoONT: File,
  fotoSerieONT: File
}
```

### Paso de Cliente
```javascript
{
  nombreTitular: string,
  apellidoPaternoTitular: string,
  apellidoMaternoTitular: string,
  personaRecibe: string,
  telefonoCliente: string
}
```

### Paso de Terminal
```javascript
{
  puerto: number,
  terminalTexto: string,
  latitud: number,
  longitud: number,
  fotoTerminal: File
}
```

### Paso de Cobre (Nuevo)
```javascript
{
  tipoCobre: string,
  longitud: number,
  estado: string,
  fotoCobre: File
}
```

## Endpoints de la API

### Validación de Orden
```
GET /orden/{Folio_Pisa}
```

### Actualización de Datos
```
POST /actualizar
```

### Gestión de Pasos
```
POST /registro-pasos
GET /registro-pasos/{Folio_Pisa}
```

## Manejo de Errores

El sistema incluye manejo robusto de errores:

1. **Errores de red** - Mensajes informativos para problemas de conexión
2. **Errores de validación** - Feedback específico por campo
3. **Errores de servidor** - Manejo de códigos de estado HTTP
4. **Errores de autenticación** - Redirección automática al login
5. **Errores de archivos** - Validación de tipo y tamaño de imágenes

## Próximos Pasos

1. **Testing** - Implementar tests unitarios y de integración
2. **PWA** - Configurar service workers para funcionamiento offline
3. **Optimización** - Lazy loading de componentes y rutas
4. **Monitoreo** - Integración con herramientas de analytics
5. **Documentación** - Documentación técnica detallada

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

Este proyecto es propiedad de Enlace Digital y está destinado para uso interno. 