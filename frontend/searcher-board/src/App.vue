<template>
  <Header></Header>
  <router-view></router-view>
</template>


<script>
import Header from './components/Header.vue';

export default {
  name: 'App',
  components: { // all of our components, same we might delete some
    Header,
  },

  data() {
    return {
      actors: [] // probably not needed for final, used for checking & debugging
    };
  },

  mounted() { // probably not needed for final, used for checking & debugging
    axios.get('http://localhost:3000/api/actors')
      .then(response => {
        this.actors = response.data; // get API data
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des acteurs:', error);
      });
    }
};
</script>

<style>
body {
  overflow: scroll; /* allow scrolling */
}
::-webkit-scrollbar {
  display: none; /* hide the scrolling bar */
}
.home {
  color: black;
}
</style>  