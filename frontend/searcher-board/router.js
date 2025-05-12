import { createRouter, createWebHistory } from 'vue-router';
import Home from './src/components/Home.vue';
import Login from './src/components/Login.vue';
import Register from './src/components/Register.vue';
import FindGame from './src/components/FindGame.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/find-game', name: 'FindGame', component: FindGame },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;