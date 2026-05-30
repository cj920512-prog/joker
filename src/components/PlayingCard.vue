<template>
  <div
    class="playing-card"
    :class="{ selected: isSelected, highlighted: isHighlighted }"
    :data-id="card.id"
    :id="card.id"
    @click="$emit('click')"
  >
    <div class="card-inner">
      <div class="card-corner top-left">
        <div class="rank" :class="suitColor">{{ card.rank }}</div>
        <div class="suit-sm" :class="suitColor">{{ card.suit }}</div>
      </div>
      <div class="suit-center" :class="suitColor">{{ card.suit }}</div>
      <div class="card-corner bottom-right">
        <div class="rank" :class="suitColor">{{ card.rank }}</div>
        <div class="suit-sm" :class="suitColor">{{ card.suit }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  isHighlighted: { type: Boolean, default: false },
})

defineEmits(['click'])

const suitColor = computed(() => {
  return props.card.suit === '♥' || props.card.suit === '♦' ? 'red-suit' : 'black-suit'
})
</script>

<style scoped>
.playing-card {
  width: 100px;
  height: 145px;
  background: linear-gradient(180deg, #fff8e1, #f7e9c4);
  border: 2px solid #1a0f24;
  border-radius: 8px;
  box-shadow: 0 3px 0 rgba(0,0,0,.5);
  cursor: pointer;
  position: relative;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  flex-shrink: 0;
  user-select: none;
}

.playing-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 16px rgba(0,0,0,.4);
}

.playing-card.selected {
  transform: translateY(-28px);
  box-shadow: 0 6px 20px rgba(74,107,255,.6), 0 3px 0 rgba(0,0,0,.5);
}

.playing-card.highlighted {
  transform: translateY(-18px);
  box-shadow: 0 6px 24px rgba(77,214,255,.7), 0 3px 0 rgba(0,0,0,.5);
}

.card-inner {
  width: 100%;
  height: 100%;
  padding: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.card-corner {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.card-corner.bottom-right {
  align-self: flex-end;
  transform: rotate(180deg);
}

.rank {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
}

.suit-sm {
  font-size: 13px;
  line-height: 1;
  margin-top: 1px;
}

.suit-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  line-height: 1;
}

.red-suit {
  color: #e03030;
}

.black-suit {
  color: #1a1a2e;
}
</style>
