<template>
  <div class="shop-screen">
    <div class="shop-header">
      <h2 class="shop-title">商店</h2>
      <p class="shop-subtitle">
        通关奖励已到账！金币
        <span class="coin-val">${{ totalCoins }}</span>
        · Joker 槽
        <span class="slot-val">{{ ownedJokers.length }}/5</span>
      </p>
    </div>

    <div class="shop-jokers">
      <div
        v-for="(joker, idx) in shopJokers"
        :key="joker.id"
        class="shop-joker-item"
        :class="{ sold: joker.sold, suggested: aiSuggestId === joker.id }"
      >
        <JokerCard :joker="joker" />
        <div class="joker-buy-area">
          <div class="joker-price">${{ joker.price }}</div>
          <button
            class="px-btn buy-btn"
            :class="buyBtnClass(joker)"
            :disabled="!canBuy(joker)"
            @click="$emit('buy', joker)"
          >
            {{ buyBtnLabel(joker) }}
          </button>
          <div v-if="aiSuggestId === joker.id" class="ai-suggest-badge">🤖 推荐</div>
        </div>
      </div>
    </div>

    <div class="shop-footer">
      <button class="px-btn skip" @click="$emit('skip')">跳过 →</button>
      <button class="px-btn ai" @click="$emit('ai-suggest')">🤖 AI 建议</button>
    </div>
  </div>
</template>

<script setup>
import JokerCard from './JokerCard.vue'

const props = defineProps({
  shopJokers: { type: Array, default: () => [] },
  ownedJokers: { type: Array, default: () => [] },
  totalCoins: { type: Number, default: 0 },
  aiSuggestId: { type: String, default: null },
})

defineEmits(['buy', 'skip', 'ai-suggest'])

function canBuy(joker) {
  if (joker.sold) return false
  if (props.totalCoins < joker.price) return false
  if (props.ownedJokers.length >= 5) return false
  return true
}

function buyBtnLabel(joker) {
  if (joker.sold) return '已售出'
  if (props.ownedJokers.length >= 5) return '槽满了'
  if (props.totalCoins < joker.price) return '钱不够'
  return `购买 $${joker.price}`
}

function buyBtnClass(joker) {
  if (joker.sold || props.ownedJokers.length >= 5 || props.totalCoins < joker.price) return 'ghost'
  return 'green'
}
</script>

<style scoped>
.shop-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 32px;
  padding: 40px;
}

.shop-header {
  text-align: center;
}

.shop-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: var(--gold);
  text-shadow: 2px 2px 0 rgba(0,0,0,.5);
  margin-bottom: 10px;
}

.shop-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: var(--text-dim);
}

.coin-val {
  color: var(--gold);
  font-weight: 800;
}

.slot-val {
  color: #a855f7;
  font-weight: 800;
}

.shop-jokers {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.shop-joker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: opacity 0.2s;
}

.shop-joker-item.sold {
  opacity: 0.4;
}

.shop-joker-item.suggested {
  filter: drop-shadow(0 0 12px rgba(255,200,87,.6));
}

.joker-buy-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.joker-price {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: var(--gold);
}

.buy-btn {
  min-height: 42px;
  padding: 10px 20px;
  font-size: 13px;
}

.ai-suggest-badge {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #ffc857;
  background: rgba(255,200,87,.15);
  border: 1px solid rgba(255,200,87,.4);
  border-radius: 8px;
  padding: 2px 10px;
}

.shop-footer {
  display: flex;
  gap: 16px;
}
</style>
