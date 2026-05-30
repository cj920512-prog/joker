// =====================
// 核心数据常量
// =====================

export const SUITS = ['♠', '♥', '♦', '♣']
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const HAND_TYPES = [
  { name: '同花顺', chips: 100, mult: 8 },
  { name: '四条',   chips: 60,  mult: 7 },
  { name: '葫芦',   chips: 40,  mult: 4 },
  { name: '同花',   chips: 35,  mult: 4 },
  { name: '顺子',   chips: 30,  mult: 4 },
  { name: '三条',   chips: 30,  mult: 3 },
  { name: '两对',   chips: 20,  mult: 2 },
  { name: '对子',   chips: 10,  mult: 2 },
  { name: '高牌',   chips: 5,   mult: 1 },
]

export const BLINDS = [
  { name: '小盲注', target: 300, icon: '🔵', reward: 5 },
  { name: '中盲注', target: 500, icon: '🟡', reward: 6 },
  { name: '大盲注', target: 800, icon: '🔴', reward: 8 },
]

export const JOKER_POOL = [
  { id: 'clown',    name: '小丑',      rarity: 'common',    price: 3, art: '🃏', effect: 'per_hand_mult_4' },
  { id: 'scholar',  name: '学者',      rarity: 'common',    price: 3, art: '📖', effect: 'ace_mult_4' },
  { id: 'hearts',   name: '红心收藏家', rarity: 'rare',     price: 5, art: '❤️', effect: 'heart_mult_x4' },
  { id: 'clubs',    name: '梅花爱好者', rarity: 'rare',     price: 5, art: '♣',  effect: 'club_mult_x4' },
  { id: 'royals',   name: '皇家头牌',  rarity: 'rare',      price: 5, art: '👑', effect: 'face_mult_x10' },
  { id: 'flush',    name: '同花顺大师', rarity: 'legendary', price: 8, art: '🔥', effect: 'flush_mult_50' },
]

// =====================
// 牌值计算
// =====================

function cardValue(rank) {
  if (rank === 'A') return 11
  if (['J', 'Q', 'K'].includes(rank)) return 10
  return parseInt(rank)
}

// =====================
// 创建标准52张牌组
// =====================

