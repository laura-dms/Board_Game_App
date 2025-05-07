import { createRouter, createWebHistory } from 'vue-router';
import Home from './src/components/Home.vue';
import Login from './src/components/Login.vue';
// importing all the components that will be used in the routes

const routes = [ // defining routes
  {
    path: '/', // base url
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login, 
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/starred',
    name: 'Starred',
    component: UserStarred,
  },
  {
    path: '/home',
    name: 'UserHome',
    component: Home,
  },
  {
    path: '/account',
    name: 'Account',
    component: Account,
  },
  {
    path: '/aboutus',
    name: 'AboutUs',
    component: AboutUs,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
