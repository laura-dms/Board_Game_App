<template>
  <div>
    <Navbar></Navbar>
    <div class="find-game-page">
      <h2>Find a Game</h2>
      <form @submit.prevent="handleSearch" class="find-game-form">
        <div class="form-group">
          <input
            v-model="searchQuery"
            placeholder="Enter game title"
            required
          />
        </div>
        <div class="form-group">
          <button type="submit" class="search-button">Search</button>
        </div>
      </form>
      <div v-if="game">
        <h3>Game Found:</h3>
        <p><strong>Title:</strong> {{ game.title }}</p>
        <p><strong>Description:</strong> {{ game.description }}</p>
      </div>
      <div v-else-if="searchPerformed">
        <p>No game found with the given title.</p>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from './Navbar.vue';

export default {
  name: "FindGame",
  components: {
    Navbar,
  },
  data() {
    return {
      searchQuery: "",
      game: null,
      searchPerformed: false,
      games: [
        {
          id: 1,
          title: "Le Seigneur des Anneaux",
          description: "Un jeu épique basé sur la célèbre trilogie.",
        },
        {
          id: 2,
          title: "Assassin's Creed",
          description: "Explorez l'histoire à travers les yeux d'un assassin.",
        },
      ],
    };
  },
  methods: {
    handleSearch() {
      this.game = this.games.find((g) =>
        g.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.searchPerformed = true;
    },
  },
};
</script>

<style scoped>
.find-game-page {
  padding: 20px;
  text-align: center;
}

.find-game-form {
  margin: 20px auto;
  max-width: 400px;
}

.search-button {
  background-color: #017bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
}
</style>