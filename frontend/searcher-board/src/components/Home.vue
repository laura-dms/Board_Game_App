<template>
  <title>CineClub</title>
  <Header></Header>
  <LoginButton class="login-button" v-if="!!!isUserLoggedIn" buttonText="Login" />
  <LoginButton class="login-button" v-else :buttonText="getuserName" />
  <ResearchBar @search="handleSearch" />
  <div id="welcome">
    <h1 id="title">{{ title }}</h1>
    <button id="navigationbar" @click="toggleFavorites">
      {{ showFavorites ? "All Games" : "My Favorites" }}
    </button>
  </div>
  <GamePage :games="allGames" />

  <Footer></Footer>
</template>

<script>
import Header from './Header.vue';
import Footer from './Footer.vue';
import GamePage from './GamePage.vue';
import ResearchBar from './ResearchBar.vue';
import LoginButton from './LoginButton.vue';

export default {
  name: 'Home',
  components: {
    Header,
    Footer,
    GamePage,
    ResearchBar,
    LoginButton,
  },
  data() {
    return {
      title: '',
      allGames: [ // Renommé allMovies en allGames
        {
          id: 1,
          title: "Le Seigneur des Anneaux",
          poster: "https://placehold.co/200x300/000000/FFFFFF/png?text=LOTR",
          description: "Un jeu épique basé sur la célèbre trilogie.",
          rating: 5,
          longdescription: "Le Seigneur des Anneaux : La Communauté de l'anneau est un film fantastique réalisé par Peter Jackson, sorti en 2001. Il est basé sur le premier volume du roman du même nom de J. R. R. Tolkien.",
        },
        {
          id: 2,
          title: "Assassin's Creed",
          poster: "https://placehold.co/200x300/8B4513/FFFFFF/png?text=AC",
          description: "Explorez l'histoire à travers les yeux d'un assassin.",
          rating: 4,
          longdescription: "Assassin's Creed est une série de jeux vidéo d'action-aventure en monde ouvert, développée principalement par Ubisoft Montréal et publiée par Ubisoft.",
        },
        {
          id: 3,
          title: "Super Mario Odyssey",
          poster: "https://placehold.co/200x300/FF0000/FFFFFF/png?text=Mario",
          description: "Rejoignez Mario dans une aventure autour du monde !",
          rating: 5,
          longdescription: "Super Mario Odyssey est un jeu de plateforme développé et édité par Nintendo pour la Nintendo Switch, sorti en 2017.",
        },
        {
          id: 4,
          title: "The Legend of Zelda",
          poster: "https://placehold.co/200x300/006400/FFFFFF/png?text=Zelda",
          description: "Partez à l'aventure dans un monde fantastique et sauvez la princesse.",
          rating: 4.5,
          longdescription: "The Legend of Zelda est une série de jeux vidéo d'action-aventure fantastique créée par Shigeru Miyamoto et Takashi Tezuka, développée et éditée principalement par Nintendo.",
        }
      ], // all movies from DB
      filteredMovies: [], // filtered movies from user query
      favoritesMovies: [], // favorites movies from user
      showFavorites: false,
    };
  },
  computed: {
    isUserLoggedIn() {
      return localStorage.getItem('user');
    },
    getuserName() {
      return JSON.parse(localStorage.getItem('user'));
    },
  },
  methods: {
    handleSearch(query) {
      let moviesToFilter;
      if (this.showFavorites) {
        moviesToFilter = this.favoritesMovies;
      } else {
        moviesToFilter = this.allGames; //
      }
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
        axios.get(`http://localhost:3000/api/user-favorites/${userId}`)
          .then(response => {
            console.log("API response:", response.data);
            this.favoritesMovies = response.data.movies;
            this.filteredMovies = this.favoritesMovies;
            this.showFavorites = true;
          })
          .catch(error => {
            console.error("error fetching favorites:", error);
          });
      } else {
        this.filteredMovies = this.allGames; // Et ici
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
    this.filteredMovies = this.allGames; // Et ici
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
