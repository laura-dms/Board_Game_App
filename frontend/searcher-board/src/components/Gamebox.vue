<template>
  <router-link :to="{ name: 'SingleGame', params: { id: gameId } }" class="game-box-link">
    <div class="game-box" @click="clicked_game">
      <div class="game">
        <img :src="poster" alt="Game Poster" class="poster" :class="{ 'active-border': likedState }" />
        <div
          class="popup-star"
          :class="{ 'active-star': likedState }"
          @click.stop.prevent="toggleLike"
        >
          {{ likedState ? '⭐' : '☆' }}
        </div>
        <p :class="['game-title', isLongTitle ? 'multi-line' : 'single-line']">{{ title }}</p>
        <p class="game-description">{{ description }}</p>
      </div>
    </div>
  </router-link>
</template>

<script>
import axios from 'axios';

export default {
  name: 'GameBox',
  props: {
    gameId: { type: [String, Number], required: true },
    title: { type: String, default: 'Game Title' },
    poster: { type: String, default: 'https://placehold.co/600x400' },
    description: { type: String, default: 'Game Description' }
  },
  data() {
    return {
      likedState: false
    };
  },
  computed: {
    isLongTitle() {
      return this.title.length > 25;
    }
  },
  async mounted() {
    await this.fetchUserLikes();
  },
  methods: {
    async fetchUserLikes() {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      const { userId } = JSON.parse(userData);
      if (!userId) return;

      try {
        const response = await axios.get(`http://localhost:3001/api/users/${userId}/likes`);
        const likedIds = response.data.likedGameIds || [];
        this.likedState = likedIds.includes(Number(this.gameId));
      } catch (error) {
        console.error('Erreur lors de la récupération des jeux likés :', error);
      }
    },

    async toggleLike() {
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Merci de vous connecter pour liker un jeu.');
        return;
      }
      const { userId } = JSON.parse(userData);
      if (!userId) {
        alert('Merci de vous connecter pour liker un jeu.');
        return;
      }

      const method = this.likedState ? 'delete' : 'post';

      try {
        if (method === 'post') {
          await axios.post(`http://localhost:3001/api/games/${this.gameId}/like`, {
            userId
          });
        } else {
          await axios.delete(`http://localhost:3001/api/games/${this.gameId}/like`, {
            data: { userId }
          });
        }
        this.likedState = !this.likedState;
      } catch (error) {
        console.error("Erreur lors du like/unlike du jeu :", error);
      }
    },

    async clicked_game() {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      const { userId } = JSON.parse(userData);
      if (!userId) return;

      try {
        await axios.post(`http://localhost:3001/api/games/clicked`, {
          userId,
          gameId: this.gameId
        });
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du clic :", error);
      }
    }
  }
};
</script>


<style scoped>
.game-box-link {
  text-decoration: none; /* Remove underline from link */
  color: inherit; /* Inherit text color */
  display: inline-block; /* Or block, depending on layout needs */
}

.game-box {
  text-align: center;
  margin: 20px;
  /* Ensure the box itself doesn't add extra link styling if not desired */
}

.game {
  position: relative;
  display: inline-block;
  text-align: left;
}

.poster {
  width: 200px;
  height: 300px;
  max-width: 100%;
  object-fit: cover;
  display: block;
  margin: 0 auto;
  transition: opacity 0.5s ease;
  border-radius: 10px;
  border: 3px solid black;
}

.game-title {
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translate(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px;
  width: 90%;
  text-align: center;
  z-index: 1;
  transition: opacity 0.5s ease;
}

.single-line {
  transform: translate(-50%); /* special case for short game title */
  border-radius: 10px;
}

.multi-line {
  transform: translate(-50%, -35%); /* special case for long game title */
  border-radius: 10px;
}

.game-description {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  width: 80%;
  text-align: center;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.game:hover .poster {
  opacity: 0.3;
}

.game:hover .game-title {
  opacity: 0;
  transition: opacity 0.5s ease;
}

.game:hover .game-description {
  opacity: 1;
  transition: opacity 0.5s ease;
}

.popup-star{
  display: block;
  transition: 0.5s ease;
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 36px;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  cursor: pointer;
  z-index: 2;
  user-select: none;
  transition: transform 0.5s ease, color 0.5s ease;
}

.game:hover .popup-star:hover {
  color: gold;
  transform: scale(1.5);
}

.game:hover .popup-star:active {
  transform: scale(1);
}

.game .poster.active-border {
  border: 3px solid gold;
}
</style>