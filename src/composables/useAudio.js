import { watch } from 'vue'
import { Howl, Howler } from 'howler'
import { SFX } from '../sfxIds.js'

// 单例
let instance = null

export function useAudio(settings, gameState) {
  if (instance) return instance

  let unlocked = false
  let currentPhase = null
  let bgmHowl = null
  let bgmPaused = false

  // SFX Howl 映射
  const sfxHowls = {}
  const sfxFiles = {
    [SFX.DEAL]:          '/audio/sfx/deal.mp3',
    [SFX.SELECT]:        '/audio/sfx/select.mp3',
    [SFX.DESELECT]:      '/audio/sfx/deselect.mp3',
    [SFX.PLAY]:          '/audio/sfx/play.mp3',
    [SFX.DISCARD]:       '/audio/sfx/discard.mp3',
    [SFX.SCORE_POP]:     '/audio/sfx/score_pop.mp3',
    [SFX.JOKER_TRIGGER]: '/audio/sfx/joker_trigger.mp3',
    [SFX.BUY_SUCCESS]:   '/audio/sfx/buy_success.mp3',
    [SFX.BUY_FAIL]:      '/audio/sfx/buy_fail.mp3',
    [SFX.ROUND_WIN]:     '/audio/sfx/round_win.mp3',
    [SFX.GAME_WIN]:      '/audio/sfx/game_win.mp3',
    [SFX.GAME_LOSE]:     '/audio/sfx/game_lose.mp3',
    [SFX.BUTTON_CLICK]:  '/audio/sfx/button_click.mp3',
  }

  const bgmFiles = {
    playing: '/audio/bgm/gameplay.mp3',
    shop:    '/audio/bgm/shop.mp3',
    won:     '/audio/bgm/win.mp3',
    lost:    '/audio/bgm/lose.mp3',
  }

  // 预加载所有 SFX
  function preloadSFX() {
    for (const [id, src] of Object.entries(sfxFiles)) {
      sfxHowls[id] = new Howl({
        src: [src],
        volume: settings.sfxVolume / 100,
        preload: true,
        onloaderror: () => console.warn(`[audio] SFX load failed: ${src}`),
      })
    }
  }

  // 播放 SFX
  function playSFX(id) {
    if (!unlocked) return
    const h = sfxHowls[id]
    if (!h) return
    h.volume(settings.sfxVolume / 100)
    h.play()
  }

  // 切换 BGM
  function setBGMPhase(phase) {
    if (phase === currentPhase) return
    currentPhase = phase

    const src = bgmFiles[phase]
    if (!src) return

    const loop = phase === 'playing' || phase === 'shop'
    const newHowl = new Howl({
      src: [src],
      volume: 0,
      loop,
      preload: true,
      onloaderror: () => console.warn(`[audio] BGM load failed: ${src}`),
    })

    // 淡出旧 BGM
    if (bgmHowl) {
      const old = bgmHowl
      old.fade(old.volume(), 0, 800)
      setTimeout(() => old.stop(), 850)
    }

    // 淡入新 BGM
    bgmHowl = newHowl
    newHowl.play()
    newHowl.fade(0, settings.bgmVolume / 100, 1000)
  }

  // 实时更新 BGM 音量
  function setBGMVolume(v) {
    if (bgmHowl && !bgmPaused) {
      bgmHowl.volume(v / 100)
    }
  }

  // 实时更新 SFX 音量（下次播放生效，此处无需操作）
  function setSFXVolume(_v) {
    // 音量在 playSFX 时动态读取
  }

  // 页面可见性处理
  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      bgmPaused = true
      if (bgmHowl) {
        bgmHowl.fade(bgmHowl.volume(), 0, 200)
        setTimeout(() => { if (bgmPaused) bgmHowl?.pause() }, 220)
      }
    } else {
      bgmPaused = false
      if (bgmHowl) {
        bgmHowl.play()
        bgmHowl.fade(0, settings.bgmVolume / 100, 400)
      }
    }
  }

  // 首次用户交互解锁 AudioContext
  function unlock() {
    if (unlocked) return
    unlocked = true
    Howler.ctx?.resume()
    preloadSFX()
    // 启动当前阶段 BGM
    const phase = gameState?.value ?? 'playing'
    setBGMPhase(phase)
    document.removeEventListener('click', unlock)
    document.removeEventListener('keydown', unlock)
  }

  // 监听 gameState 切换 BGM
  if (gameState) {
    watch(gameState, (newPhase) => {
      if (unlocked) setBGMPhase(newPhase)
      else currentPhase = newPhase // 记录，等解锁后用
    })
  }

  // 监听音量设置变化
  if (settings) {
    watch(() => settings.bgmVolume, (v) => setBGMVolume(v))
    watch(() => settings.sfxVolume, () => {}) // SFX 动态读取，无需处理
  }

  document.addEventListener('click', unlock)
  document.addEventListener('keydown', unlock)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  instance = { playSFX, setBGMPhase, setBGMVolume, setSFXVolume }
  return instance
}

// 重置单例（重新开始游戏时用）
export function resetAudioInstance() {
  instance = null
}
