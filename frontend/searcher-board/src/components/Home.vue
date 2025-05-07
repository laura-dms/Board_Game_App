<template>
    <title>CineClub</title>
    <Header></Header> <!-- display the header -->
    <LoginButton class="login-button" v-if="!!!isUserLoggedIn" buttonText="Login"/> <!-- if user is not logged in, display login in button -->
    <LoginButton class="login-button" v-else :buttonText="getuserName"/> <!-- if he is logged in, display my account in button -->
    <ResearchBar @search="handleSearch" />
    <Gamebox
    title="Game Name"
    poster="https://placehold.co/200x300"
    description="Short description of the game"
    :isFavorite="false" star="☆" />
    <router-view /> <!-- display the content of the page -->
    <Footer></Footer>
  </template>
  
  <script>
  import Header from './Header.vue';
  import Footer from './Footer.vue';
  import Gamebox from './Gamebox.vue';
  import ResearchBar from './ResearchBar.vue';
  import LoginButton from './LoginButton.vue';
  
  export default {
    name: 'Home',
    components: {
        Header,
        Footer,
        Gamebox,
        ResearchBar,
        LoginButton,
    },
    data() {
        return {
          title: '', // welcome message
          allMovies: [], // all movies from DB
          filteredMovies: [], // filtered movies from user query
          favoritesMovies: [], // favorites movies from user
          showFavorites: false,
        };
    },
  
    computed: {
      isUserLoggedIn() {
        // check if user is logged in by getting user data from local storage
        return localStorage.getItem('user');
      },
      getuserName() {
      // get user name from local storage
      return JSON.parse(localStorage.getItem('user'));
    }
    },
  
    methods: {
      handleSearch(query) {
        let moviesToFilter; // not using const because it will be reassigned
        if (this.showFavorites) {
          moviesToFilter = this.favoritesMovies;
        } else {
          moviesToFilter = this.allMovies;
        } // if user is displaying favorites filter favorites else filter all movies
        this.filteredMovies = moviesToFilter.filter(movie =>
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
      },
  
  
      getUsername() {
        return JSON.parse(localStorage.getItem("user"));
      },
  
      toggleFavorites() {
        const userId = JSON.parse(localStorage.getItem("userId"));
  
        if (!this.showFavorites) {
          // display favorites
          axios.get(`http://localhost:3000/api/user-favorites/${userId}`)
            .then(response => {
              console.log("API response:", response.data);
              this.favoritesMovies = response.data.movies;
              this.filteredMovies = this.favoritesMovies; // display only favorites by passing in filtered, that will be passed to moviepage
              this.showFavorites = true;
            })
            .catch(error => {
              console.error("error fetching favorites:", error);
            });
        } else {
          // else display all movies
          this.filteredMovies = this.allMovies;
          this.showFavorites = false;
        }
      },
    },
  
    mounted() {
      if (this.isUserLoggedIn) {
        const user = localStorage.getItem('user');
        this.title = `Welcome to CineClub, ${JSON.parse(localStorage.getItem("user"))} !`;
      } else {
        this.title = 'Welcome to CineClub!';
      }
      // load all movies @ initialisation
      axios.get('http://localhost:3000/api/movies')
        .then(response => {
          this.allMovies = response.data;
          this.filteredMovies = this.allMovies; // display all movies at the start  
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des films:', error);
        });
    },
  };
  </script>
  
  
  <style scoped>
  #title {
    color: black;
    size: 20px;
    margin-top: 70px;
  }
  
  #headerdiv {
    margin-bottom: 30px;
  }
  
  #welcome {
    text-align: center;
    margin-top: 30px;
  }
  
  #navigationbar {
    margin-top: 20px;
    text-align: center;
  }
  
  .login-button {
    position: fixed;
    right: 60px;
    top: 20px;
    z-index: 1001;
  }
  </style>