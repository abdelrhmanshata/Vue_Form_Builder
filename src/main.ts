import { createApp } from 'vue'
import vuetify from './plugins/vuetify'
import './style.css'
import App from './App.vue'

// import resizable from './directives/resizable_2'
// import { vResizable } from './directives/resizable'
import { vResizableSnap } from './directives/resizableSnap'


const app = createApp(App)
app.use(vuetify)
// app.directive('resizable', resizable)
// app.directive('resizable', vResizable)
app.directive('resizable-snap', vResizableSnap)
app.mount('#app')