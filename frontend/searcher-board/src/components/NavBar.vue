<template>
  <nav class="navbar">
    <ul class="nav-links">
      <li><router-link to="/"><img src="../../assets/Logo_SearcherBoard.svg" alt="Logo of the Website"></router-link></li>&emsp;&emsp;
      <li v-if="!isUserLoggedIn"><router-link to="/login">Login</router-link></li>
      <li v-if="!isUserLoggedIn"><router-link to="/register">Register</router-link></li>
      <li v-if="isUserLoggedIn"><router-link to="/GameRecommendationForm">Form</router-link></li>
      <li v-if="isUserLoggedIn"><router-link to="/find-game">Find Game</router-link></li>
      <li v-if="isUserLoggedIn"><router-link to="/history">Liked</router-link></li>
      <li v-if="isUserLoggedIn"><router-link to="/clicked-games">History</router-link></li>
      <li v-if="isUserLoggedIn && isuserAdmin"><router-link to="/admin">Admin Panel</router-link></li>
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
    },
    isuserAdmin() {
        const userString = localStorage.getItem("user");
        if (!userString) {
          this.error = "user non connecté";
          this.isLoading = false;
          return;
        }
        
        const user = JSON.parse(userString);
      
      if (user.role == "Admin") {
        return true;
      } else if (user.admin == "User") {
        return false;
      }
      return false;
    },
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
img{
  position: absolute;
  width: 3%;
  height: auto;
  translate: -17% -25%;
  transition: all 0.3s ease;
}

img:hover {
  transform: scale(1.1);
}

.navbar {
  background-color: var(--primary);
  padding: 15px 15px;
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
