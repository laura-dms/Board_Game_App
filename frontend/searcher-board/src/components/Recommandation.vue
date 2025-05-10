<template>
  <div class="p-8 flex flex-col gap-8">
    <div class="bg-gray-100 p-6 rounded-xl flex flex-col w-full md:flex-row gap-8">
      <div class="flex-1">
        <h2 class="text-2xl font-semibold mb-4">Define your criteria</h2>
        <div class="space-y-4">
          <div v-for="(criterion, index) in criteria" :key="criterion.id" class="flex items-center gap-4">
            <div class="w-8 h-8 bg-black text-white flex items-center justify-center rounded text-lg font-bold">
              {{ index + 1 }}
            </div>
            <div class="flex flex-1 items-center gap-2">
              <select v-model="criteria[index].value" class="flex-1 p-2 rounded border">
                <option disabled value="">-- {{ criterion.label }} --</option>
                <option v-for="option in criterion.options" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="flex flex-col">
                <button @click="moveUp(index)" :disabled="index === 0" class="cursor-pointer text-lg">
                  ↑
                </button>
                <button @click="moveDown(index)" :disabled="index === criteria.length - 1" class="cursor-pointer text-lg">
                  ↓
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1">
        <h2 class="text-2xl font-semibold mb-4">Corresponding games</h2>
        <div style="display: flex; gap: 1rem;">
          <GameBox v-for="n in 3" :key="n" :title="`Game n°${n}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import GameBox from './GameBox.vue'
import { ref } from 'vue'

const criteria = ref([
  { id: 1, label: 'Theme', value: '', options: ['Fantasy', 'Sci-Fi', 'Mystery'] },
  { id: 2, label: 'Nb players', value: '', options: ['1', '2', '3+', '4+'] },
  { id: 3, label: 'Category', value: '', options: ['Strategy', 'Party', 'Family'] },
  { id: 4, label: 'Playtime', value: '', options: ['<30min', '30-60min', '>60min'] }
])

const moveUp = (index) => {
  if (index > 0) {
    const temp = criteria.value[index]
    criteria.value[index] = criteria.value[index - 1]
    criteria.value[index - 1] = temp
  }
}

const moveDown = (index) => {
  if (index < criteria.value.length - 1) {
    const temp = criteria.value[index]
    criteria.value[index] = criteria.value[index + 1]
    criteria.value[index + 1] = temp
  }
}
</script>

<style scoped>
select {
  min-width: 180px;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>