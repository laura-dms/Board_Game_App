<template>
  <nav class="navbar">
    <ul class="nav-links">
      <li><router-link to="/">Home</router-link></li>
      <li v-if="!isUserLoggedIn"><router-link to="/login">Login</router-link></li>
      <li v-if="!isUserLoggedIn"><router-link to="/register">Register</router-link></li>
      <li v-if="isUserLoggedIn"><router-link to="/GameRecommendationForm">Form</router-link></li>
      <li v-if="isUserLoggedIn"><router-link to="/find-game">Find Game</router-link></li>
      <li v-if="isUserLoggedIn" @click="logout"><a href="#">Logout</a></li>
    </ul>
    <div class="user-info" v-if="isUserLoggedIn">
      <router-link to="/profile">{{ username }}</router-link>
    </div>
  </nav>
</template>


<script>
export default {
  name: "Navbar",
  computed: {
    isUserLoggedIn() {
      // Dépendance à la route pour forcer le recalcul lors d'une navigation
      this.$route;
      return !!localStorage.getItem("user");
    },
    username() {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          return JSON.parse(user).username || '';
        } catch (e) {
          console.error("Erreur de parsing du localStorage user:", e);
          return '';
        }
      }
      return '';
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

.user-info a {
  color: white;
  font-weight: bold;
  font-size: 1rem;
  text-decoration: none;
}

.user-info a:hover {
  text-decoration: underline;
}
</style>
