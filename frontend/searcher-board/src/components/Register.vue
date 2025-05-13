<template>
  <div>
    <div class="register-page">
      <form @submit.prevent="handleRegister" class="register-form">
        <h2 class="title-register">Register</h2>
        <div class="form-group">
          <input
            id="username"
            v-model="username"
            placeholder="Choose a username"
            required
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Choose a password"
            required
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirm your password"
            required
          />
        </div>
        <div class="form-group">
          <button type="submit" class="register-button">Register</button>
        </div>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "Register",
  data() {
    return {
      username: "",
      password: "",
      confirmPassword: "",
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    async handleRegister() {
      if (this.password !== this.confirmPassword) {
        this.errorMessage = "Passwords do not match.";
        this.successMessage = "";
        return;
      }

      try {
        const response = await axios.post("http://localhost:3001/register", {
          Username: this.username,
          Password: this.password,
        });

        if (response.data.success) {
          this.successMessage = "Registration successful! You can now log in.";
          this.errorMessage = "";
          this.username = "";
          this.password = "";
          this.confirmPassword = "";
        } else {
          this.errorMessage = "Registration failed: " + response.data.message;
          this.successMessage = "";
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = "Registration failed: " + error.response.data.message;
        } else {
          this.errorMessage = "An error occurred during registration. Please try again.";
        }
        this.successMessage = "";
      }
    },
  },
};
</script>

<style scoped>
.register-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90vh;
  font-family: Arial, sans-serif;
}

.title-register {
  margin: 10px;
  color: #28a745;
}

.register-form {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 15px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.register-button {
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
}

.success-message {
  color: green;
  margin-top: 10px;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>
