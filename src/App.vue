<template>
  <div class="game-layout">
    <!-- 右上角设置按钮 -->
    <button class="settings-btn" @click="showSettings = true">⚙️</button>

    <!-- 左 Sidebar -->
    <SideBar
      :blind="BLINDS[currentBlindIndex]"
      :blindIndex="currentBlindIndex"
      :blindScore="blindScore"
      :targetScore="BLINDS[currentBlindIndex].target"
      :battleChips="battleChips"
      :battleMult="battleMult"
      :handTypeName="currentHandType ? currentHandType.name : ''"
      :handsLeft="handsLeft"
      :discardsLeft="discardsLeft"
      :totalCoins="totalCoins"
      @restart="initGame"
    />

    <!-- 右主区 -->
    <div class="main-area">
      <!-- 游戏进行中 -->
      <template v-if="gameState === 'playing'">
        <JokerArea
          :jokers="ownedJokers"
          :triggeredJokerId="triggeredJoker"
        />
        <PlayArea
          :playedCards="playedCards"
          :deckCount="deck.length"
          :showFormula="showFormula"
          :battleChips="battleChips"
          :battleMult="battleMult"
          :formulaScore="formulaScore"
          :highlightedCardId="highlightedCard"
          :handTypeName="currentHandType ? currentHandType.name : ''"
        />
        <HandArea
          :hand="hand"
          :selectedIds="selectedCards"
          :handsLeft="handsLeft"
          :discardsLeft="discardsLeft"
          :isAnimating="isAnimating"
          :aiThinking="aiThinking"
          :animMultiplier="animMultiplier"
          @toggle-select="toggleSelect"
          @play="handlePlay"
          @discard="handleDiscard"
          @sort-rank="sortByRank"
          @sort-suit="sortBySuit"
          @ai-play="handleAiPlay"
        />
      </template>

      <!-- 商店界面 -->
      <ShopScreen
        v-else-if="gameState === 'shop'"
        :shopJokers="shopJokers"
        :ownedJokers="ownedJokers"
        :totalCoins="totalCoins"
        :aiSuggestId="aiSuggestId"
        @buy="buyJoker"
        @skip="skipShop"
        @ai-suggest="handleAiSuggest"
      />

      <!-- 结束界面 -->
      <EndScreen
        v-else-if="gameState === 'won' || gameState === 'lost'"
        :gameState="gameState"
        :totalCoins="totalCoins"
        :ownedJokers="ownedJokers"
        @restart="initGame"
      />
    </div>

    <!-- 设置 Modal -->
    <SettingsModal
      v-if="showSettings"
      :settings="settings"
      @close="showSettings = false"
      @update="updateSettings"
    />

    <!-- 全局 BGM 播放器 -->
    <div class="bgm-player" :class="{ 'bgm-player--muted': bgmMuted }">
      <button class="bgm-toggle" @click="toggleBGM" :title="bgmMuted ? '开启音乐' : '静音'">
        {{ bgmMuted ? '🔇' : '🎵' }}
      </button>
      <span class="bgm-label">{{ bgmTrackName }}</span>
      <input
        class="bgm-vol"
        type="range"
        min="0"
        max="100"
        :value="settings.bgmVolume"
        @input="e => updateSettings({ key: 'bgmVolume', value: Number(e.target.value) })"
      />
    </div>

    <!-- 飞字容器 -->
    <div id="fly-labels"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useAudio } from './composables/useAudio.js'
import { SFX } from './sfxIds.js'
import SideBar from './components/SideBar.vue'
import JokerArea from './components/JokerArea.vue'
import PlayArea from './components/PlayArea.vue'
import HandArea from './components/HandArea.vue'
import ShopScreen from './components/ShopScreen.vue'
import EndScreen from './components/EndScreen.vue'
import SettingsModal from './components/SettingsModal.vue'
import {
  BLINDS,
  JOKER_POOL,
  createDeck,
  shuffle,
  identifyHand,
  calculateScore,
  aiBestPlay,
  aiBestShopItem,
} from './gameLogic.js'

