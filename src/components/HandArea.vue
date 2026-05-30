<template>
  <div class="hand-area">
    <!-- 标题行 -->
    <div class="hand-header">
      <span class="hand-title">手牌</span>
      <span class="hand-selected">已选 {{ selectedIds.length }} / 5 张</span>
    </div>

    <!-- 手牌行 -->
    <div class="hand-cards-row">
      <TransitionGroup name="card-deal" tag="div" class="cards-container" @enter="onCardEnter">
        <PlayingCard
          v-for="card in hand"
          :key="card.id"
          :card="card"
          :isSelected="selectedIds.includes(card.id)"
          @click="!isAnimating && $emit('toggle-select', card.id)"
        />
      </TransitionGroup>
    </div>

    <!-- 操作按钮行 -->
    <div class="action-row">
      <button
        class="px-btn green"
        :disabled="isAnimating || selectedIds.length === 0"
        @click="$emit('play')"
      >
        出牌 ({{ selectedIds.length }})
      </button>
      <button
        class="px-btn red"
        :disabled="isAnimating || selectedIds.length === 0 || discardsLeft <= 0"
        @click="$emit('discard')"
      >
        弃牌 ({{ discardsLeft }})
      </button>
      <button
        class="px-btn ghost"
        :disabled="isAnimating"
        @click="$emit('sort-rank')"
      >
        按点排序
      </button>
      <button
        class="px-btn ghost"
        :disabled="isAnimating"
        @click="$emit('sort-suit')"
      >
        按花排序
      </button>
      <button
        class="px-btn ai"
        :class="{ 'ai-thinking': aiThinking }"
        :disabled="isAnimating || aiThinking"
        @click="$emit('ai-play')"
      >
        <span>🤖</span>
        <span>{{ aiThinking ? '思考中...' : 'AI出牌' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import PlayingCard from './PlayingCard.vue'
import { gsap } from 'gsap'

const props = defineProps({
  hand: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
  handsLeft: { type: Number, default: 4 },
  discardsLeft: { type: Number, default: 3 },
  isAnimating: { type: Boolean, default: false },
  aiThinking: { type: Boolean, default: false },
  animMultiplier: { type: Number, default: 1.0 },
})

defineEmits(['toggle-select', 'play', 'discard', 'sort-rank', 'sort-suit', 'ai-play'])

function onCardEnter(el, done) {
  const deckEl = document.querySelector('.deck-stack')
  if (!deckEl) {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.3 * props.animMultiplier, ease: 'power2.out', onComplete: done }
    )
    return
  }
  const deckRect = deckEl.getBoundingClientRect()
  const targetRect = el.getBoundingClientRect()
  const dx = deckRect.left + deckRect.width / 2 - (targetRect.left + targetRect.width / 2)
  const dy = deckRect.top + deckRect.height / 2 - (targetRect.top + targetRect.height / 2)

  gsap.fromTo(el,
    { x: dx, y: dy, rotation: 15, opacity: 0 },
    { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.4 * props.animMultiplier, ease: 'power2.out', onComplete: done }
  )
}
</script>

<style scoped>
.hand-area {
  padding: 36px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.hand-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hand-title {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: var(--gold);
}

.hand-selected {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--muted);
}

/* 手牌容器 */
.hand-cards-row {
  flex: 1;
  overflow: visible;
}

.cards-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  flex-wrap: nowrap;
  padding-bottom: 8px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(74,107,255,.2) transparent;
}

/* 操作按钮行 */
.action-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  padding-right: 130px;
}

.ai-thinking {
  animation: pulse-ai 1s ease infinite;
}

/* card-deal TransitionGroup */
.card-deal-enter-active {
  /* 动画由 GSAP onCardEnter 处理 */
}
.card-deal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.card-deal-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
.card-deal-move {
  transition: transform 0.3s ease;
}
</style>
