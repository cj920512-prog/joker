<template>
  <div class="joker-area">
    <div class="joker-area-header">
      <span class="area-title">JOKERS</span>
      <span class="area-count">{{ jokers.length }}/5</span>
    </div>
    <div class="joker-slots">
      <template v-for="slot in 5" :key="slot">
        <!-- 有 Joker 时 -->
        <JokerCard
          v-if="jokers[slot - 1]"
          :joker="jokers[slot - 1]"
          :isTriggered="triggeredJokerId === jokers[slot - 1].id"
        />
        <!-- 空槽 -->
        <div v-else class="joker-empty-slot">
          <div class="empty-plus">+</div>
          <div class="empty-label">空槽</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import JokerCard from './JokerCard.vue'

defineProps({
  jokers: { type: Array, default: () => [] },
  triggeredJokerId: { type: String, default: null },
})
</script>

<style scoped>
.joker-area {
  background: rgba(15,23,42,.6);
  border-bottom: 1px solid rgba(74,107,255,.15);
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 230px;
}

.joker-area-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.area-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: var(--gold);
}

.area-count {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  color: var(--muted);
}

.joker-slots {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(74,107,255,.2) transparent;
  padding-bottom: 4px;
  flex: 1;
}

.joker-empty-slot {
  width: 140px;
  height: 160px;
  border: 2px dashed rgba(100,120,200,.4);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
}

.empty-plus {
  font-size: 24px;
  color: var(--muted);
  opacity: 0.5;
  line-height: 1;
}

.empty-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--muted);
  opacity: 0.5;
}
</style>