export function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}`,
        rank,
        suit,
        value: cardValue(rank),
      })
    }
  }
  return deck
}

// =====================
// 洗牌（Fisher-Yates）
// =====================

export function shuffle(deck) {
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// =====================
// 识别牌型
// =====================

// 点数的顺子排序值（用于顺子判断）
const RANK_ORDER = { 'A': 14, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 }

function isStraight(ranks) {
  // ranks 是点数数组
  const vals = ranks.map(r => RANK_ORDER[r]).sort((a, b) => a - b)
  // 普通顺子
  let straight = true
  for (let i = 1; i < vals.length; i++) {
    if (vals[i] !== vals[i-1] + 1) { straight = false; break }
  }
  if (straight) return true
  // A-2-3-4-5（A当1用）
  if (vals.join(',') === '2,3,4,5,14') return true
  return false
}

export function identifyHand(cards) {
  const n = cards.length
  const ranks = cards.map(c => c.rank)
  const suits = cards.map(c => c.suit)

  // 统计各点数出现次数
  const rankCount = {}
  for (const r of ranks) rankCount[r] = (rankCount[r] || 0) + 1
  const counts = Object.values(rankCount).sort((a, b) => b - a)

  const isFlush = n === 5 && suits.every(s => s === suits[0])
  const isStr = n === 5 && isStraight(ranks)

  // 同花顺（5张）
  if (n === 5 && isFlush && isStr) return HAND_TYPES[0]
  // 四条（需要至少4张）
  if (counts[0] === 4) return HAND_TYPES[1]
  // 葫芦（5张）
  if (n === 5 && counts[0] === 3 && counts[1] === 2) return HAND_TYPES[2]
  // 同花（5张）
  if (n === 5 && isFlush) return HAND_TYPES[3]
  // 顺子（5张）
  if (n === 5 && isStr) return HAND_TYPES[4]
  // 三条
  if (counts[0] === 3) return HAND_TYPES[5]
  // 两对
  if (counts[0] === 2 && counts[1] === 2) return HAND_TYPES[6]
  // 对子
  if (counts[0] === 2) return HAND_TYPES[7]
  // 高牌
  return HAND_TYPES[8]
}

// =====================
// 计算得分（返回详细信息，含 Joker 触发日志）
// =====================

export function calculateScore(playedCards, handType, ownedJokers) {
  let chips = handType.chips + playedCards.reduce((sum, c) => sum + c.value, 0)
  let mult = handType.mult
  const jokerTriggers = []

  for (const joker of ownedJokers) {
    switch (joker.effect) {
      case 'per_hand_mult_4': {
        mult += 4
        jokerTriggers.push({ jokerId: joker.id, delta: 4, type: 'add_mult' })
        break
      }
      case 'ace_mult_4': {
        const aceCount = playedCards.filter(c => c.rank === 'A').length
        if (aceCount > 0) {
          const delta = aceCount * 4
          mult += delta
          jokerTriggers.push({ jokerId: joker.id, delta, type: 'add_mult' })
        }
        break
      }
      case 'heart_mult_x4': {
        if (playedCards.some(c => c.suit === '♥')) {
          mult *= 4
          jokerTriggers.push({ jokerId: joker.id, delta: 4, type: 'mul_mult' })
        }
        break
      }
      case 'club_mult_x4': {
        if (playedCards.some(c => c.suit === '♣')) {
          mult *= 4
          jokerTriggers.push({ jokerId: joker.id, delta: 4, type: 'mul_mult' })
        }
        break
      }
      case 'face_mult_x10': {
        if (playedCards.some(c => ['J', 'Q', 'K'].includes(c.rank))) {
          mult *= 10
          jokerTriggers.push({ jokerId: joker.id, delta: 10, type: 'mul_mult' })
        }
        break
      }
      case 'flush_mult_50': {
        if (handType.name === '同花顺') {
          mult += 50
          jokerTriggers.push({ jokerId: joker.id, delta: 50, type: 'add_mult' })
        }
        break
      }
    }
  }

  return {
    chips,
    mult,
    score: chips * mult,
    jokerTriggers,
  }
}

// =====================
// 模拟计分（供 AI 用，只返回 score 数字）
// =====================

export function simulateScore(cards, ownedJokers) {
  if (cards.length === 0) return 0
  const handType = identifyHand(cards)
  const { score } = calculateScore(cards, handType, ownedJokers)
  return score
}

// =====================
// 枚举子集工具
// =====================

function combinations(arr, k) {
  if (k === 0) return [[]]
  if (arr.length < k) return []
  const [first, ...rest] = arr
  const withFirst = combinations(rest, k - 1).map(c => [first, ...c])
  const withoutFirst = combinations(rest, k)
  return [...withFirst, ...withoutFirst]
}

// =====================
// AI 最优出牌
// =====================

export function aiBestPlay(handCards, ownedJokers) {
  if (handCards.length <= 5) return handCards

  let bestScore = -1
  let bestCombo = handCards.slice(0, 5)

  for (let k = 1; k <= 5; k++) {
    const combos = combinations(handCards, k)
    for (const combo of combos) {
      const score = simulateScore(combo, ownedJokers)
      if (score > bestScore) {
        bestScore = score
        bestCombo = combo
      }
    }
  }

  return bestCombo
}

// =====================
// AI 商店建议（返回性价比最高的 joker index）
// =====================

export function aiBestShopItem(shopJokers, ownedJokers, money) {
  // 过滤可购买的（价格不超过金币 且 未售出）
  const buyable = shopJokers
    .map((j, i) => ({ joker: j, index: i }))
    .filter(({ joker }) => !joker.sold && joker.price <= money)

  if (buyable.length === 0) return -1

  // 稀有度分值
  const rarityScore = { common: 1, rare: 2, legendary: 3 }

  // 性价比 = 稀有度分值 / 价格（越高越好）
  let bestIdx = buyable[0].index
  let bestRatio = rarityScore[buyable[0].joker.rarity] / buyable[0].joker.price

  for (const { joker, index } of buyable) {
    const ratio = rarityScore[joker.rarity] / joker.price
    if (ratio > bestRatio) {
      bestRatio = ratio
      bestIdx = index
    }
  }

  return bestIdx
}
