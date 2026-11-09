import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { i18n } from './i18n'
import './styles/design-system.css'

const app = createApp(App).use(router).use(i18n)

// espera a rota inicial resolver para o App já escolher o layout certo
// (evita piscar header/footer na rota de embed)
router.isReady().then(() => app.mount('#app'))
