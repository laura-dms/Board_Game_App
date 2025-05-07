<template>
    <div id="headerdiv">
      <header class="header"> <!--set the header--> 
        <img src="../assets/logo.png" alt="Logo" class="logo" @click="redirectToHome()"/> <!--logo of the website-->
  
      </header>
    </div>
  </template>
  
  <script>

  
  export default {
  
    name: "Header",
    components: {
    },
    methods: {
      redirectToHome() {
        this.$router.push({ path: '/' }); // redirect to / page which is the home page
      }
    },
    computed: {
      isUserLoggedIn() {
        // check if user is logged in by getting user data from local storage
        return localStorage.getItem('user');
      }
    },
  }
  </script>
  <style scoped>
  .h1 {
    color: white;
    font-size: 2em;
  }
  
  .login-button {
    position: absolute;
    right: 80px;
    top: 20px;
  }
  
  .header {
    background: linear-gradient(135deg, #005eff, #2575fc); /* Default gradient */
    background-size: 200% 200%; /* Expand gradient for animation */
    animation: gradientMove 5s infinite alternate; /* Animation */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    padding: 20px;
    text-align: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
  }
  
  .logo {
    max-width: 150px; 
    cursor: pointer; /* clickable mouse effect */
    padding-right: 60px;
  }
  
  h1 {
    color: white;
    font-size: 2em;
    margin-top: 10px;
  }
  
  body {
    margin: 0;
  }
  </style>