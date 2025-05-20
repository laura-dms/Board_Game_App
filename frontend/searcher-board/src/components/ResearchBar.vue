<template>
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search for a game..."
        @input="onSearch"
      /> <!-- input field for search query - call onSearch when input something -->
    </div>
  </template>
  
  <script>
  export default {
    name: "SearchBar",
    data() {
      return {
        searchQuery: "", // user query
      };
    },
    methods: {
      onSearch() {
        // emit event to parent component with search query
        this.$emit("search", this.searchQuery);
      },
    },
  };
  </script>
  
  <style scoped>
  .search-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
  }
  
  input {
    width: 100%;
    max-width: 400px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 20px;
    font-size: 1rem;
    box-sizing: border-box;
  }
  
  input:focus {
    outline: none;
    border-color: var(--thedarkone);
  }
  
  button {
    margin-left: 10px;
    padding: 10px;
    background-color: var(--thedarkone);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  button:hover {
    background-color: var(--thedarkdevil);
  }
  </style>
  