<template>
  <div>
    <!-- Section for Family Friendly Games -->
    <div v-if="familyFriendlyGames.length > 0" class="game-category-section">
      <h2>Family Friendly Games</h2>
      <GamePage :games="familyFriendlyGames" />
    </div>
    <div v-if="isLoadingFamilyFriendly" class="loading-message"><p>Loading family friendly games...</p></div>
    <div v-if="!isLoadingFamilyFriendly && errorFamilyFriendly" class="error-message"><p>Could not load family friendly games: {{ errorFamilyFriendly }}</p></div>
    <hr v-if="familyFriendlyGames.length > 0" />

    <!-- Section for Long Playing Games -->
    <div v-if="longPlayingGames.length > 0" class="game-category-section">
      <h2>Long Playing Games</h2>
      <GamePage :games="longPlayingGames" />
    </div>
    <div v-if="isLoadingLongPlaying" class="loading-message"><p>Loading long playing games...</p></div>
    <div v-if="!isLoadingLongPlaying && errorLongPlaying" class="error-message"><p>Could not load long playing games: {{ errorLongPlaying }}</p></div>
    <hr v-if="longPlayingGames.length > 0" />

    <!-- All Games Section with Search -->
    <div class="game-category-section">
      <h2>All Games</h2>
      <ResearchBar @search="handleSearch" />
      <div v-if="isLoadingAllGames" class="loading-message"><p>Loading all games...</p></div>
      <div v-if="!isLoadingAllGames && errorAllGames" class="error-message"><p>{{ errorAllGames }}</p></div>
      <GamePage v-if="!isLoadingAllGames && !errorAllGames" :games="filteredGames" />
    </div>

    <Footer></Footer>
  </div>
</template>

<script>
import Footer from './Footer.vue';
import GamePage from './GamePage.vue';
import ResearchBar from './ResearchBar.vue';
import axios from 'axios';

export default {
  name: "Home",
  components: {
    Footer,
    GamePage,
    ResearchBar,
  },
  data() {
    return {
      allGames: [], 
      filteredGames: [], 
      isLoadingAllGames: false,
      errorAllGames: null,

      familyFriendlyGames: [],
      isLoadingFamilyFriendly: false,
      errorFamilyFriendly: null,

      longPlayingGames: [],
      isLoadingLongPlaying: false,
      errorLongPlaying: null,
    };
  },
  methods: {
    async fetchGames() {
      this.isLoadingAllGames = true;
      this.errorAllGames = null;
      try {
        const response = await axios.get("http://localhost:3001/api/games");
        this.allGames = response.data.map((game) => ({
          id: game.id || null, 
          title: game.title || "No Title", 
          poster: game.poster || "https://placehold.co/200x300?text=No+Image", 
          description: game.description || "No Description Available", 
        }));
        this.filteredGames = this.allGames; 
      } catch (error) {
        console.error("Error fetching games:", error);
        this.errorAllGames = "Failed to load all games.";
        this.allGames = []; 
        this.filteredGames = [];
      }
      this.isLoadingAllGames = false;
    },
    async fetchFamilyFriendlyGames() {
      this.isLoadingFamilyFriendly = true;
      this.errorFamilyFriendly = null;
      try {
        const response = await axios.get("http://localhost:3001/api/games/family-friendly");
        // Backend already formats this data
        this.familyFriendlyGames = response.data;
      } catch (error) {
        console.error("Error fetching family friendly games:", error);
        this.errorFamilyFriendly = "Failed to load family friendly games.";
        this.familyFriendlyGames = [];
      }
      this.isLoadingFamilyFriendly = false;
    },
    async fetchLongPlayingGames() {
      this.isLoadingLongPlaying = true;
      this.errorLongPlaying = null;
      try {
        const response = await axios.get("http://localhost:3001/api/games/long-playing");
        // Backend already formats this data
        this.longPlayingGames = response.data;
      } catch (error) {
        console.error("Error fetching long playing games:", error);
        this.errorLongPlaying = "Failed to load long playing games.";
        this.longPlayingGames = [];
      }
      this.isLoadingLongPlaying = false;
    },
    handleSearch(query) {
      if (!query) {
        this.filteredGames = this.allGames;
        return;
      }
      this.filteredGames = this.allGames.filter((game) =>
        game.title.toLowerCase().includes(query.toLowerCase())
      );
    },
  },
  mounted() {
    this.fetchGames();
    this.fetchFamilyFriendlyGames();
    this.fetchLongPlayingGames();
  },
};
</script>

<style scoped>
.game-category-section {
  margin-bottom: 30px;
}
.game-category-section h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}
.loading-message p, .error-message p {
  text-align: center;
  margin: 20px;
  color: #666;
}
.error-message p { /* More specific selector for error message text */
  color: red;
}
hr {
  border: 0;
  height: 1px;
  background-color: #e0e0e0;
  margin: 30px 0;
}
/* The .game-grid style that was here is not directly used by Home.vue's template elements.
   GamePage.vue has its own .game-grid styling. */
</style>
