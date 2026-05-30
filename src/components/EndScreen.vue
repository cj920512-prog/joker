<template>
  <div class="end-screen">
    <div class="end-content">
      <h1 :class="gameState === 'won' ? 'title-won' : 'title-lost'">
        {{ gameState === 'won' ? '🎉 通关全部！' : '💀 失败！' }}
      </h1>
      <p class="end-coins">最终金币：<span class="coin-val">${{ totalCoins }}</span></p>

      <div v-if="ownedJokers.length > 0" class="owned-jokers">
        <p class="joker-section-label">持有的 Joker</p>
        <div class="joker-list">
          <JokerCard v-for="j in ownedJokers" :key="j.id" :joker="j" />
        </div>
      </div>

      <button class="px-btn red restart-btn" @click="$emit('restart')">
        重新开始
      </button>
    </div>
  </div>
</template>

<script setup>
import JokerCard from './JokerCard.vue'

defineProps({
  gameState: { type: String, default: 'lost' },
  totalCoins: { type: Number, default: 0 },
  ownedJokers: { type: Array, default: () => [] },
})

defineEmits(['restart'])
</script>

<style scoped>
.end-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}

.end-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.title-won {
  font-family: 'Inter', sans-serif;
  font-size: 42px;
  font-weight: 900;
  color: #ffc857;
  text-shadow: 0 4px 16px rgba(255,200,87,.5);
}

.title-lost {
  font-family: 'Inter', sans-serif;
  font-size: 42px;
  font-weight: 900;
  color: #ef4444;
  text-shadow: 0 4px 16px rgba(239,68,68,.5);
}

.end-coins {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  color: var(--text-dim);
}

.coin-val {
  color: var(--gold);
  font-weight: 800;
  font-size: 22px;
}

.owned-jokers {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.joker-section-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 1px;
}

.joker-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.restart-btn {
  min-width: 200px;
  font-size: 14px;
}
</style>
