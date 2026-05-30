<template>
  <div class="sidebar">
    <!-- Logo -->
    <div class="logo-block">
      <span class="logo-text">JOKER</span>
      <span class="logo-cn">小丑牌</span>
    </div>

    <!-- 盲注面板 -->
    <div class="panel blind-panel">
      <div class="blind-icon">{{ blind.icon }}</div>
      <div class="blind-info">
        <div class="blind-name">{{ blind.name }}</div>
        <div class="blind-target">
          <span class="target-num">{{ blindScore }}</span>
          <span class="target-sep"> / </span>
          <span class="target-goal">{{ targetScore }}</span>
        </div>
        <div class="blind-reward">奖励 ${{ 5 + handsLeft }}</div>
      </div>
    </div>

    <!-- Round Score 进度 -->
    <div class="panel score-panel">
      <div class="score-label">Round Score</div>
      <div class="score-num">{{ blindScore }}</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </div>

    <!-- 计分块 -->
    <div class="panel battle-panel">
      <div class="hand-type-name">
        <span v-if="handTypeName" class="hand-type-active">{{ handTypeName }}</span>
        <span v-else class="hand-type-empty">— 选牌出牌 —</span>
      </div>
      <div class="formula-blocks">
        <div class="chips-block">
          <div class="block-label">Chips</div>
          <div class="block-num">{{ battleChips }}</div>
        </div>
        <div class="x-sign">×</div>
        <div class="mult-block">
          <div class="block-label">Mult</div>
          <div class="block-num">{{ battleMult }}</div>
        </div>
      </div>
    </div>

    <!-- Hands / Discards -->
    <div class="panel hd-panel">
      <div class="hd-item">
        <div class="hd-label">Hands</div>
        <div class="hd-num">{{ handsLeft }}</div>
      </div>
      <div class="hd-divider"></div>
      <div class="hd-item">
        <div class="hd-label">Discards</div>
        <div class="hd-num">{{ discardsLeft }}</div>
      </div>
    </div>

    <!-- 金币 -->
    <div class="panel money-panel">
      <div class="money-icon">$</div>
      <div class="money-num">{{ totalCoins }}</div>
    </div>

    <!-- Ante 进度 -->
    <div class="panel ante-panel">
      <div class="ante-row">
        <span class="ante-label">底注</span>
        <span class="ante-val">{{ blindIndex + 1 }}/3</span>
      </div>
    </div>

    <!-- 重新开始 -->
    <button class="px-btn red restart-btn" @click="$emit('restart')">
      重新开始
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  blind: { type: Object, required: true },
  blindIndex: { type: Number, default: 0 },
  blindScore: { type: Number, default: 0 },
  targetScore: { type: Number, required: true },
  battleChips: { type: Number, default: 0 },
  battleMult: { type: Number, default: 0 },
  handTypeName: { type: String, default: '' },
  handsLeft: { type: Number, default: 4 },
  discardsLeft: { type: Number, default: 3 },
  totalCoins: { type: Number, default: 0 },
})

defineEmits(['restart'])

const progressPct = computed(() => {
  return Math.min(100, Math.round((props.blindScore / props.targetScore) * 100))
})
</script>

<style scoped>
.sidebar {
  width: min(28vw, 480px);
  min-width: 280px;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, #0f1d4a 0%, #0a1438 100%);
  border-right: 2px solid rgba(74,107,255,.2);
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(74,107,255,.3) transparent;
}

/* Logo */
.logo-block {
  text-align: center;
  padding: 8px 0 4px;
}
.logo-text {
  display: block;
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffc857;
  text-shadow: 2px 2px 0 #000, -1px -1px 0 #000;
  letter-spacing: 2px;
}
.logo-cn {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: rgba(255,200,87,.7);
  margin-top: 4px;
  font-weight: 600;
}

/* 通用面板 */
.panel {
  background: var(--sb-panel);
  border-radius: 10px;
  border: 1px solid rgba(74,107,255,.25);
  padding: 12px 14px;
}

/* 盲注面板 */
.blind-panel {
  display: flex;
  align-items: center;
  gap: 12px;
}
.blind-icon {
  font-size: 28px;
  flex-shrink: 0;
}
.blind-info {
  flex: 1;
  min-width: 0;
}
.blind-name {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dim);
  margin-bottom: 3px;
}
.blind-target {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.target-num {
  font-family: 'VT323', monospace;
  font-size: 28px;
  color: #ff5555;
  line-height: 1;
}
.target-sep {
  font-family: 'VT323', monospace;
  font-size: 22px;
  color: var(--muted);
}
.target-goal {
  font-family: 'VT323', monospace;
  font-size: 22px;
  color: var(--text-dim);
}
.blind-reward {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: var(--gold);
  margin-top: 2px;
  font-weight: 600;
}

/* Round Score */
.score-panel {
  text-align: center;
}
.score-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: var(--muted);
  margin-bottom: 4px;
  letter-spacing: 1px;
}
.score-num {
  font-family: 'VT323', monospace;
  font-size: 52px;
  line-height: 1;
  color: #ffffff;
  text-shadow: 0 0 20px rgba(74,107,255,.5);
}
.progress-bar {
  height: 6px;
  background: rgba(255,255,255,.1);
  border-radius: 3px;
  margin-top: 6px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4dd6ff, #4a6bff);
  border-radius: 3px;
  transition: width 0.4s ease;
}

/* 计分块 */
.battle-panel {
  text-align: center;
}
.hand-type-name {
  margin-bottom: 8px;
  min-height: 20px;
}
.hand-type-active {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #4dd6ff;
}
.hand-type-empty {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--muted);
}
.formula-blocks {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.chips-block {
  background: linear-gradient(135deg, #4dd6ff, #2196f3);
  border-radius: 8px;
  padding: 8px 14px;
  min-width: 70px;
  text-align: center;
  box-shadow: 0 3px 0 rgba(0,0,0,.4);
}
.mult-block {
  background: linear-gradient(135deg, #ff8844, #ff3344);
  border-radius: 8px;
  padding: 8px 14px;
  min-width: 70px;
  text-align: center;
  box-shadow: 0 3px 0 rgba(0,0,0,.4);
}
.block-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: rgba(255,255,255,.8);
  margin-bottom: 3px;
}
.block-num {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0,0,0,.4);
}
.x-sign {
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffc857;
  text-shadow: 0 1px 3px rgba(0,0,0,.5);
}

/* Hands/Discards */
.hd-panel {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 8px;
}
.hd-item {
  flex: 1;
  text-align: center;
}
.hd-divider {
  width: 1px;
  height: 40px;
  background: rgba(74,107,255,.3);
}
.hd-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: var(--muted);
  margin-bottom: 4px;
}
.hd-num {
  font-family: 'VT323', monospace;
  font-size: 40px;
  line-height: 1;
  color: #ffffff;
}

/* 金币 */
.money-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #050818;
  border: 1px solid rgba(255,200,87,.3);
}
.money-icon {
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: var(--gold);
}
.money-num {
  font-family: 'VT323', monospace;
  font-size: 44px;
  line-height: 1;
  color: var(--gold);
}

/* Ante */
.ante-panel {
  padding: 8px 14px;
}
.ante-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ante-label {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: var(--muted);
}
.ante-val {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: var(--gold);
}

/* 重新开始按钮 */
.restart-btn {
  width: 100%;
  font-size: 13px;
  min-height: 44px;
  letter-spacing: 1px;
}
</style>
