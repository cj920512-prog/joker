import { watch } from 'vue'
import { Howl, Howler } from 'howler'
import { SFX } from '../sfxIds.js'

let instance = null

export function useAudio(settings, gameState) {
  if (instance) return instance

  let unlocked = false
  let currentPhase = null
  let bgmHowl = null
  let bgmPaused = false

  const sfxHowls = {}

  const sfxFiles = {
    [SFX.DEAL]:          '/audio/sfx/deal.wav',
    [SFX.SELECT]:        '/audio/sfx/select.wav',
    [SFX.DESELECT]:      '/audio/sfx/deselect.wav',
    [SFX.PLAY]:          '/audio/sfx/play.wav',
    [SFX.DISCARD]:       '/audio/sfx/discard.wav',
    [SFX.SCORE_POP]:     '/audio/sfx/score_pop.wav',
    [SFX.JOKER_TRIGGER]: '/audio/sfx/joker_trigger.wav',
    [SFX.BUY_SUCCESS]:   '/audio/sfx/buy_success.wav',
    [SFX.BUY_FAIL]:      '/audio/sfx/buy_fail.wav',
    [SFX.ROUND_WIN]:     '/audio/sfx/round_win.wav',
    [SFX.GAME_WIN]:      '/audio/sfx/game_win.wav',
    [SFX.GAME_LOSE]:     '/audio/sfx/game_lose.wav',
    [SFX.BUTTON_CLICK]:  '/audio/sfx/button_click.wav',
  }

  const bgmFiles = {
    playing: '/audio/bgm/gameplay.wav',
    shop:    '/audio/bgm/shop.wav',
    won:     '/audio/bgm/win.wav',
    lost:    '/audio/bgm/lose.wav',
  }

  function preloadSFX() {
    for (const [id, src] of Object.entries(sfxFiles)) {
      sfxHowls[id] = new Howl({
        src: [src],
        preload: true,
        onloaderror: (_, err) => console.warn('[audio] sfx load fail:', src, err),
      })
    }
  }

  function playSFX(id) {
    if (!unlocked) return
    const h = sfxHowls[id]
    if (!h) return
    const vol = settings.sfxVolume / 100
    h.volume(vol)
    h.play()
  }

  function setBGMPhase(phase) {
    if (!phase || phase === currentPhase) return
    const src = bgmFiles[phase]
    if (!src) return
    currentPhase = phase

    // 淡出并停掉旧 BGM
    const old = bgmHowl
    if (old) {
      old.fade(old.volume(), 0, 600)
      setTimeout(() => { old.stop(); old.unload() }, 650)
    }

    const targetVol = (settings.bgmVolume ?? 50) / 100
    const loop = phase === 'playing' || phase === 'shop'

    const howl = new Howl({
      src: [src],
      volume: 0,
      loop,
      preload: true,
      // 加载完成后才 play+fade，避免静默失败
      onload() {
        if (bgmHowl !== howl) return // 已被新 phase 替换，放弃
        if (bgmPaused) return
        howl.play()
        howl.fade(0, targetVol, 800)
      },
      onloaderror: (_, err) => console.warn('[audio] bgm load fail:', src, err),
      onplayerror: (_, err) => {
        console.warn('[audio] bgm play error:', err)
        // Web Audio 被 suspend 时尝试 resume 后重试
        Howler.ctx?.resume().then(() => howl.play())
      },
    })

    bgmHowl = howl
  }

  function setBGMVolume(v) {
    if (bgmHowl && !bgmPaused) {
      bgmHowl.volume(v / 100)
    }
  }

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
        bgmHowl.fade(0, (settings.bgmVolume ?? 50) / 100, 400)
      }
    }
  }

  function unlock() {
    if (unlocked) return
    unlocked = true
    // resume AudioContext（浏览器 autoplay policy）
    Howler.ctx?.resume()
    preloadSFX()
    currentPhase = null
    const phase = gameState?.value ?? 'playing'
    setBGMPhase(phase)
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
