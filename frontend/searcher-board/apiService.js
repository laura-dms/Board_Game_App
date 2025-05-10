const BASE_URL = 'http://localhost:3000';

const apiService = {
    async getUsers() {
        const response = await fetch(`${BASE_URL}/users`, {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }
    },

    async getUsersID() {
        const response = await fetch(`${BASE_URL}/users/:id`, {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }
    },