import { createRouter, createWebHashHistory } from 'vue-router'
import StoryPage from '../pages/StoryPage.vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** 'bare' renderiza sem header/footer (dashboard e embed: o mapa ocupa a tela) */
    layout?: 'default' | 'bare'
  }
}

// hash history: o github pages não tem fallback de spa, então deep links
// (/dashboard) só funcionam com a rota depois do '#', como no site me
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'story', component: StoryPage },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../pages/DashboardPage.vue'),
      meta: { layout: 'bare' },
    },
    {
      path: '/embed/mapa',
      name: 'embed-map',
      component: () => import('../pages/EmbedMapPage.vue'),
      meta: { layout: 'bare' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
