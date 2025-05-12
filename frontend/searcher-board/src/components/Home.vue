<template>
  <div>
    <div>
      <ResearchBar @search="handleSearch" />
      <GamePage :games="filteredGames" />
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
      allGames: [], // Stores all games fetched from the backend
      filteredGames: [], // Stores games filtered by the search bar
    };
  },
  methods: {
    async fetchGames() {
      try {
        const response = await axios.get("http://localhost:3001/api/games");
        this.allGames = response.data.map((game) => ({
          id: game.ID_Game || null,
          title: game.Name_Game || "No Title",
          poster: game.Thumbnail_Game || "https://placehold.co/200x300?text=No+Image",
          description: game.Description_Game || "No Description Available",
        }));
        this.filteredGames = this.allGames; // Initially display all games
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    },
    handleSearch(query) {
      // Filter games based on the search query
      this.filteredGames = this.allGames.filter((game) =>
        game.title.toLowerCase().includes(query.toLowerCase())
      );
    },
  },
  mounted() {
    // Fetch games when the component is mounted
    this.fetchGames();
  },
};
</script>

<style scoped>
.game-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
}
</style>
