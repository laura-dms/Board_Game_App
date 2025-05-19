<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2>Your profile</h2>
      <p><strong>Username :</strong> {{ username }}</p>

      <form @submit.prevent="changePassword">
        <div class="form-group">
          <input
            type="password"
            v-model="currentPassword"
            placeholder="Current password"
            required
          />
        </div>

        <div class="form-group">
          <input
            type="password"
            v-model="newPassword"
            placeholder="New password"
            required
          />
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Updating...' : 'Update password' }}
        </button>

        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Profile",
  data() {
    return {
      username: "",
      currentPassword: "",
      newPassword: "",
      successMessage: "",
      errorMessage: "",
      isLoading: false,
    };
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      this.username = user.username;
    } else {
      this.$router.push("/login");
    }
  },
  methods: {
    async changePassword() {
      this.successMessage = "";
      this.errorMessage = "";
      this.isLoading = true;

      try {
        const response = await axios.post("http://localhost:3001/api/profile/change-password", {
          username: this.username,
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
        });

        if (response.data.success) {
          this.successMessage = response.data.message;
          this.currentPassword = "";
          this.newPassword = "";
        } else {
          this.errorMessage = response.data.message || "failed updating";
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "an error occurred";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f7fa;
}

.profile-card {
  background: white;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

input[type="password"] {
  width: 100%;
  padding: 10px 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  width: 100%;
  padding: 10px 12px;
  font-size: 16px;
  background-color: var(--jay);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  background-color: #8fbce9;
  cursor: wait;
}

.success-message {
  margin-top: 15px;
  color: green;
}

.error-message {
  margin-top: 15px;
  color: red;
}
</style>
