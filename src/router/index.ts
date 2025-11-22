import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LandingView from '../views/LandingView.vue'
import RoutesView from '../views/RoutesView.vue'
import MapVisualiser from '../views/MapVisualiser.vue'
import CompaniesView from '../views/CompaniesView.vue'
import CompanyDetailsView from '../components/CompanyDetailsView.vue'

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
      path: '/rotas',
      name: 'rotas',
      component: RoutesView,
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
    },
    {
      path: '/empresas/:id',
      name: 'company-details',
      component: CompanyDetailsView,
    }
  ],
})

// Dispatch a global event on each route change to allow components to react
router.afterEach((to, from) => {
  try {
    window.dispatchEvent(new CustomEvent('app-route-changed', { detail: { from: from && from.name ? from.name : null, to: to && to.name ? to.name : null } }));
  } catch (e) {
    // ignore (server-side rendering or non-browser env)
  }
});

export default router
