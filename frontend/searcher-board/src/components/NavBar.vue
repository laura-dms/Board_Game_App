<template>
  <nav class="navbar">
    <ul class="nav-links">
      <li><router-link to="/">Home</router-link></li>
      <li v-if="!isUserLoggedIn"><router-link to="/login">Login</router-link></li>
      <li v-if="!isUserLoggedIn"><router-link to="/register">Register</router-link></li>
            <li v-if="!isUserLoggedIn"><router-link to="/GameRecommendationForm">Form</router-link></li>
      <li v-if="isUserLoggedIn"><router-link to="/find-game">Find Game</router-link></li>
      <li v-if="isUserLoggedIn" @click="logout"><a href="#">Logout</a></li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: "Navbar",
computed: {
  isUserLoggedIn() {
    // on ajoute this.$route comme dépendance implicite
    this.$route;
    return !!localStorage.getItem("user");
  }
},

  methods: {
    logout() {
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.navbar {
  background-color: #017bff;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 15px;
  margin: 0;
  padding: 0;
}

.nav-links li {
  display: inline;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: bold;
}

.nav-links a:hover {
  text-decoration: underline;
}
</style>