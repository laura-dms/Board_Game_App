<template>
  <div>
    <ResearchBar @search="handleSearch" />

    <div class="recommendations-section" v-if="!isLoadingRecommendations && !recommendationsError && recommendedGames.length > 0">
      <h2>For You</h2>
      <GamePage :games="recommendedGames" />
    </div>
     <div v-else-if="isLoadingRecommendations">
        <p>Loading recommendations...</p>
     </div>
      <div v-else-if="recommendedGames.length == 0">
        <p class="error-message">Start liking games to have personalized recommandations !</p>
     </div>
     <div v-else-if="recommendationsError">
        <p class="error-message">Could not load recommendations: {{ recommendationsError }}</p>
     </div>

     <hr/>

     <h2>All Games</h2>
    <div v-if="isLoadingAllGames">
        <p>Loading all games...</p>
    </div>
     <div v-else-if="allGamesError">
        <p class="error-message">Could not load games: {{ allGamesError }}</p>
     </div>
    <GamePage v-else :games="filteredGames" />

    <Footer></Footer>
  </div>
</template>

<script>
import Footer from './Footer.vue';
import GamePage from './GamePage.vue'; // Displays the main list of games
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
      // For All Games / Search
      allGames: [],
      filteredGames: [],
      isLoadingAllGames: false,
      allGamesError: null,

      // For Recommendations
      recommendedGames: [],
      isLoadingRecommendations: false,
      recommendationsError: null,
      // userId is not strictly needed here if you're using the username from localStorage
      // userId: 1,
    };
  },
  methods: {
    async fetchGames() {
      this.isLoadingAllGames = true;
      this.allGamesError = null;
      try {
        // Use the same endpoint as before for all games
        const response = await axios.get("http://localhost:3001/api/games");
        // Map data structure consistently - assuming backend returns ID_Game, Name_Game, etc. for ALL games
        this.allGames = response.data.map((game) => ({
          id: game.ID_Game || game.id || null, // Adjust based on actual API response keys for ALL games
          title: game.Name_Game || game.title || "No Title",
          poster: game.Thumbnail_Game || game.poster || "https://placehold.co/200x300?text=No+Image",
          description: game.Description_Game || game.description || "No Description Available",
        }));
        this.filteredGames = [...this.allGames]; // Initialize filtered list, use spread for new array reference
      } catch (error) {
        console.error("Error fetching all games:", error);
        this.allGamesError = error.message || 'Failed to load games';
      } finally {
          this.isLoadingAllGames = false;
      }
    },

    async fetchRecommendations() {
      this.isLoadingRecommendations = true;
      this.recommendationsError = null;
      this.recommendedGames = []; // Clear previous recommendations
    
      try {
        const userString = localStorage.getItem("user");
        const user = JSON.parse(userString);
      
        // Check if user object and username exist
        if (!user || !user.username) {
          this.recommendationsError = "Utilisateur non connecté.";
          console.warn("Attempted to fetch recommendations but user is not logged in.");
          return; // Stop execution if user is not logged in
        }
      
        console.log("Fetching recommendations for username:", user.username);
        
        // Make the API call to the backend recommendations endpoint - MODIFIED URL
        


        const response = await axios.get(`http://localhost:3001/recommendations/${user.username}`);
      
        console.log("Recommendations API response:", response.data);
      
        // --- IMPORTANT: Update this mapping based on the response from the SECOND endpoint ---
        // The second endpoint returns data with columns: ID_Game, Name_Game, Description_Game, Thumbnail_Game
        this.recommendedGames = response.data.map((game) => ({
          id: game.ID_Game || null,
          title: game.Name_Game || "No Title",
          poster: game.Thumbnail_Game || "https://placehold.co/200x300?text=No+Image",
          description: game.Description_Game || "No Description Available",
        }));
      
        // --- End of IMPORTANT section ---
      
        console.log("Mapped recommendations:", this.recommendedGames);
      
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        // Provide more specific error message if possible
        this.recommendationsError = err.response?.data?.error || err.message || 'Failed to load recommendations';
      } finally {
        this.isLoadingRecommendations = false;
      }
    },

    handleSearch(query) {
      if (!query) {
        this.filteredGames = [...this.allGames]; // Reset to all games if query is empty
      } else {
        this.filteredGames = this.allGames.filter((game) =>
          game.title.toLowerCase().includes(query.toLowerCase())
        );
      }
    },
  },
  mounted() {
    // Fetch both sets of data when the component mounts
    this.fetchGames();
    this.fetchRecommendations();
  },
};
</script>
<style scoped>
/* Keep existing styles */
.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Responsive grid */
  gap: 20px;
  padding: 20px;
}

/* Add styles for the recommendations section */
.recommendations-section {
  padding: 20px;
  margin-bottom: 20px;
}

.recommendations-section h2 {
 text-align: center;
 margin-bottom: 15px;
}

.recommendations-list {
  display: flex; /* Arrange items horizontally */
  overflow-x: auto; /* Enable horizontal scrolling */
  padding-bottom: 15px; /* Space for scrollbar */
  gap: 15px; /* Space between items */
}

.recommendation-item {
  flex: 0 0 auto; /* Prevent items from shrinking/growing */
  width: 150px; /* Fixed width for recommendation items */
  text-align: center;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  background-color: #f9f9f9;
  cursor: pointer; /* Indicate clickability if linking */
  transition: transform 0.2s ease-in-out;
}
.recommendation-item:hover {
    transform: translateY(-5px);
     box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.recommendation-poster {
  width: 100%;
  height: 200px; /* Fixed height */
  object-fit: cover; /* Cover the area, might crop */
  border-radius: 5px;
  margin-bottom: 8px;
}

.recommendation-title {
  font-size: 0.9rem;
  font-weight: bold;
  white-space: nowrap; /* Prevent title wrapping */
  overflow: hidden;
  text-overflow: ellipsis; /* Add ... for long titles */
}

hr {
    border: 0;
    height: 1px;
    background-color: #e0e0e0;
    margin: 30px 0;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
}

.error-message {
  color: red;
  text-align: center;
  margin: 20px;
}

/* Loading state text */
p {
    text-align: center;
    color: #666;
    margin: 20px;
}
</style>