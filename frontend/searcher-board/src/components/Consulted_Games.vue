<template>
    <div id="game_consulted">
      <div v-if="games.length === 0"> <!-- if no consulted games are found, display a message -->
        <p>No games consulted yet !</p>
      </div>
      <div v-else id="gamebox" class="game-grid">
        <Gamebox
  v-for="game in games" 
  :key="game.ID_Game"
  :gameId="game.ID_Game"
  :title="game.Title"
  :poster="game.Poster"
  :description="game.Description"
/>
 <!-- display all the games -->
      </div>
    </div>
  </template>
  
<script>
import Gamebox from './Gamebox.vue';
import axios from 'axios'; // Import axios for making HTTP requests

export default {
  name: 'game_consulted',
  components: {
    Gamebox,
  },
  data() {
    return {
      games: [],
      loading: true,
      error: null,
    };
  },
  props: {
    userId: {
      type: Number, // Ou Number, selon le type de ton userId
      required: true, // Indique que cette prop est obligatoire
    },
  },
  async mounted() {
    try {
      // Fetch games clicked on by the user from your backend API

      const userData = localStorage.getItem('user');
      if (!userData) return;
      const { userId } = JSON.parse(userData);
      if (!userId) return;
    

      const response = await axios.get(`/api/user/${this.userId}/games/clicked`);
      this.games = response.data;
    } catch (error) {
      this.error = error.message;
      console.error('Error fetching clicked games:', error);
    } finally {
      this.loading = false;
    }
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
  