<template>
  <div class="single-game-page-container">
    <div v-if="isLoading" class="loading-indicator">Loading game details...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="game && !isLoading" class="game-details-container">
      <h1 class="game-title">{{ game.title }}</h1>
      <div class="game-content">
        <img :src="game.poster || 'https://placehold.co/300x450?text=No+Image'" :alt="game.title" class="game-poster-large"/>
        <div class="game-info">
          <p><strong>Description:</strong></p>
          <p>{{ game.description || 'No description available.' }}</p>
          
          <p v-if="game.Min_players_Game"><strong>Min Players:</strong> {{ game.Min_players_Game }}</p>
          <p v-if="game.Max_players_Game"><strong>Max Players:</strong> {{ game.Max_players_Game }}</p>
          <p v-if="game.Playing_time_Game"><strong>Playing Time:</strong> {{ game.Playing_time_Game }} minutes</p>
          <p v-if="game.Min_age_Game"><strong>Min Age:</strong> {{ game.Min_age_Game }}+</p>
          <p v-if="game.Year_published_Game"><strong>Year Published:</strong> {{ game.Year_published_Game }}</p>
          <p v-if="game.category"><strong>Category:</strong> {{ game.category || 'Not specified' }}</p>
          <p v-if="game.mechanics"><strong>Mechanics:</strong> {{ game.mechanics || 'Not specified' }}</p>
          
        </div>
      </div>
    </div>
    <div v-if="!game && !isLoading && !error" class="not-found">
      <p>Game not found.</p>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Navbar from './Navbar.vue';
import Footer from './Footer.vue';

const route = useRoute();
const game = ref(null);
const isLoading = ref(true);
const error = ref('');

const fetchGameDetails = async (gameId) => {
  isLoading.value = true;
  error.value = '';
  game.value = null;
  try {
    // The backend endpoint will be /api/games/:id
    const response = await axios.get(`http://localhost:3001/api/games/${gameId}`);
    game.value = response.data;
  } catch (err) {
    console.error("Error fetching game details:", err);
    if (err.response && err.response.status === 404) {
      error.value = 'Game not found.';
    } else {
      error.value = 'Failed to load game details. Please try again later.';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchGameDetails(route.params.id);
});

// Watch for route param changes if navigating between game pages
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchGameDetails(newId);
  }
});
</script>

<style scoped>
.single-game-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.game-details-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
}

.game-title {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
}

.game-content {
  display: flex;
  gap: 25px;
}

.game-poster-large {
  width: 300px;
  height: auto;
  max-height: 450px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.game-info {
  flex: 1;
}

.game-info p {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #555;
}

.game-info p strong {
  color: #333;
}

.loading-indicator, .error-message, .not-found {
  text-align: center;
  padding: 50px;
  font-size: 1.2em;
  color: #777;
  flex-grow: 1;
}

.error-message {
  color: red;
}
</style>