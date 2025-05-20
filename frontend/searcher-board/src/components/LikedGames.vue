<template>
  <div class="activity-history-section">
    <h2>Your Liked Games</h2>

    <div v-if="isLoading">
      <p>Loading liked games...</p>
    </div>

    <div v-else-if="error">
      <p class="error-message">Could not load liked games: {{ error }}</p>
    </div>

    <div v-else-if="activityItems.length === 0">
      <p class="info-message">You haven't liked any games yet.</p>
    </div>

    <div v-else class="game-grid">
      <div v-for="(item, index) in activityItems" :key="item.activityDate + '-' + item.id + '-' + index" class="activity-item-container">
        <div class="activity-info">
          <p><strong>Liked Game</strong></p>
          <p><em>On: {{ formatDate(item.activityDate) }}</em></p>
        </div>
        <Gamebox
          :game-id="item.id"
          :title="item.title"
          :poster="item.poster"
          :description="item.description"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Gamebox from './Gamebox.vue';

export default {
  name: 'UserLikedGamesHistory',
  components: {
    Gamebox,
  },
  data() {
    return {
      activityItems: [],
      isLoading: false,
      error: null,
    };
  },
  methods: {
    async fetchActivityHistory() {
      this.isLoading = true;
      this.error = null;

      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          this.error = "User not connected. Please login.";
          this.isLoading = false;
          return;
        }
        
        const user = JSON.parse(userString);
        
        if (!user.userId) {
          this.error = "User ID not found. Please re-login.";
          this.isLoading = false;
          return;
        }
        
        const response = await axios.get(`http://localhost:3001/api/user/${user.userId}/activity`);

        this.activityItems = response.data.map((activity) => ({
          id: activity.GameID || null,
          title: activity.GameName || "No Title",
          poster: activity.GameThumbnail || "https://placehold.co/200x300?text=No+Image",
          description: activity.GameDescription || "No Description Available",
          activityType: activity.ActivityType,
          activityDate: activity.ActivityDate,
        }));

      } catch (err) {
        console.error("Error loading liked games history:", err);
        this.error = err.response?.data?.message || err.message || 'Unknown error occurred';
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  },
  mounted() {
    this.fetchActivityHistory();
  },
  activated() {
    this.fetchActivityHistory();
  },
};
</script>

<style scoped>
.activity-history-section h2 {
  text-align: center;
  margin-bottom: 20px;
}
.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); 
  gap: 20px;
  padding: 20px;
}

.activity-item-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  background-color: #f9f9f9;
}

.activity-info {
  text-align: center;
  margin-bottom: 10px;
  width: 100%;
}

.activity-info p {
  margin: 2px 0;
  font-size: 0.9em;
}

.activity-info strong {
  color: #007bff;
}

.error-message, .info-message {
  text-align: center;
  margin-top: 20px;
  padding: 10px;
}
.error-message {
  color: red;
  background-color: #fdd;
  border: 1px solid red;
}
.info-message {
  color: #555;
}
</style>
