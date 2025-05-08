<template>
    <div class="login-page">

      <form @submit.prevent="handleSubmit" class="login-form">
        <!--username field-->
        <h2 class="title-login">Account Login</h2>
        <div class="form-group">
          <input
            id="username"
            v-model="username"
            placeholder="Enter your username"
            required
          />
        </div>
  
        <!--password field-->
        <div class="form-group">
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>
  
        <!-- submit button -->
        <div class="form-group">
          <button type="submit" class="login-button">Login</button>
        </div>
  
        <p class="register-link">
          Don't have an account? <a href="/register" @click="redirectToRegister()">Register here</a>
        </p>
      </form>
    </div>
</template>
  
<script>

//import axios from 'axios';

export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    handleSubmit() {
       axios.post('http://localhost:3000/api/login', {
        username: this.username,
        password: this.password
      })
      .then(response => {
        if (response.data.success) {
          const userDataUsername = response.data.username; // get user data from response
          const userID = response.data.userID;
          console.log("userdata : " + userDataUsername + userID);
          localStorage.setItem('user', JSON.stringify(userDataUsername)); // using local storage to store user data
          localStorage.setItem('userId', JSON.stringify(userID));
          this.$router.push("/home"); // push to home page (with user being logged in)
        } else {
          alert("Login failed: " + response.data.message);
        }
      })
      .catch(error => {
        console.error("error in database:", error);
        alert("wrong username or password");
      });
    },
    redirectToRegister() {
      this.$router.push('/register'); // redirect to route /register
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
  margin: 0;
  font-family: Arial, sans-serif;
}

.title-login{
  margin: 10px;
  color: #d0afff
}


h1 {
  color: #017bff;
  font-size: 2rem;
  margin-bottom: 10px;
}

p {
  font-size: 1rem;
  color: #000000;
  margin-bottom: 20px;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 15px;
  background: linear-gradient(45deg, #7e1de5, #2575fc); /* Default gradient */
  background-size: 200% 200%; /* Expand gradient for animation */
  animation: gradientMove 5s infinite alternate; /* Animation */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  /*transition: 0.5s ease-in-out;*/
}

/*
.login-form:hover {
  scale: 1.05;
  transition: 0.5s ease-in-out;
}
*/

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  font-size: 1rem;
  color: #c9c9c9;
}

input {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  border-color: #017bff;
  border: 3px  #00ff11;
  outline: none;
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
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #0056b3;
}

.register-link {
  margin-top: 15px;
  font-size: 0.9rem;
}

.register-link a {
  color: #017bff;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>