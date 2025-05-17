<template>
    <div id="game_consulted">
      <div v-if="games.length === 0"> <!-- if no consulted games are found, display a message -->
        <p>No games consulted yet !</p>
      </div>
      <div v-else id="gamebox" class="game-grid">
        <Gamebox
          v-for="game in click_on_games" 
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
    name: 'game_consulted',
    components: {
      Gamebox,
    },
    data() {
    return {
      games: [],
      loading: true, // Add a loading state
      error: null,     // Add an error state
    };
    },
    props: {
        userId: { // Add a prop for the user ID.  Crucial for fetching the correct data.
        type: Number,
        required: true,
        },
    },
    async mounted() {
        try {
        // Fetch games clicked on by the user from your backend API
        const response = await axios.get(`/api/user/${this.userId}/games/clicked`); // 
        this.games = response.data;
        } catch (error) {
        this.error = error.message; // Store the error message
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
  