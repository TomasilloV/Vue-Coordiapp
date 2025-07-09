import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import FontAwesomeIcon from './plugins/fontawesome'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount('#app')