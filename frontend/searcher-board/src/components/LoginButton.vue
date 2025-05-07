<template>
    <button class="login-button" @click="redirectToRoute"> <!-- simple html button -->
      {{ buttonText }}
    </button>
  </template>
  
  <script>
  export default {
    name: "LoginButton",
    props: {
        buttonText: "Login",
    },
    methods: {
      redirectToRoute() {
        if (this.buttonText === "Login"){
        this.$router.push('/login'); // redirect to route /login
        }
        else if (this.buttonText === "My account"){
          this.$router.push('/account'); // redirect to route /account
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .login-button {
    background-color: white;
    color: #017bff;
    border: 2px solid #017bff;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 1em;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.5s, color 0.5s;
  }
  
  .login-button:hover {
    background-color: #017bff;
    color: white;
  }
  </style>
  