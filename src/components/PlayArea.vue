<template>
  <div class="play-area">
    <!-- 顶部标签 -->
    <div class="play-area-header">
      <span class="play-label">出牌区</span>
      <span v-if="handTypeName" class="hand-type-badge">{{ handTypeName }}</span>
    </div>

    <!-- 出牌区牌展示 -->
    <div class="played-cards-zone">
      <div v-if="playedCards.length === 0" class="empty-hint">
        选择手牌组成牌型（1-5 张）
      </div>
      <div v-else class="played-cards-row">
        <PlayingCard
          v-for="card in playedCards"
          :key="card.id"
          :card="card"
          :isHighlighted="highlightedCardId === card.id"
        />
      </div>
    </div>

    <!-- 公式弹出 -->
    <Transition name="formula-pop">
      <div v-if="showFormula" class="formula-display">
        <span class="f-chips">{{ battleChips }}</span>
        <span class="f-x">×</span>
        <span class="f-mult">{{ battleMult }}</span>
        <span class="f-eq">=</span>
        <span class="f-score">{{ formulaScore }}</span>
      </div>
    </Transition>

    <!-- 牌堆（absolute 定位在右下角） -->
    <div class="deck-stack" :title="`剩余 ${deckCount} 张`">
      <div class="deck-card deck-card-3"></div>
      <div class="deck-card deck-card-2"></div>
      <div class="deck-card deck-card-1"></div>
      <div class="deck-count">{{ deckCount }}</div>
    </div>
  </div>
</template>

<script setup>
import PlayingCard from './PlayingCard.vue'

defineProps({
  playedCards: { type: Array, default: () => [] },
  deckCount: { type: Number, default: 52 },
  showFormula: { type: Boolean, default: false },
  battleChips: { type: Number, default: 0 },
  battleMult: { type: Number, default: 0 },
  formulaScore: { type: Number, default: 0 },
  highlightedCardId: { type: String, default: null },
  handTypeName: { type: String, default: '' },
})
</script>

<style scoped>
.play-area {
  background: rgba(5,8,24,.5);
  border-bottom: 1px solid rgba(74,107,255,.15);
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.play-area-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.play-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hand-type-badge {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #4dd6ff;
  background: rgba(77,214,255,.15);
  padding: 2px 10px;
  border-radius: 12px;
  border: 1px solid rgba(77,214,255,.3);
}

.played-cards-zone {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.empty-hint {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--muted);
  opacity: 0.55;
  text-align: center;
}

.played-cards-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  justify-content: center;
  flex-wrap: nowrap;
}

/* 公式弹出 */
.formula-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(5,8,24,.92);
  border: 2px solid rgba(255,200,87,.5);
  border-radius: 16px;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
  box-shadow: 0 8px 32px rgba(0,0,0,.7), 0 0 30px rgba(255,200,87,.2);
  white-space: nowrap;
}

.f-chips {
  font-family: 'Press Start 2P', monospace;
  font-size: 22px;
  color: #4dd6ff;
}
.f-x, .f-eq {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: var(--muted);
}
.f-mult {
  font-family: 'Press Start 2P', monospace;
  font-size: 22px;
  color: #ff8844;
}
.f-score {
  font-family: 'Press Start 2P', monospace;
  font-size: 26px;
  color: #ffc857;
  text-shadow: 0 0 16px rgba(255,200,87,.7);
}

/* 牌堆 */
.deck-stack {
  position: absolute;
  bottom: 16px;
  right: 20px;
  width: 72px;
  height: 100px;
  cursor: default;
}

.deck-card {
  position: absolute;
  width: 64px;
  height: 90px;
  border-radius: 6px;
  border: 2px solid #1a0f24;
  background:
    repeating-linear-gradient(
      45deg,
      rgba(100,80,160,.3) 0 4px,
      rgba(60,40,120,.4) 4px 8px
    ),
    linear-gradient(135deg, #2d1f5c, #1a0f3c);
}

.deck-card-1 { bottom: 0; left: 4px; z-index: 3; }
.deck-card-2 { bottom: 4px; left: 2px; z-index: 2; transform: rotate(-2deg); }
.deck-card-3 { bottom: 8px; left: 0; z-index: 1; transform: rotate(-4deg); }

.deck-count {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: linear-gradient(135deg, #4a6bff, #2d4080);
  color: white;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  padding: 3px 6px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.2);
  z-index: 5;
  min-width: 28px;
  text-align: center;
}

/* formula-pop transition（全局 main.css 有定义，这里也加一遍保险） */
.formula-pop-enter-active {
  animation: formula-pop 0.4s ease forwards;
}
.formula-pop-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.formula-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.2);
}
</style>
