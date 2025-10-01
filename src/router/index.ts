import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LandingView from '../views/LandingView.vue'
import ExampleView from '../views/ExampleView.vue'
import MapVisualiser from '../views/MapVisualiser.vue'
import CompaniesView from '../views/CompaniesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
  },
    {
      path: '/exemplo',
      name: 'exemplo',
      component: ExampleView,
    },
    {
      path: '/map',
      name: 'map_test',
      component: MapVisualiser
    },
    {
      path: '/empresas',
      name: 'companies',
      component: CompaniesView,
    }
  ],
})

export default router
