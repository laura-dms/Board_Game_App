<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">Admin Panel - Utilisateurs</h1>
    
    <table class="w-full text-left border border-gray-300 shadow rounded-lg overflow-hidden">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-6 py-3 border">ID</th>
          <th class="px-6 py-3 border">username</th>
          <th class="px-6 py-3 border">role</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.ID_User" class="hover:bg-gray-50 transition">
          <td class="px-6 py-3 border">{{ user.ID_User }}</td>
          <td class="px-6 py-3 border">{{ user.Username }}</td>
          <td class="px-6 py-3 border">{{ user.Role_User }}</td>
          <td class="px-6 py-3 border">
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  name: 'AdminPanel',
  data() {
    return {
      users: [],
      games: [], 
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get('http://localhost:3001/api/users');
        this.users = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    },
    async fetchGames() {
      try {
        const response = await axios.get('http://localhost:3001/api/games');
        this.games = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des jeux:', error);
      }
    },
  },
  async mounted() {
    await this.fetchUsers();
    await this.fetchGames();
  },
  activated() {
    this.fetchUsers();
    this.fetchGames();
  },
};
</script>


<style scoped>
table {
  border-collapse: collapse;
}
th,
td {
  text-align: left;
}
</style>
