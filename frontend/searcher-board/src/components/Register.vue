<template>
  <div>
  <div class="register-page">
    <form @submit.prevent="handleRegister" class="register-form">
      <h2 class="title-register">Register</h2>
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
        <button type="submit" class="register-button">Register</button>
      </div>
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
    };
  },
  methods: {
    handleRegister() {
      axios
        .post("http://localhost:3001/register", {
          Username: this.username,
          Password: this.password,
        })
        .then(() => {
          alert("Registration successful!");
          this.$router.push('/login');
        })
        .catch((error) => {
          console.error("Error during registration:", error);
          alert("Registration failed. Please try again.");
        });
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
}

.title-register {
  margin: 10px;
  color: #017bff;
}

.register-form {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 15px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.register-button {
  background-color: #017bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
}
</style>