// =====================
// 游戏状态
// =====================
const gameState = ref('playing')      // 'playing' | 'shop' | 'won' | 'lost'
const currentBlindIndex = ref(0)
const blindScore = ref(0)
const totalCoins = ref(0)
const handsLeft = ref(4)
const discardsLeft = ref(3)
const deck = ref([])
const hand = ref([])
const selectedCards = ref([])
const playedCards = ref([])
const ownedJokers = ref([])
const shopJokers = ref([])
const isAnimating = ref(false)
const aiThinking = ref(false)
const showSettings = ref(false)
const currentHandType = ref(null)
const aiSuggestId = ref(null)

// 动画中间状态
const battleChips = ref(0)
const battleMult = ref(0)
const showFormula = ref(false)
const formulaScore = ref(0)
const highlightedCard = ref(null)
const triggeredJoker = ref(null)

// 设置
const settings = reactive({
  bgmVolume: 50,
  sfxVolume: 70,
  animSpeed: 'normal',
  showFormulaPreview: true,
})

const audio = useAudio(settings, gameState)

// BGM 播放器状态
const bgmMuted = ref(false)
const bgmVolumeBeforeMute = ref(50)

const bgmTrackName = computed(() => {
  const names = { playing: '战斗音乐', shop: '商店音乐', won: '胜利音乐', lost: '失败音乐' }
  return names[gameState.value] ?? '背景音乐'
})

function toggleBGM() {
  if (bgmMuted.value) {
    bgmMuted.value = false
    updateSettings({ key: 'bgmVolume', value: bgmVolumeBeforeMute.value })
  } else {
    bgmVolumeBeforeMute.value = settings.bgmVolume
    bgmMuted.value = true
    updateSettings({ key: 'bgmVolume', value: 0 })
  }
}

// 动效速度倍率
const animMultiplier = computed(() => {
  if (settings.animSpeed === 'slow') return 1.5
  if (settings.animSpeed === 'fast') return 0.6
  return 1.0
})

// =====================
// 工具函数
// =====================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function flyLabel(text, type, sourceId) {
  const sourceEl = document.getElementById(sourceId) || document.querySelector(`[data-id="${sourceId}"]`)
  const targetEl = document.querySelector(type === 'chips' ? '.chips-block' : '.mult-block')
  if (!sourceEl || !targetEl) return

  const fromRect = sourceEl.getBoundingClientRect()
  const toRect = targetEl.getBoundingClientRect()

  const label = document.createElement('div')
  label.className = 'fly-label'
  label.textContent = text
  label.style.color = type === 'chips' ? '#4dd6ff' : '#ff8844'
  label.style.left = (fromRect.left + fromRect.width / 2) + 'px'
  label.style.top = fromRect.top + 'px'
  label.style.transform = 'translateX(-50%)'
  document.body.appendChild(label)

  gsap.to(label, {
    left: toRect.left + toRect.width / 2,
    top: toRect.top + toRect.height / 2,
    opacity: 0,
    scale: 0.5,
    duration: 0.4 * animMultiplier.value,
    ease: 'power1.in',
    onComplete: () => label.remove(),
  })
}

// =====================
// 发牌（带动画延迟）
// =====================

async function dealCards(count) {
  // 如果牌堆不够，重新洗牌补充
  if (deck.value.length < count) {
    const extra = shuffle(createDeck())
    deck.value.push(...extra)
  }

  const newCards = deck.value.splice(0, count)
  for (let i = 0; i < newCards.length; i++) {
    await delay(60 * animMultiplier.value)
    hand.value.push(newCards[i])
    audio.playSFX(SFX.DEAL)
  }
}

// =====================
// 初始化游戏
// =====================

function initGame() {
  gameState.value = 'playing'
  currentBlindIndex.value = 0
  blindScore.value = 0
  totalCoins.value = 0
  handsLeft.value = 4
  discardsLeft.value = 3
  ownedJokers.value = []
  deck.value = shuffle(createDeck())
  hand.value = []
  selectedCards.value = []
  playedCards.value = []
  currentHandType.value = null
  battleChips.value = 0
  battleMult.value = 0
  showFormula.value = false
  aiSuggestId.value = null
  dealCards(8)
}

// =====================
// 初始化一关（新盲注开始）
// =====================

function initRound() {
  blindScore.value = 0
  handsLeft.value = 4
  discardsLeft.value = 3
  deck.value = shuffle(createDeck())
  hand.value = []
  selectedCards.value = []
  playedCards.value = []
  currentHandType.value = null
  battleChips.value = 0
  battleMult.value = 0
  showFormula.value = false
  dealCards(8)
}

// =====================
// 切换选中
// =====================

