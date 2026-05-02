import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { getByPath, isWritablePath, setByPath } from "../utils/validator.js";

const sceneModules = import.meta.glob("../data/scenes/*.{json,js}");

function normalizeScene(raw, sceneId) {
  const scene = raw && typeof raw === "object" ? raw : {};

  const narrative = Array.isArray(scene.narrative) ? scene.narrative.filter((x) => typeof x === "string") : null;
  if (!narrative || narrative.length === 0) {
    console.error(`[scene:${sceneId}] missing/invalid narrative, fallback applied`);
  }

  const choices = Array.isArray(scene.choices) ? scene.choices.filter((c) => c && typeof c === "object") : null;
  if (!choices || choices.length === 0) {
    console.error(`[scene:${sceneId}] missing/invalid choices, fallback applied`);
  }

  return {
    id: typeof scene.id === "string" ? scene.id : sceneId,
    narrative: narrative && narrative.length ? narrative : [""],
    choices: choices && choices.length ? choices : [],
  };
}

function applyStatEffect(gameState, effect) {
  const target = effect?.target;
  const value = effect?.value;
  const mode = effect?.mode;

  if (!isWritablePath(target)) {
    console.error(`[effect] target not writable: ${String(target)}`);
    return;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    console.error(`[effect] invalid value for ${target}: ${String(value)}`);
    return;
  }

  if (mode === "set") {
    setByPath(gameState, target, value);
    return;
  }

  const cur = getByPath(gameState, target);
  if (typeof cur !== "number" || Number.isNaN(cur)) {
    console.error(`[effect] target is not numeric: ${target}`);
    return;
  }
  setByPath(gameState, target, cur + value);
}

export function useGameLogic() {
  const router = useRouter();

  const scene = ref(null);
  const narrativeIndex = ref(0);
  const phase = ref("narrative");

  const gameState = reactive({
    player: {
      mood: 0,
      energy: 0,
    },
  });

  const currentLine = computed(() => {
    const s = scene.value;
    if (!s) return "";
    return s.narrative[narrativeIndex.value] ?? "";
  });

  async function loadScene(sceneId) {
    const jsonPath = `../data/scenes/${sceneId}.json`;
    const jsPath = `../data/scenes/${sceneId}.js`;

    const loader = sceneModules[jsonPath] || sceneModules[jsPath];
    if (!loader) {
      console.error(`[scene] not found: ${sceneId}`);
      scene.value = normalizeScene(null, sceneId);
      narrativeIndex.value = 0;
      phase.value = "narrative";
      return;
    }

    let mod;
    try {
      mod = await loader();
    } catch (e) {
      console.error(`[scene] failed to load: ${sceneId}`, e);
      scene.value = normalizeScene(null, sceneId);
      narrativeIndex.value = 0;
      phase.value = "narrative";
      return;
    }

    const raw = mod?.default ?? mod;
    scene.value = normalizeScene(raw, sceneId);
    narrativeIndex.value = 0;
    phase.value = "narrative";
  }

  function advanceNarrative() {
    const s = scene.value;
    if (!s) return;

    if (narrativeIndex.value < s.narrative.length - 1) {
      narrativeIndex.value += 1;
      return;
    }

    phase.value = "choice";
  }

  async function makeChoice(choiceId) {
    const s = scene.value;
    if (!s || phase.value !== "choice") return;

    const choice = s.choices.find((c) => c.id === choiceId);
    if (!choice) {
      console.error(`[choice] not found: ${choiceId}`);
      return;
    }

    const effects = Array.isArray(choice.effects) ? choice.effects : [];
    for (const effect of effects) {
      if (effect?.type !== "stat") {
        console.error(`[effect] unsupported type: ${String(effect?.type)}`);
        continue;
      }
      applyStatEffect(gameState, effect);
    }

    const next = choice.next;
    if (next === "route_end") {
      await router.push("/end");
      return;
    }
    if (typeof next !== "string" || !next) {
      console.error(`[choice] missing/invalid next for choice: ${choiceId}`);
      return;
    }

    await loadScene(next);
  }

  return {
    gameState,
    scene,
    phase,
    narrativeIndex,
    currentLine,
    loadScene,
    advanceNarrative,
    makeChoice,
  };
}

