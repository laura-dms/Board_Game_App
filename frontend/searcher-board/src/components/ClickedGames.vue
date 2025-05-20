<template>
  <div class="clicked-games-section">
    <h2>Games You Clicked</h2>

    <div v-if="isLoading">
      <p>Loading clicked games...</p>
    </div>

    <div v-else-if="error">
      <p class="error-message">Could not load clicked games: {{ error }}</p>
    </div>

    <div v-else-if="clickedGames.length === 0">
      <p class="info-message">You haven't clicked on any games yet.</p>
    </div>

    <GamePage v-else :games="clickedGames" />
  </div>
</template>

<script>
import axios from 'axios';
import GamePage from './GamePage.vue';

export default {
  name: 'ClickedGames',
  components: {
    GamePage,
  },
  data() {
    return {
      clickedGames: [],
      isLoading: false,
      error: null,
    };
  },
  methods: {
    async fetchClickedGames() {
      this.isLoading = true;
      this.error = null;

      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          this.error = "user non connecté";
          this.isLoading = false;
          return;
        }
        
        const user = JSON.parse(userString);
        
        if (!user.userId) {
          this.error = "User ID undefined";
          this.isLoading = false;
          return;
        }
        
        const response = await axios.get(`http://localhost:3001/api/user/${user.userId}/games/clicked`);

        console.log("User ID:", user.id);
        console.log("Clicked games response:", response.data);

        this.clickedGames = response.data.map((game) => ({
          id: game.ID_Game || null,
          title: game.Name_Game || "No Title",
          poster: game.Thumbnail_Game || "https://placehold.co/200x300?text=No+Image",
          description: game.Description_Game || "No Description Available",
        }));

      } catch (err) {
        console.error("Erreur lors du chargement des jeux cliqués :", err);
        this.error = err.response?.data?.message || err.message || 'Erreur inconnue';
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    this.fetchClickedGames();
  },
    activated() {
    this.fetchClickedGames();
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
  