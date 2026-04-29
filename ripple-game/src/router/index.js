import { createRouter, createWebHistory } from 'vue-router'

import End from '../views/End.vue'
import Game from '../views/Game.vue'
import Home from '../views/Home.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/game', name: 'Game', component: Game },
    { path: '/end', name: 'End', component: End },
    { path: '/settings', name: 'Settings', component: Settings },
  ],
})

export default router
