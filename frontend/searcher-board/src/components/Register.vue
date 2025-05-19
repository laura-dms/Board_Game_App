<template>
  <div>
    <div class="register-page">
      <form @submit.prevent="handleRegister" class="register-form">
        <h2 class="title-register">Register</h2>
        <div class="form-group">
          <input
            id="username"
            v-model="username"
            placeholder="Choose your username"
            required
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Choose your password"
            required
          />
        </div>
        <div class="form-group">
          <button type="submit" class="register-button" :disabled="isLoading">
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
        </div>


        <div class="form-group">
          <p class="register-link">
            Already an account ?
            <router-link to="/login">Login here</router-link>
          </p>
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
      isLoading: false,
    };
  },
  methods: {
    async handleRegister() {

      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";

      try {
        const response = await axios.post("http://localhost:3001/register", {
          Username: this.username,
          Password: this.password,
        });

        if (response.data.success) {
          this.successMessage = "Registration successful! Redirecting to login...";

          this.username = "";
          this.password = "";
          this.confirmPassword = "";

          setTimeout(() => {
            this.$router.push({ name: "Login" });
          }, 1500);

        } else {
          // response.data.success est false
          this.errorMessage = "Registration failed: " + (response.data.message || "Unknown error");
          this.successMessage = "";
        }
      } catch (error) {
        if (error.response?.data?.message) {
          this.errorMessage = "Registration failed: " + error.response.data.message;
        } else {
          this.errorMessage = "An error occurred during registration. Please try again.";
          console.error("Registration error details:", error);
        }
        this.successMessage = "";
      } finally {
        this.isLoading = false;
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
  color: var(--jay);
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
  background-color: var(--jay);
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
