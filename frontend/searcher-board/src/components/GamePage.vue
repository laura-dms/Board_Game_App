<template>
  <div class="game-grid">
    <GameBox
      v-for="game in games"
      :key="game.id"
      :title="game.title"
      :poster="game.poster"
      :description="game.description"
    />
  </div>
</template>

<script>
import GameBox from './GameBox.vue';

export default {
  name: "GamePage",
  components: {
    GameBox,
  },
  props: {
    games: {
      type: Array,
      required: true,
    },
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
