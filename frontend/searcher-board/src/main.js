import { createApp } from 'vue';
import './style.css'
import App from './App.vue';
import router from '../router.js'; // Importez votre routeur

const app = createApp(App);
app.use(router); // Utilisez le routeur dans votre application
app.mount('#app');