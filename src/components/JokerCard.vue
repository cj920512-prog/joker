<template>
  <div
    class="joker-card"
    :class="[`rarity-${joker.rarity}`, { triggered: isTriggered }]"
    :id="`joker-${joker.id}`"
    :data-id="`joker-${joker.id}`"
  >
    <div class="joker-rarity-border" :class="`rarity-border-${joker.rarity}`"></div>
    <div class="joker-content">
      <div class="joker-art">{{ joker.art }}</div>
      <div class="joker-name">{{ joker.name }}</div>
      <div class="joker-effect-hint">{{ effectHint }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  joker: { type: Object, required: true },
  isTriggered: { type: Boolean, default: false },
})

const effectHint = computed(() => {
  const hints = {
    'per_hand_mult_4':  'Mult +4',
    'ace_mult_4':       'A×Mult+4',
    'heart_mult_x4':    '♥ Mult×4',
    'club_mult_x4':     '♣ Mult×4',
    'face_mult_x10':    'JQK Mult×10',
    'flush_mult_50':    '同花顺+50',
  }
  return hints[props.joker.effect] || ''
})
</script>

<style scoped>
.joker-card {
  width: 140px;
  height: 200px;
  background: linear-gradient(180deg, #fff8e1, #f7e9c4);
  border: 2px solid #1a0f24;
  border-radius: 10px;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.joker-card.triggered {
  transform: translateY(-18px) scale(1.15);
  box-shadow: 0 0 20px 8px rgba(255,200,87,.6);
}

/* 四角稀有度描边 */
.joker-rarity-border {
  position: absolute;
  inset: 0;
  border-radius: 9px;
  pointer-events: none;
  z-index: 2;
}

.rarity-border-common {
  box-shadow: inset 0 0 0 3px #6cb4d3;
}
.rarity-border-rare {
  box-shadow: inset 0 0 0 3px #e34b6f;
}
.rarity-border-legendary {
  box-shadow: inset 0 0 0 3px #b577ff;
}

.joker-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 12px 8px;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.joker-art {
  font-size: 48px;
  line-height: 1;
  text-align: center;
}

.joker-name {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #1a0f24;
  text-align: center;
  line-height: 1.3;
}

.joker-effect-hint {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #4a3060;
  text-align: center;
  line-height: 1.3;
  opacity: 0.8;
}
</style>