function toggleSelect(cardId) {
  if (isAnimating.value) return
  const idx = selectedCards.value.indexOf(cardId)
  if (idx >= 0) {
    selectedCards.value.splice(idx, 1)
    audio.playSFX(SFX.DESELECT)
  } else {
    if (selectedCards.value.length < 5) {
      selectedCards.value.push(cardId)
      audio.playSFX(SFX.SELECT)
    }
  }
  // 更新牌型
  const cards = hand.value.filter(c => selectedCards.value.includes(c.id))
  currentHandType.value = cards.length > 0 ? identifyHand(cards) : null
}

// =====================
// 出牌
// =====================

async function handlePlay() {
  if (isAnimating.value) return
  if (selectedCards.value.length === 0) return
  isAnimating.value = true

  const cards = hand.value.filter(c => selectedCards.value.includes(c.id))
  const handType = identifyHand(cards)

  // 步骤1: 从手牌移除，放到出牌区
  audio.playSFX(SFX.PLAY)
  hand.value = hand.value.filter(c => !selectedCards.value.includes(c.id))
  selectedCards.value = []
  playedCards.value = cards

  // 步骤2: 显示牌型 + 设初始 chips/mult
  currentHandType.value = handType
  battleChips.value = handType.chips
  battleMult.value = handType.mult
  await delay(200 * animMultiplier.value)

  // 步骤3: 逐张累加 chips，发飞字
  for (let i = 0; i < cards.length; i++) {
    highlightedCard.value = cards[i].id
    const cardVal = cards[i].value
    battleChips.value += cardVal
    flyLabel(`+${cardVal}`, 'chips', cards[i].id)
    await delay(150 * animMultiplier.value)
  }
  highlightedCard.value = null

  // 步骤4: Joker 触发
  const { jokerTriggers } = calculateScore(cards, handType, ownedJokers.value)
  for (const trigger of jokerTriggers) {
    triggeredJoker.value = trigger.jokerId
    audio.playSFX(SFX.JOKER_TRIGGER)
    if (trigger.type === 'add_mult') {
      battleMult.value += trigger.delta
      flyLabel(`+${trigger.delta} Mult`, 'mult', `joker-${trigger.jokerId}`)
    } else if (trigger.type === 'mul_mult') {
      battleMult.value = Math.round(battleMult.value * trigger.delta)
      flyLabel(`×${trigger.delta}`, 'mult', `joker-${trigger.jokerId}`)
    }
    await delay(300 * animMultiplier.value)
    triggeredJoker.value = null
  }

  // 步骤5: 公式弹出
  audio.playSFX(SFX.SCORE_POP)
  showFormula.value = true
  formulaScore.value = battleChips.value * battleMult.value
  await delay(800 * animMultiplier.value)

  // 步骤6: 累计分 + 消耗手数
  blindScore.value += formulaScore.value
  showFormula.value = false
  handsLeft.value -= 1

  await delay(400 * animMultiplier.value)

  // 步骤7: 清出牌区 + 补牌
  const needCards = 8 - hand.value.length
  playedCards.value = []
  await dealCards(needCards)

  currentHandType.value = null
  battleChips.value = 0
  battleMult.value = 0

  isAnimating.value = false

  // 步骤8: 判定
  await delay(100)
  if (blindScore.value >= BLINDS[currentBlindIndex.value].target) {
    await delay(300)
    enterShopOrWin()
  } else if (handsLeft.value <= 0) {
    audio.playSFX(SFX.GAME_LOSE)
    gameState.value = 'lost'
  }
}

// =====================
// 弃牌
// =====================

async function handleDiscard() {
  if (isAnimating.value) return
  if (selectedCards.value.length === 0) return
  if (discardsLeft.value <= 0) return
  isAnimating.value = true

  audio.playSFX(SFX.DISCARD)
  const discardIds = [...selectedCards.value]
  hand.value = hand.value.filter(c => !discardIds.includes(c.id))
  selectedCards.value = []
  discardsLeft.value -= 1
  currentHandType.value = null

  const needCards = 8 - hand.value.length
  await dealCards(needCards)

  isAnimating.value = false
}

// =====================
// 进商店或通关
// =====================

