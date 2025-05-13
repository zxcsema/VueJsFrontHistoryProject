import './assets/main.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import App from './App.vue'
import Home from './pages/Home.vue'
import SneakerDetails from './pages/PersonDetails.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/sneakers/:id', name: 'sneakerDetails', component: SneakerDetails, props: true }, // Изменён маршрут
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.use(autoAnimatePlugin)
app.mount('#app')
