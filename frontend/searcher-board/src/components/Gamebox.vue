<template>
  <div class="game-box">
    <img :src="poster || 'https://placehold.co/200x300?text=No+Image'" alt="Game Poster" class="poster" />
    <p class="game-title">{{ title || 'No Title' }}</p>
    <p class="game-description">{{ description || 'No Description Available' }}</p>
  </div>
</template>

<script>
export default {
  name: "GameBox",
  props: {
    title: { type: String, required: false, default: "No Title" },
    poster: { type: String, required: false, default: "https://placehold.co/200x300?text=No+Image" },
    description: { type: String, required: false, default: "No Description Available" },
  },
};
</script>

<style scoped>
.game-box {
  text-align: center;
  margin: 20px;
}

.poster {
  width: 200px;
  height: 300px;
  object-fit: cover;
  border-radius: 10px;
}

.game-title {
  font-weight: bold;
  margin-top: 10px;
}

.game-description {
  color: gray;
  font-size: 0.9rem;
}
</style>