function enterShopOrWin() {
  // 大盲注（index=2）通关直接结束
  if (currentBlindIndex.value >= BLINDS.length - 1) {
    audio.playSFX(SFX.GAME_WIN)
    gameState.value = 'won'
    return
  }
  // 通关奖励：$5 + 剩余手数
  const reward = 5 + handsLeft.value
  totalCoins.value += reward
  shopJokers.value = getRandomShopJokers()
  aiSuggestId.value = null
  audio.playSFX(SFX.ROUND_WIN)
  gameState.value = 'shop'
}

// =====================
// 随机商店 Joker
// =====================

function getRandomShopJokers() {
  const shuffled = [...JOKER_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3).map(j => ({ ...j, sold: false }))
}

// =====================
// 购买 Joker
// =====================

function buyJoker(joker) {
  if (totalCoins.value < joker.price || ownedJokers.value.length >= 5) {
    audio.playSFX(SFX.BUY_FAIL)
    return
  }
  totalCoins.value -= joker.price
  ownedJokers.value.push({ ...joker })
  const idx = shopJokers.value.findIndex(j => j.id === joker.id)
  if (idx >= 0) shopJokers.value[idx].sold = true
  audio.playSFX(SFX.BUY_SUCCESS)
}

// =====================
// 跳过商店
// =====================

function skipShop() {
  currentBlindIndex.value += 1
  gameState.value = 'playing'
  initRound()
}

// =====================
// AI 出牌
// =====================

async function handleAiPlay() {
  if (isAnimating.value || aiThinking.value) return
  aiThinking.value = true

  await delay(800 * animMultiplier.value)

  const bestCards = aiBestPlay(hand.value, ownedJokers.value)
  selectedCards.value = bestCards.map(c => c.id)
  currentHandType.value = identifyHand(bestCards)

  await delay(200 * animMultiplier.value)
  aiThinking.value = false
  await handlePlay()
}

// =====================
// AI 商店建议
// =====================

function handleAiSuggest() {
  const idx = aiBestShopItem(shopJokers.value, ownedJokers.value, totalCoins.value)
  aiSuggestId.value = shopJokers.value[idx] ? shopJokers.value[idx].id : null
}

// =====================
// 排序
// =====================

function sortByRank() {
  const rankOrder = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
  hand.value = [...hand.value].sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))
}

function sortBySuit() {
  const suitOrder = ['♠', '♥', '♦', '♣']
  hand.value = [...hand.value].sort((a, b) => suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit))
}

// =====================
// 设置更新
// =====================

function updateSettings({ key, value }) {
  settings[key] = value
}

// =====================
// localStorage 持久化
// =====================

function loadSettings() {
  try {
    const saved = localStorage.getItem('balatro.settings')
    if (saved) Object.assign(settings, JSON.parse(saved))
  } catch (e) {
    // ignore
  }
}

watch(settings, () => {
  localStorage.setItem('balatro.settings', JSON.stringify(settings))
}, { deep: true })

// =====================
// 初始化
// =====================

onMounted(() => {
  loadSettings()
  initGame()
})
</script>

<style>
/* 布局 */
.game-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.main-area {
  flex: 1;
  display: grid;
  grid-template-rows: 230px 1fr 280px;
  height: 100vh;
  overflow: hidden;
  min-width: 0;
}

/* BGM 播放器 */
.bgm-player {
  position: fixed;
  top: 16px;
  right: 72px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(10, 20, 56, 0.85);
  border: 1px solid rgba(74, 107, 255, 0.35);
  border-radius: 20px;
  padding: 6px 14px 6px 8px;
  backdrop-filter: blur(8px);
  transition: opacity 0.3s;
}

.bgm-player--muted {
  opacity: 0.6;
}

.bgm-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  transition: transform 0.15s;
}

.bgm-toggle:hover {
  transform: scale(1.2);
}

.bgm-label {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  white-space: nowrap;
  min-width: 52px;
}

.bgm-vol {
  -webkit-appearance: none;
  appearance: none;
  width: 72px;
  height: 4px;
  border-radius: 2px;
  background: rgba(74, 107, 255, 0.4);
  outline: none;
  cursor: pointer;
}

.bgm-vol::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4a6bff;
  cursor: pointer;
}

/* 设置按钮 */
.settings-btn {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  box-shadow: 0 4px 0 #92400e, inset 0 1px 0 rgba(255,255,255,.3);
  border: 2px solid rgba(0,0,0,.35);
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}

.settings-btn:hover {
  transform: rotate(30deg) scale(1.05);
}
</style>
