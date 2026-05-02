<template>
  <div v-if="isOpen" class="debug-panel">
    <div class="debug-panel__header">
      <div class="debug-panel__title">Debug</div>
      <button class="debug-panel__btn" type="button" @click="isOpen = false">Close</button>
    </div>

    <div class="debug-panel__section">
      <div class="debug-panel__row">
        <label class="debug-panel__label">currentSceneId</label>
        <input class="debug-panel__input" v-model="sceneIdModel" />
        <button class="debug-panel__btn" type="button" @click="emitForceJump">Force Jump</button>
      </div>
    </div>

    <div class="debug-panel__section">
      <div class="debug-panel__subtitle">Player</div>

      <div class="debug-panel__row">
        <label class="debug-panel__label">mood</label>
        <input class="debug-panel__input" type="number" v-model.number="playerMoodModel" />
      </div>

      <div class="debug-panel__row">
        <label class="debug-panel__label">energy</label>
        <input class="debug-panel__input" type="number" v-model.number="playerEnergyModel" />
      </div>

      <div class="debug-panel__row">
        <label class="debug-panel__label">knowledge</label>
        <input class="debug-panel__input" type="number" v-model.number="playerKnowledgeModel" />
      </div>
    </div>

    <div class="debug-panel__section">
      <div class="debug-panel__subtitle">NPCs</div>

      <div v-if="npcList.length === 0" class="debug-panel__hint">No NPCs</div>

      <div v-for="(npc, idx) in npcList" :key="npcKey(npc, idx)" class="debug-panel__row">
        <label class="debug-panel__label">{{ npcLabel(npc, idx) }}</label>
        <input
          class="debug-panel__input"
          type="number"
          :value="npcRelationship(npc)"
          @input="onNpcRelationshipInput(idx, $event)"
        />
      </div>
    </div>

    <div class="debug-panel__section">
      <div class="debug-panel__row">
        <button class="debug-panel__btn" type="button" @click="onSave">保存（槽位1）</button>
        <button class="debug-panel__btn" type="button" :disabled="!canLoad" @click="onLoad">
          加载（槽位1）
        </button>
        <div class="debug-panel__status">{{ statusText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useSaveSystem } from '../../composables/useSaveSystem'

type AnyRecord = Record<string, any>

const props = withDefaults(
  defineProps<{
    currentSceneId?: string | number | null
    player?: AnyRecord
    npcs?: AnyRecord[] | null
  }>(),
  {
    currentSceneId: null,
    player: () => ({}),
    npcs: () => [],
  },
)

const emit = defineEmits<{
  (e: 'update:currentSceneId', value: string | number | null): void
  (e: 'update:player', value: AnyRecord): void
  (e: 'update:npcs', value: AnyRecord[]): void
  (e: 'force-jump', sceneId: string | number | null): void
}>()

const isOpen = ref(false)
const statusText = ref('')

const npcList = computed(() => props.npcs ?? [])

const sceneIdModel = computed({
  get: () => (props.currentSceneId ?? '').toString(),
  set: (v: string) => emit('update:currentSceneId', v),
})

function updateObjectPath(obj: AnyRecord, path: string[], value: any) {
  const next = { ...obj }
  let cursor: AnyRecord = next
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    const child = cursor[key]
    const nextChild = child && typeof child === 'object' ? { ...child } : {}
    cursor[key] = nextChild
    cursor = nextChild
  }
  cursor[path[path.length - 1]] = value
  return next
}

const playerMoodModel = computed({
  get: () => Number(props.player?.baseStats?.mood ?? 0),
  set: (v: number) => emit('update:player', updateObjectPath(props.player ?? {}, ['baseStats', 'mood'], v)),
})

const playerEnergyModel = computed({
  get: () => Number(props.player?.baseStats?.energy ?? 0),
  set: (v: number) => emit('update:player', updateObjectPath(props.player ?? {}, ['baseStats', 'energy'], v)),
})

const playerKnowledgeModel = computed({
  get: () => Number(props.player?.baseStats?.knowledge ?? 0),
  set: (v: number) =>
    emit('update:player', updateObjectPath(props.player ?? {}, ['baseStats', 'knowledge'], v)),
})

function npcKey(npc: AnyRecord, idx: number) {
  return npc?.id ?? npc?.key ?? idx
}

function npcLabel(npc: AnyRecord, idx: number) {
  return npc?.name ?? npc?.id ?? `npc_${idx}`
}

function npcRelationship(npc: AnyRecord) {
  return Number(npc?.relationship ?? 0)
}

function onNpcRelationshipInput(idx: number, e: Event) {
  const target = e.target as HTMLInputElement | null
  const val = target ? Number(target.value) : 0
  const next = npcList.value.map((n, i) => (i === idx ? { ...n, relationship: val } : n))
  emit('update:npcs', next)
}

function emitForceJump() {
  emit('force-jump', props.currentSceneId ?? sceneIdModel.value)
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if (target.isContentEditable) return true
  return false
}

function onKeydown(e: KeyboardEvent) {
  if (isEditableTarget(e.target)) return
  if (e.key === '`' || e.key === '~') {
    isOpen.value = !isOpen.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

const { saveGame, loadGame, hasSave } = useSaveSystem({
  getSaveData: () => ({
    currentSceneId: props.currentSceneId,
    player: props.player ? { baseStats: props.player.baseStats ?? {} } : {},
    npcs: npcList.value.map((n) => ({ id: n.id, name: n.name, relationship: n.relationship })),
  }),
  applySaveData: (data) => {
    if ('currentSceneId' in data) emit('update:currentSceneId', data.currentSceneId ?? null)
    if (data.player) emit('update:player', data.player)
    if (Array.isArray(data.npcs)) emit('update:npcs', data.npcs)
  },
})

const canLoad = computed(() => hasSave(1))

function onSave() {
  const ok = saveGame(1)
  statusText.value = ok ? '已保存' : '保存失败'
}

function onLoad() {
  const data = loadGame(1)
  statusText.value = data ? '已加载' : '加载失败'
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  top: 12px;
  right: 12px;
  width: 420px;
  max-height: calc(100vh - 24px);
  overflow: auto;
  background: rgba(20, 20, 20, 0.92);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 12px;
  z-index: 9999;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji",
    "Segoe UI Emoji";
  font-size: 12px;
}

.debug-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.debug-panel__title {
  font-weight: 700;
  letter-spacing: 0.3px;
}

.debug-panel__section {
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.debug-panel__subtitle {
  font-weight: 700;
  margin-bottom: 8px;
}

.debug-panel__row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
}

.debug-panel__label {
  width: 120px;
  color: rgba(255, 255, 255, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.debug-panel__input {
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  outline: none;
}

.debug-panel__btn {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
}

.debug-panel__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.debug-panel__hint {
  color: rgba(255, 255, 255, 0.6);
  padding: 4px 0;
}

.debug-panel__status {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
}
</style>
