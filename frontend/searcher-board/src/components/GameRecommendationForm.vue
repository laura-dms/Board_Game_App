<template>
  <div>
    
    <div class="recommendation-form-page">
      <h2>Obtenir des Recommandations de Jeux</h2>
      <p>Classez les critères par importance (le plus haut est le plus important) et sélectionnez vos préférences.</p>

      <div class="criteria-list">
        <div v-for="(criterion, index) in criteria" :key="criterion.id" class="criterion-item">
          <div class="criterion-order">
            <button @click="moveUp(index)" :disabled="index === 0" aria-label="Monter le critère">↑</button>
            <span class="order-number">{{ index + 1 }}</span>
            <button @click="moveDown(index)" :disabled="index === criteria.length - 1" aria-label="Descendre le critère">↓</button>
          </div>
          <label :for="criterion.id" class="criterion-label">{{ criterion.label }}:</label>
          <div class="criterion-input">
            <input
              v-if="criterion.type === 'number'"
              type="number"
              v-model.number="criterion.value"
              :id="criterion.id"
              :placeholder="criterion.placeholder || 'Entrez une valeur'"
              class="form-input"
            />
            <select
              v-if="criterion.type === 'select'"
              v-model="criterion.value"
              :id="criterion.id"
              class="form-select"
            >
              <option value="">-- Sélectionner {{ criterion.label }} --</option>
              <option v-for="option in criterion.options" :key="option.value || option" :value="option.value || option">
                {{ option.text || option }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <button @click="fetchRecommendations" class="submit-button" :disabled="isLoading">
        {{ isLoading ? 'Recherche en cours...' : 'Obtenir les Recommandations' }}
      </button>

      <div v-if="recommendedGames.length > 0" class="results-section">
        <h3>Meilleures Recommandations :</h3>
        <div class="recommended-games-grid">
          <Gamebox
            v-for="game in recommendedGames"
            :key="game.id"
            :game-id="game.id"
            :title="game.title"
            :poster="game.poster"
            :description="game.description"
          />
        </div>
      </div>
      <div v-if="searchPerformed && recommendedGames.length === 0 && !isLoading" class="no-results">
        <p>Aucune recommandation trouvée pour vos critères. Essayez d'ajuster vos préférences.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import axios from 'axios'; // Importez axios
import Gamebox from './Gamebox.vue'; // Import Gamebox component

// Définition des critères initiaux
const criteria = ref([
  { id: 'category', label: 'Catégorie', value: '', type: 'select', options: [], order: 1, placeholder: 'Choisir une catégorie', apiEndpoint: 'categories', dbTable: 'Categories', dbNameField: 'Category_Name', dbIdField: 'ID_Category' },
  { id: 'mechanic', label: 'Mécanique', value: '', type: 'select', options: [], order: 2, placeholder: 'Choisir une mécanique', apiEndpoint: 'mechanics', dbTable: 'Mechanics', dbNameField: 'Mechanic_name', dbIdField: 'ID_Mechanics' },
  { id: 'minPlayers', label: 'Joueurs Min', value: null, type: 'number', order: 3, placeholder: 'Ex: 2', dbColumn: 'Min_players_Game' },
  { id: 'maxPlayers', label: 'Joueurs Max', value: null, type: 'number', order: 4, placeholder: 'Ex: 4', dbColumn: 'Max_players_Game' },
  { id: 'minAge', label: 'Âge Min', value: null, type: 'number', order: 5, placeholder: 'Ex: 8', dbColumn: 'Min_age_Game' },
  { id: 'playingTime', label: 'Temps de Jeu', value: '', type: 'select', options: [
      { value: '0-30', text: '< 30 min' },
      { value: '30-60', text: '30-60 min' },
      { value: '60-120', text: '60-120 min' },
      { value: '120+', text: '> 120 min' }
    ], order: 6, placeholder: 'Choisir un temps de jeu', dbColumn: 'Playing_time_Game' },
  { id: 'yearPublished', label: 'Année de Publication', value: null, type: 'number', order: 7, placeholder: 'Ex: 2020', dbColumn: 'Year_published_Game' },
]);

const recommendedGames = ref([]);
const isLoading = ref(false);
const searchPerformed = ref(false);

// --- Remplacement des simulations par de vrais appels API ---
async function fetchApiOptions(criterionConfig) {
  try {
    // Adaptez l'URL de l'API en fonction de votre configuration backend
    const response = await axios.get(`http://localhost:3001/api/${criterionConfig.apiEndpoint}`);
    // Assurez-vous que votre API retourne les données dans un format que vous pouvez mapper
    // à { value: 'ID', text: 'Name' }
    // Par exemple, si votre API pour les catégories retourne [{ ID_Category: 1, Category_Name: 'Stratégie' }, ...]
    return response.data.map(item => ({
      value: item[criterionConfig.dbIdField], // ex: item.ID_Category
      text: item[criterionConfig.dbNameField]  // ex: item.Category_Name
    }));
  } catch (error) {
    console.error(`Erreur lors de la récupération des options pour ${criterionConfig.label}:`, error);
    return []; // Retourner un tableau vide en cas d'erreur pour éviter de casser le select
  }
}

async function submitCriteriaForRecommendations(orderedCriteriaWithValues) {
  try {
    // Adaptez l'URL de l'API en fonction de votre configuration backend
    const response = await axios.post('http://localhost:3001/api/recommendations', {
      criteria: orderedCriteriaWithValues
    });
    // Le backend devrait retourner { recommendations: [{id, Name_Game, score, Thumbnail_Game, Description_Game}, ...] }
    return response.data.recommendations || [];
  } catch (error) {
    console.error('Erreur lors de la soumission des critères pour recommandations:', error);
    throw error; // Propagez l'erreur pour la gérer dans fetchRecommendations
  }
}
// --- Fin du remplacement des appels API ---

onMounted(async () => {
  isLoading.value = true;
  try {
    for (const criterion of criteria.value) {
      if (criterion.type === 'select' && criterion.apiEndpoint) {
        const options = await fetchApiOptions(criterion);
        criterion.options = options;
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des options initiales pour les critères:", error);
    // Gérer l'erreur, par exemple afficher un message à l'utilisateur
  } finally {
    isLoading.value = false;
  }
});

const moveUp = (index) => {
  if (index > 0) {
    const item = criteria.value.splice(index, 1)[0];
    criteria.value.splice(index - 1, 0, item);
    updateOrder();
  }
};

const moveDown = (index) => {
  if (index < criteria.value.length - 1) {
    const item = criteria.value.splice(index, 1)[0];
    criteria.value.splice(index + 1, 0, item);
    updateOrder();
  }
};

const updateOrder = () => {
  criteria.value.forEach((criterion, idx) => {
    criterion.order = idx + 1;
  });
};

const fetchRecommendations = async () => {
  isLoading.value = true;
  searchPerformed.value = true;
  recommendedGames.value = [];

  const activeCriteria = criteria.value
    .filter(c => c.value !== '' && c.value !== null && c.value !== undefined)
    .map(c => ({
      id: c.id, // L'identifiant du critère (ex: 'category', 'minPlayers')
      dbColumn: c.dbColumn || (c.dbTable ? `${c.dbTable}.${c.dbNameField}` : c.id), // Nom de la colonne BD ou identifiant pertinent pour le backend
      value: c.value, // La valeur sélectionnée/entrée par l'utilisateur
      order: c.order, // L'ordre d'importance
      type: c.type, // Le type de critère (select, number)
      label: c.label // Le libellé (peut être utile pour le backend)
    }));

  if (activeCriteria.length === 0) {
    isLoading.value = false;
    // Optionnel: afficher un message si aucun critère n'est sélectionné
    // recommendedGames.value = []; // déjà vide
    return;
  }

  try {
    const games = await submitCriteriaForRecommendations(activeCriteria);
    recommendedGames.value = games.map(game => ({
        id: game.ID_Game || game.id,
        title: game.Name_Game || game.title || "Jeu Inconnu",
        poster: game.Thumbnail_Game || game.poster || "https://via.placeholder.com/100x150?text=Pas+d'image",
        description: game.Description_Game || game.description || "Aucune description disponible.",
        score: game.score !== undefined ? game.score : "N/A",
    })).slice(0, 3); // S'assurer qu'on ne prend que les 3 meilleurs
  } catch (error) {
    console.error("Erreur lors de la récupération des recommandations:", error);
    recommendedGames.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Initialiser l'ordre au montage
updateOrder();
</script>

<style scoped>
.recommendation-form-page {
  padding: 20px;
  max-width: 900px;
  margin: 20px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f7f6;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.recommendation-form-page h2 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}
.recommendation-form-page > p {
  text-align: center;
  color: #555;
  margin-bottom: 25px;
}

.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 12px; /* Espace entre les items de critère */
  margin-bottom: 25px;
}

.criterion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s ease-in-out;
}
.criterion-item:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.08);
}

.criterion-order {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding-right: 12px;
  border-right: 1px solid #e0e0e0;
}

.criterion-order button {
  background-color: #e9ecef;
  color: #495057;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
  padding: 3px 7px;
  font-size: 14px;
  line-height: 1;
  transition: background-color 0.2s;
}
.criterion-order button:hover:not(:disabled) {
  background-color: #dee2e6;
}
.criterion-order button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.order-number {
  font-weight: bold;
  font-size: 1.1em;
  color: #007bff;
  min-width: 24px;
  text-align: center;
  padding: 2px 0;
}

.criterion-label {
  font-weight: 600;
  min-width: 150px; /* Ajustez pour l'alignement */
  flex-shrink: 0;
  color: #495057;
  font-size: 0.95em;
}

.criterion-input {
  flex-grow: 1;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 0.95em;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus,
.form-select:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.submit-button {
  display: block;
  width: 100%;
  padding: 12px 15px;
  background-color: #28a745; /* Vert pour l'action positive */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.submit-button:hover:not(:disabled) {
  background-color: #218838;
}
.submit-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.results-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}
.results-section h3 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.recommended-games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* Adjust minmax as needed for Gamebox size */
  gap: 20px;
}

.recommended-game-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.game-thumbnail {
  width: 120px; /* Taille fixe pour uniformité */
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 2px solid #eee;
}

.recommended-game-card h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1.15em;
  color: #007bff; /* Couleur titre jeu */
}

.recommended-game-card p {
  font-size: 0.9em;
  color: #555;
  margin-bottom: 5px;
}
.recommended-game-card p.game-description {
    font-size: 0.85em;
    color: #666;
    line-height: 1.4;
    max-height: 60px; /* Limite la hauteur de la description */
    overflow: hidden;
    text-overflow: ellipsis;
}

.no-results {
  text-align: center;
  margin-top: 25px;
  padding: 15px;
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  border-radius: 4px;
}
</style>