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
        // Utiliser directement les clés fournies par le backend
        this.allGames = response.data.map((game) => ({
          id: game.id || null, // Utiliser game.id
          title: game.title || "No Title", // Utiliser game.title
          poster: game.poster || "https://placehold.co/200x300?text=No+Image", // Utiliser game.poster
          description: game.description || "No Description Available", // Utiliser game.description
        }));
        this.filteredGames = this.allGames; // Initially display all games
      } catch (error) {
        console.error("Error fetching games:", error);
        this.allGames = []; // S'assurer que c'est vide en cas d'erreur
        this.filteredGames = [];
      }
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
