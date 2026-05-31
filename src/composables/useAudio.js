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

  const sfxHowls = {}
  const sfxFiles = {
    [SFX.DEAL]:          '/audio/sfx/deal.m4a',
    [SFX.SELECT]:        '/audio/sfx/select.m4a',
    [SFX.DESELECT]:      '/audio/sfx/deselect.m4a',
    [SFX.PLAY]:          '/audio/sfx/play.m4a',
    [SFX.DISCARD]:       '/audio/sfx/discard.m4a',
    [SFX.SCORE_POP]:     '/audio/sfx/score_pop.m4a',
    [SFX.JOKER_TRIGGER]: '/audio/sfx/joker_trigger.m4a',
    [SFX.BUY_SUCCESS]:   '/audio/sfx/buy_success.m4a',
    [SFX.BUY_FAIL]:      '/audio/sfx/buy_fail.m4a',
    [SFX.ROUND_WIN]:     '/audio/sfx/round_win.m4a',
    [SFX.GAME_WIN]:      '/audio/sfx/game_win.m4a',
    [SFX.GAME_LOSE]:     '/audio/sfx/game_lose.m4a',
    [SFX.BUTTON_CLICK]:  '/audio/sfx/button_click.m4a',
  }

  const bgmFiles = {
    playing: '/audio/bgm/gameplay.m4a',
    shop:    '/audio/bgm/shop.m4a',
    won:     '/audio/bgm/win.m4a',
    lost:    '/audio/bgm/lose.m4a',
  }

  function preloadSFX() {
    for (const [id, src] of Object.entries(sfxFiles)) {
      sfxHowls[id] = new Howl({
        src: [src],
        volume: settings.sfxVolume / 100,
        preload: true,
        onloaderror: (_, err) => console.warn(`[audio] SFX load failed: ${src}`, err),
      })
    }
  }

  function playSFX(id) {
    if (!unlocked) return
    const h = sfxHowls[id]
    if (!h) return
    h.volume(settings.sfxVolume / 100)
    h.play()
  }

  function setBGMPhase(phase) {
    const src = bgmFiles[phase]
    if (!src || phase === currentPhase) return
    currentPhase = phase

    const targetVol = settings.bgmVolume / 100
    const loop = phase === 'playing' || phase === 'shop'

    const newHowl = new Howl({
      src: [src],
      volume: 0,
      loop,
      preload: true,
      html5: true,
      onloaderror: (_, err) => console.warn(`[audio] BGM load failed: ${src}`, err),
    })

    if (bgmHowl) {
      const old = bgmHowl
      old.fade(old.volume(), 0, 800)
      setTimeout(() => { old.stop(); old.unload() }, 850)
    }

    bgmHowl = newHowl
    newHowl.play()
    newHowl.fade(0, targetVol, 1000)
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
        bgmHowl.fade(0, settings.bgmVolume / 100, 400)
      }
    }
  }

  function unlock() {
    if (unlocked) return
    unlocked = true
    Howler.ctx?.resume()
    preloadSFX()
    // 解锁后启动当前阶段 BGM，强制重置 currentPhase 让 setBGMPhase 不跳过
    const phase = gameState?.value ?? 'playing'
    currentPhase = null
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
  if (instance) {
    // 清理当前 BGM
  }
  instance = null
}
