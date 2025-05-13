<template>
  <router-link :to="{ name: 'SingleGame', params: { id: gameId } }" class="game-box-link">
    <div class="game-box">
      <div class="game">
        <img :src="poster" alt="Game Poster" class="poster" :class="{ 'active-border': isFavorite }" />
        <div class="popup-star" :class="{ 'active-star': star === '⭐' }">{{ star }}</div>
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
    gameId: { type: [String, Number], required: true }, // Added gameId prop
    title: { type: String, default: 'Game Title' },
    poster: { type: String, default: 'https://placehold.co/600x400' },
    description: { type: String, default: 'Game Description' },
    isFavorite: { type: Boolean, default: false },
    star: { type: String, default: '☆' },
  },
  computed: {
    isLongTitle() {
      return this.title.length > 25;
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
  display: none;
  transition: 0.5s ease;
}

.game:hover .popup-star {
  display: block;
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