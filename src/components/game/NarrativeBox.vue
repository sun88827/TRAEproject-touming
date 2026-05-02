<template>
  <div class="narrative-box" role="button" tabindex="0" @click="onActivate" @keydown.enter.prevent="onActivate" @keydown.space.prevent="onActivate">
    <div v-if="speaker" class="speaker">{{ speaker }}</div>
    <div class="text">{{ displayedText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  speaker: string
  text: string
}>()

const emit = defineEmits<{
  (e: 'next'): void
}>()

const index = ref(0)
let timer: number | undefined

const stop = () => {
  if (timer != null) {
    window.clearInterval(timer)
    timer = undefined
  }
}

const start = () => {
  stop()
  if (!props.text) return
  timer = window.setInterval(() => {
    if (index.value >= props.text.length) {
      stop()
      return
    }
    index.value += 1
  }, 22)
}

watch(
  () => props.text,
  () => {
    index.value = 0
    start()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stop()
})

const displayedText = computed(() => props.text.slice(0, index.value))
const isFullyShown = computed(() => index.value >= props.text.length)

const onActivate = () => {
  if (!isFullyShown.value) {
    stop()
    index.value = props.text.length
    return
  }
  emit('next')
}
</script>

<style scoped>
.narrative-box {
  user-select: none;
  cursor: pointer;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  line-height: 1.5;
  outline: none;
}

.narrative-box:focus-visible {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35);
}

.speaker {
  font-weight: 700;
  margin-bottom: 6px;
}

.text {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
