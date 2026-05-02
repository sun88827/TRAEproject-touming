<template>
  <div class="choice-buttons">
    <button
      v-for="choice in choices"
      :key="choice.id"
      type="button"
      class="choice-button"
      @click="emit('select', choice.id)"
    >
      {{ choice.text }}
    </button>
  </div>
</template>

<script setup lang="ts">
type Choice = {
  id: string
  text: string
}

defineProps<{
  choices: Choice[]
}>()

const emit = defineEmits<{
  (e: 'select', choiceId: string): void
}>()
</script>

<style scoped>
.choice-buttons {
  display: grid;
  gap: 10px;
}

.choice-button {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
}

.choice-button:hover {
  background: rgba(0, 0, 0, 0.6);
}

.choice-button:active {
  transform: translateY(1px);
}
</style>
