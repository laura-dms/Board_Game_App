<template>
  <div>
    <div class="login-page">
      <form @submit.prevent="handleSubmit" class="login-form">
        <h2 class="title-login">Login</h2>
        <div class="form-group">
          <input
            id="username"
            v-model="username"
            placeholder="Enter your username"
            required
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <div class="form-group">
          <button type="submit" class="login-button">Login</button>
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
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    testClick() {
      console.log("Login button clicked (test)");
    },
    async handleSubmit() {
      console.log("Login button clicked"); // Log when the button is clicked
      try {
        console.log("Sending request to backend..."); // Log before sending the request
        const response = await axios.post("http://localhost:3001/api/login", {
          Username: this.username,
          Password: this.password,
        });

        console.log("Response from backend:", response); // Log the full response

        if (response.data.success) {
          console.log("Login successful:", response.data); // Log success response
          localStorage.setItem("user", JSON.stringify(response.data.username));
          this.successMessage = "Login successful! Redirecting to Find Game...";
          this.errorMessage = "";
          setTimeout(() => {
            this.$router.push("/gamepage"); // To match your router.js
          }, 2000);
        } else {
          console.log("Login failed:", response.data.message); // Log failure response
          this.errorMessage = "Login failed: " + response.data.message;
          this.successMessage = "";
        }
      } catch (error) {
        console.error("Error during login:", error); // Log error
        this.errorMessage = "An error occurred during login. Please try again.";
        this.successMessage = "";
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90vh;
  font-family: Arial, sans-serif;
}

.title-login {
  margin: 10px;
  color: #017bff;
}

.login-form {
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

.login-button {
  background-color: #017bff;
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