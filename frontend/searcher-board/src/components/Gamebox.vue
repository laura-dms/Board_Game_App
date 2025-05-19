<template>
  <router-link :to="{ name: 'SingleGame', params: { id: gameId } }" class="game-box-link">
    <div class="game-box" @click="clicked_game">
      <div class="game">
        <img :src="poster" alt="Game Poster" class="poster" :class="{ 'active-border': likedState }" />
        <div
          class="popup-star"
          :class="{ 'active-star': star === '⭐' }"
          @click.stop.prevent="handleLike"
        >
          {{ starState }}
        </div>
        <p :class="['game-title', isLongTitle ? 'multi-line' : 'single-line']">{{ title }}</p>
        <p class="game-description">{{ description }}</p>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'GameBox',
  props: {
    gameId: { type: [String, Number], required: true },
    title: { type: String, default: 'Game Title' },
    poster: { type: String, default: 'https://placehold.co/600x400' },
    description: { type: String, default: 'Game Description' },
    isFavorite: { type: Boolean, default: false },
    star: { type: String, default: '☆' },
  },
  data() {
    return {
      likedState: this.isFavorite,
      starState: this.star
    };
  },
  computed: {
    isLongTitle() {
      return this.title.length > 25;
    }
  },
  async created() {
    // Fetch the user's liked games on component creation
    const userData = localStorage.getItem('user');
    if (!userData) return;
    const { token } = JSON.parse(userData);
    if (!token) return;
    try {
      const response = await fetch('http://localhost:3001/api/users/me/likes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('API error:', text);
        return;
      }
      const data = await response.json();
      const likedIds = data.likedGameIds || [];
      this.likedState = likedIds.includes(Number(this.gameId));
      this.starState = this.likedState ? '⭐' : '☆';
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  },
  methods: {
    async clicked_game() {
      console.log("Test");
      // Add click to the database
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.warn("User ID is not available.  Cannot record click.");
          return;
        }

        await this.executeQuery(`
          INSERT INTO click_on (ID_User, ID_Game, Date_click)
          VALUES (?, ?, NOW())
        `, [userId, this.gameId]); 

        console.log("Click recorded in database.");

      } catch (error) {
        console.error("Error recording click:", error);
      }
    },
    async handleLike(event) {
      // Prevent the click from bubbling to clicked_game
      event.stopPropagation();
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Please log in for liking games');
        return;
      }
      const { token } = JSON.parse(userData);
      if (!token) {
        alert('Please log in for liking games');
        return;
      }
      try {
        const method = this.likedState ? 'DELETE' : 'POST';
        const response = await fetch({
          method,
          url: `http://localhost:3001/api/games/${this.gameId}/like`,
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          const text = await response.text();
          console.error('API error:', text);
          return;
        }
        const data = await response.json();
        const { liked } = data.liked;
        this.likedState = liked;
        this.starState = liked ? '⭐' : '☆';
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    }
  },
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