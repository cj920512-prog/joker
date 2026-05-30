<template>
  <Teleport to="body">
    <div class="settings-overlay" @click.self="$emit('close')">
      <div class="settings-modal">
        <div class="modal-header">
          <h2 class="modal-title">设置</h2>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <!-- BGM 音量 -->
        <div class="setting-row">
          <label class="setting-label">BGM 音量</label>
          <div class="slider-row">
            <input
              type="range"
              min="0" max="100"
              :value="settings.bgmVolume"
              @input="update('bgmVolume', +$event.target.value)"
              class="slider"
            />
            <span class="slider-val">{{ settings.bgmVolume }}</span>
          </div>
        </div>

        <!-- SFX 音量 -->
        <div class="setting-row">
          <label class="setting-label">SFX 音量</label>
          <div class="slider-row">
            <input
              type="range"
              min="0" max="100"
              :value="settings.sfxVolume"
              @input="update('sfxVolume', +$event.target.value)"
              class="slider"
            />
            <span class="slider-val">{{ settings.sfxVolume }}</span>
          </div>
        </div>

        <!-- 动画速度 -->
        <div class="setting-row">
          <label class="setting-label">动画速度</label>
          <div class="radio-row">
            <label v-for="opt in speedOptions" :key="opt.value" class="radio-label">
              <input
                type="radio"
                :value="opt.value"
                :checked="settings.animSpeed === opt.value"
                @change="update('animSpeed', opt.value)"
                class="radio-input"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <!-- 显示公式预览 -->
        <div class="setting-row">
          <label class="setting-label">显示出牌公式</label>
          <label class="toggle-label">
            <input
              type="checkbox"
              :checked="settings.showFormulaPreview"
              @change="update('showFormulaPreview', $event.target.checked)"
              class="toggle-input"
            />
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
          </label>
        </div>

        <button class="px-btn ghost close-full-btn" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  settings: { type: Object, required: true },
})

const emit = defineEmits(['close', 'update'])

const speedOptions = [
  { value: 'slow', label: '慢速' },
  { value: 'normal', label: '正常' },
  { value: 'fast', label: '快速' },
]

function update(key, value) {
  emit('update', { key, value })
}
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.65);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-modal {
  background: linear-gradient(180deg, #1a2858, #0f1d4a);
  border: 1px solid rgba(74,107,255,.4);
  border-radius: 16px;
  padding: 28px 32px;
  min-width: 380px;
  max-width: 460px;
  width: 90vw;
  box-shadow: 0 24px 64px rgba(0,0,0,.6);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: var(--gold);
}

.close-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: color 0.15s;
}
.close-btn:hover { color: white; }

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.setting-label {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dim);
  flex-shrink: 0;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: flex-end;
}

.slider {
  width: 120px;
  accent-color: #4a6bff;
}

.slider-val {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: var(--gold);
  min-width: 28px;
  text-align: right;
}

.radio-row {
  display: flex;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--text-dim);
  cursor: pointer;
}

.radio-input {
  accent-color: #4a6bff;
}

/* Toggle */
.toggle-label {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-track {
  display: block;
  width: 44px;
  height: 24px;
  background: rgba(255,255,255,.1);
  border-radius: 12px;
  border: 1px solid rgba(74,107,255,.3);
  position: relative;
  transition: background 0.2s;
}

.toggle-input:checked + .toggle-track {
  background: #4a6bff;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 9px;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,.3);
}

.toggle-input:checked + .toggle-track .toggle-thumb {
  transform: translateX(20px);
}

.close-full-btn {
  width: 100%;
  font-size: 13px;
}
</style>
