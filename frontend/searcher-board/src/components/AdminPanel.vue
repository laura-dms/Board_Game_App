<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">Admin Panel - Utilisateurs</h1>
    
    <table class="w-full text-left border border-gray-300 shadow rounded-lg overflow-hidden">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-6 py-3 border">ID</th>
          <th class="px-6 py-3 border">username</th>
          <th class="px-6 py-3 border">role</th>
          <th class="px-6 py-3 border">action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.ID_User" class="hover:bg-gray-50 transition">
          <td class="px-6 py-3 border">{{ user.ID_User }}</td>
          <td class="px-6 py-3 border">{{ user.Username }}</td>
          <td class="px-6 py-3 border">{{ user.Role_User }}</td>
          <td class="px-6 py-3 border">
            <button
              class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              @click="deleteUser(user.ID_User)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-10">
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">game list</h2>
      <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto max-h-96 whitespace-pre-wrap">
<code v-for="game in games" :key="game.ID_Game">
ID: {{ game.ID_Game }} | name: {{ game.Name_Game }} | description: {{ game.Description_Game }} |
players: {{ game.Min_players_Game }}-{{ game.Max_players_Game }} | min age: {{ game.Min_age_Game }} |
playtime: {{ game.Playing_time_Game }} mins | year: {{ game.Year_published_Game }}

</code>
      </pre>
    </div>
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
    async deleteUser(userId) {
      if (!confirm('do you want to delete this user ?')) return;
      try {
        await axios.delete(`http://localhost:3001/api/users/${userId}`);
        this.users = this.users.filter(user => user.ID_User !== userId);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
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
