<template>
    <div id="gamepage">
      <div v-if="games.length === 0"> <!-- if no games are found, display a message -->
        <p>No games found</p>
      </div>
      <div v-else id="gamebox" class="game-grid">
        <Gamebox
          v-for="game in games" 
          :key="game.id"
          :title="game.title"
          :poster="game.poster"
          :description="game.description"
          :rating="game.rating"
          :longdescription="game.longdescription"
        /> <!-- display all the games -->
      </div>
    </div>
  </template>
  
  <script>
  import Gamebox from './Gamebox.vue';
  
  export default {
    name: 'gamePage',
    components: {
      Gamebox,
    },
    props: {
      games: {
        type: Array,
        required: true,
      },
    },
  };
  </script>
  
  <style scoped>
  .game-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 4 games per row */
    gap: 100px; /* gap between games */
    padding: 20px;
  }
  </style>
  