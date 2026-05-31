import { watch } from 'vue'
import { SFX } from '../sfxIds.js'

let instance = null

export function useAudio(settings, gameState) {
  if (instance) return instance

  let unlocked = false
  let currentPhase = null
  let bgmAudio = null
  let bgmPaused = false

  // import.meta.env.BASE_URL is '/joker/' on GitHub Pages, './' in dev
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '')

  const sfxFiles = {
    [SFX.DEAL]:          `${base}/audio/sfx/deal.wav`,
    [SFX.SELECT]:        `${base}/audio/sfx/select.wav`,
    [SFX.DESELECT]:      `${base}/audio/sfx/deselect.wav`,
    [SFX.PLAY]:          `${base}/audio/sfx/play.wav`,
    [SFX.DISCARD]:       `${base}/audio/sfx/discard.wav`,
    [SFX.SCORE_POP]:     `${base}/audio/sfx/score_pop.wav`,
    [SFX.JOKER_TRIGGER]: `${base}/audio/sfx/joker_trigger.wav`,
    [SFX.BUY_SUCCESS]:   `${base}/audio/sfx/buy_success.wav`,
    [SFX.BUY_FAIL]:      `${base}/audio/sfx/buy_fail.wav`,
    [SFX.ROUND_WIN]:     `${base}/audio/sfx/round_win.wav`,
    [SFX.GAME_WIN]:      `${base}/audio/sfx/game_win.wav`,
    [SFX.GAME_LOSE]:     `${base}/audio/sfx/game_lose.wav`,
    [SFX.BUTTON_CLICK]:  `${base}/audio/sfx/button_click.wav`,
  }

  const bgmFiles = {
    playing: `${base}/audio/bgm/gameplay.wav`,
    shop:    `${base}/audio/bgm/shop.wav`,
    won:     `${base}/audio/bgm/win.wav`,
    lost:    `${base}/audio/bgm/lose.wav`,
  }

  // 预缓存 SFX：每个音效保留一个 Audio 对象池（支持快速连发）
  const sfxPool = {}
  function preloadSFX() {
    for (const [id, src] of Object.entries(sfxFiles)) {
      const a = new Audio(src)
      a.preload = 'auto'
      sfxPool[id] = a
    }
  }

  function playSFX(id) {
    if (!unlocked) return
    const orig = sfxPool[id]
    if (!orig) return
    // clone 支持同一音效快速连发
    const a = orig.cloneNode()
    a.volume = (settings.sfxVolume ?? 70) / 100
    a.play().catch(() => {})
  }

  function setBGMPhase(phase) {
    if (!phase || phase === currentPhase) return
    const src = bgmFiles[phase]
    if (!src) return
    currentPhase = phase

    // 停掉旧 BGM
    if (bgmAudio) {
      bgmAudio.pause()
      bgmAudio.src = ''
      bgmAudio = null
    }

    const a = new Audio(src)
    a.loop = phase === 'playing' || phase === 'shop'
    a.volume = (settings.bgmVolume ?? 50) / 100
    a.preload = 'auto'
    bgmAudio = a

    a.play().catch(err => console.warn('[audio] bgm play failed:', err))
  }

  function setBGMVolume(v) {
    if (bgmAudio && !bgmPaused) {
      bgmAudio.volume = v / 100
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      bgmPaused = true
      bgmAudio?.pause()
    } else {
      bgmPaused = false
      if (bgmAudio) {
        bgmAudio.volume = (settings.bgmVolume ?? 50) / 100
        bgmAudio.play().catch(() => {})
      }
    }
  }

  function unlock() {
    if (unlocked) return
    unlocked = true
    preloadSFX()
    currentPhase = null
    setBGMPhase(gameState?.value ?? 'playing')
    document.removeEventListener('click', unlock)
    document.removeEventListener('keydown', unlock)
  }

  if (gameState) {
    watch(gameState, (newPhase) => {
      if (unlocked) setBGMPhase(newPhase)
    })
  }

  if (settings) {
    watch(() => settings.bgmVolume, (v) => setBGMVolume(v))
  }

  document.addEventListener('click', unlock)
  document.addEventListener('keydown', unlock)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  instance = { playSFX, setBGMPhase, setBGMVolume }
  return instance
}

export function resetAudioInstance() {
  instance = null
}
