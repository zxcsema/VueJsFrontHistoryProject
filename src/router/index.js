import { createRouter, createWebHistory } from 'vue-router'
import Home from '../App.vue'
import PersonDetails from '@/pages/PersonDetails.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/perosn/:userID', component: PersonDetails }, // Маршрут с параметром userID
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
