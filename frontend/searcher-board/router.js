import { createRouter, createWebHistory } from 'vue-router';
import Home from './src/components/Home.vue';
import Login from './src/components/Login.vue';
import Register from './src/components/Register.vue';
import FindGame from './src/components/FindGame.vue';
import GameRecommendationForm from './src/components/GameRecommendationForm.vue';
import SingleGamePage from './src/components/SingleGamePage.vue'; // Import the new component
import Profile from './src/components/Profile.vue'; // Import Profile component
import History from './src/components/LikedGames.vue';
import AdminPanel from './src/components/AdminPanel.vue'; // Import AdminPanel component
import ClickedGames from './src/components/ClickedGames.vue'; // Import ClickedGames component

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/find-game', name: 'FindGame', component: FindGame },
  { path: '/GameRecommendationForm', name: 'GameRecommendations', component: GameRecommendationForm },
  { path: '/game/:id', name: 'SingleGame', component: SingleGamePage, props: true }, // Add new route for single game
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/history', name: 'History', component: History},
  { path: '/admin', name: 'AdminPanel', component: AdminPanel }, // Add route for AdminPanel
  { path: '/clicked-games', name: 'ClickedGames', component: ClickedGames }, // Add route for ClickedGames
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;