<template>
  <div class="ambient-panel">
    <div class="ambient-panel-overlay" @click="handleClose"></div>
    <div class="ambient-panel-content">
      <div class="panel-header">
        <h3 class="panel-title">🎵 环境白噪音</h3>
        <button class="close-btn" @click="handleClose" title="关闭">✕</button>
      </div>

      <div class="master-control">
        <div class="master-volume">
          <span class="volume-icon">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="ambientStore.masterVolume"
            @input="onMasterVolumeChange"
            class="volume-slider master-slider"
          />
          <span class="volume-value">{{ Math.round(ambientStore.masterVolume * 100) }}%</span>
        </div>
        <button class="stop-all-btn" @click="stopAll" :disabled="!ambientStore.isPlaying">
          ⏹ 全部停止
        </button>
      </div>

      <div class="panel-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'sounds' }"
          @click="activeTab = 'sounds'"
        >
          音效库
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'presets' }"
          @click="activeTab = 'presets'"
        >
          预设组合
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'custom' }"
          @click="activeTab = 'custom'"
        >
          我的声音
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'sounds'" class="sounds-grid">
          <div
            v-for="sound in builtinSounds"
            :key="sound.id"
            class="sound-card"
            :class="{ active: ambientStore.isSoundActive(sound.id) }"
            @click="toggleSound(sound.id)"
          >
            <div class="sound-icon">{{ sound.icon }}</div>
            <div class="sound-info">
              <div class="sound-name">{{ sound.name }}</div>
              <div class="sound-desc">{{ sound.description }}</div>
            </div>
            <div v-if="ambientStore.isSoundActive(sound.id)" class="sound-volume" @click.stop>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="ambientStore.soundVolumes[sound.id] ?? 0.5"
                @input="onSoundVolumeChange(sound.id, $event)"
                class="volume-slider"
              />
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'presets'" class="presets-list">
          <div class="preset-header">
            <span class="preset-count">共 {{ ambientStore.presets.length }} 个预设</span>
            <button
              class="save-preset-btn"
              @click="showSavePresetModal = true"
              :disabled="!ambientStore.isPlaying"
            >
              💾 保存当前
            </button>
          </div>
          <div class="presets-grid">
            <div
              v-for="preset in ambientStore.presets"
              :key="preset.id"
              class="preset-card"
              :class="{ active: ambientStore.activePreset === preset.id }"
              @click="applyPreset(preset.id)"
            >
              <div class="preset-name">{{ preset.name }}</div>
              <div class="preset-sounds">
                {{ getPresetSoundNames(preset).join('、') }}
              </div>
              <button
                v-if="isCustomPreset(preset.id)"
                class="delete-preset-btn"
                @click.stop="deletePreset(preset.id)"
                title="删除预设"
              >
                🗑
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'custom'" class="custom-sounds">
          <div class="upload-area" @click="triggerUpload">
            <input
              ref="fileInput"
              type="file"
              accept="audio/*"
              multiple
              style="display: none"
              @change="handleFileUpload"
            />
            <div class="upload-icon">📁</div>
            <div class="upload-text">点击上传本地音频文件</div>
            <div class="upload-hint">支持 MP3、WAV、OGG 等格式</div>
          </div>

          <div v-if="ambientStore.customSounds.length === 0" class="empty-state">
            <div class="empty-icon">🎵</div>
            <div class="empty-text">暂无自定义音频</div>
          </div>

          <div v-else class="custom-list">
            <div
              v-for="sound in ambientStore.customSounds"
              :key="sound.id"
              class="custom-sound-item"
              :class="{ active: ambientStore.isSoundActive(sound.id) }"
            >
              <div class="custom-sound-info" @click="toggleSound(sound.id)">
                <span class="custom-sound-icon">{{ sound.icon }}</span>
                <span class="custom-sound-name">{{ sound.name }}</span>
              </div>
              <div class="custom-sound-controls">
                <input
                  v-if="ambientStore.isSoundActive(sound.id)"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  :value="ambientStore.soundVolumes[sound.id] ?? 0.5"
                  @input="onSoundVolumeChange(sound.id, $event)"
                  class="volume-slider small-slider"
                />
                <button class="remove-btn" @click="removeCustomSound(sound.id)" title="删除">
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="ambientStore.isPlaying" class="active-sounds-bar">
        <div class="active-label">正在播放：</div>
        <div class="active-sound-tags">
          <span
            v-for="sound in ambientStore.getActiveSounds()"
            :key="sound.id"
            class="active-sound-tag"
          >
            {{ sound.icon }} {{ sound.name }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="showSavePresetModal" class="modal-overlay" @click.self="showSavePresetModal = false">
      <div class="modal-content">
        <h4>保存为预设</h4>
        <input
          v-model="newPresetName"
          type="text"
          class="preset-name-input"
          placeholder="输入预设名称..."
          @keyup.enter="savePreset"
        />
        <div class="modal-buttons">
          <button class="cancel-btn" @click="showSavePresetModal = false">取消</button>
          <button class="confirm-btn" @click="savePreset">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAmbientSoundStore } from '../stores/ambientSound'
import { Message } from '@arco-design/web-vue'

const emit = defineEmits(['close'])

const ambientStore = useAmbientSoundStore()

const activeTab = ref('sounds')
const showSavePresetModal = ref(false)
const newPresetName = ref('')
const fileInput = ref(null)

const builtinSounds = computed(() => {
  return ambientStore.getAllSounds().filter(s => s.category !== 'custom')
})

function toggleSound(soundId) {
  ambientStore.toggleSound(soundId)
  ambientStore.saveToStorage()
}

function onSoundVolumeChange(soundId, event) {
  const volume = parseFloat(event.target.value)
  ambientStore.setSoundVolume(soundId, volume)
  ambientStore.saveToStorage()
}

function onMasterVolumeChange(event) {
  ambientStore.setMasterVolume(parseFloat(event.target.value))
  ambientStore.saveToStorage()
}

function stopAll() {
  ambientStore.stopAll()
  ambientStore.saveToStorage()
}

function applyPreset(presetId) {
  ambientStore.applyPreset(presetId)
  ambientStore.saveToStorage()
}

function getPresetSoundNames(preset) {
  const names = []
  Object.keys(preset.sounds).forEach(soundId => {
    const sound = ambientStore.getAllSounds().find(s => s.id === soundId)
    if (sound) {
      names.push(sound.name)
    }
  })
  return names.length > 0 ? names : ['空']
}

function isCustomPreset(presetId) {
  return presetId.startsWith('preset_')
}

function savePreset() {
  const name = newPresetName.value.trim()
  if (!name) {
    Message.warning('请输入预设名称')
    return
  }
  const id = ambientStore.saveCurrentAsPreset(name)
  if (id) {
    Message.success('预设保存成功')
    showSavePresetModal.value = false
    newPresetName.value = ''
  } else {
    Message.warning('当前没有播放中的音效')
  }
}

function deletePreset(presetId) {
  ambientStore.deletePreset(presetId)
  Message.success('预设已删除')
}

function triggerUpload() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

async function handleFileUpload(event) {
  const files = event.target.files
  if (!files || files.length === 0) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const sound = await ambientStore.addCustomSound(file)
    if (sound) {
      Message.success(`已添加: ${sound.name}`)
    } else {
      Message.error(`添加失败: ${file.name}`)
    }
  }

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function removeCustomSound(soundId) {
  ambientStore.removeCustomSound(soundId)
  Message.success('已删除')
}

function handleClose() {
  emit('close')
}

onMounted(() => {
  ambientStore.initAudioContext()
})
</script>

<style scoped>
.ambient-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ambient-panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.ambient-panel-content {
  position: relative;
  width: 560px;
  max-width: 90vw;
  max-height: 80vh;
  background: linear-gradient(135deg, #2c241b 0%, #1a1510 100%);
  border: 1px solid rgba(139, 90, 43, 0.4);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(139, 90, 43, 0.3);
}

.panel-title {
  margin: 0;
  font-size: 18px;
  color: #d4a574;
  font-weight: bold;
  letter-spacing: 1px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(139, 90, 43, 0.1);
  color: #8b7355;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.close-btn:hover {
  background: rgba(255, 80, 80, 0.2);
  color: #ff6b6b;
}

.master-control {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(139, 90, 43, 0.05);
  border-bottom: 1px solid rgba(139, 90, 43, 0.2);
}

.master-volume {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-icon {
  font-size: 18px;
}

.volume-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: rgba(139, 90, 43, 0.2);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #d4a574;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #d4a574;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.master-slider {
  max-width: 200px;
}

.volume-value {
  font-size: 13px;
  color: #8b7355;
  min-width: 40px;
  text-align: right;
}

.stop-all-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 100, 100, 0.3);
  background: rgba(255, 100, 100, 0.1);
  color: #ff8080;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.stop-all-btn:hover:not(:disabled) {
  background: rgba(255, 100, 100, 0.2);
}

.stop-all-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.panel-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 20px 0;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: #8b7355;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #d4a574;
}

.tab-btn.active {
  color: #d4a574;
  border-bottom-color: #d4a574;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.sounds-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.sound-card {
  padding: 14px;
  background: rgba(139, 90, 43, 0.08);
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sound-card:hover {
  background: rgba(139, 90, 43, 0.15);
  border-color: rgba(212, 165, 116, 0.4);
  transform: translateY(-2px);
}

.sound-card.active {
  background: rgba(212, 165, 116, 0.15);
  border-color: rgba(212, 165, 116, 0.6);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.2);
}

.sound-icon {
  font-size: 28px;
}

.sound-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sound-name {
  font-size: 14px;
  font-weight: bold;
  color: #d4a574;
}

.sound-desc {
  font-size: 11px;
  color: #8b7355;
}

.sound-volume {
  width: 100%;
  padding-top: 8px;
  border-top: 1px solid rgba(139, 90, 43, 0.2);
}

.sound-volume .volume-slider {
  width: 100%;
}

.presets-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preset-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.preset-count {
  font-size: 13px;
  color: #8b7355;
}

.save-preset-btn {
  padding: 6px 12px;
  border: 1px solid rgba(212, 165, 116, 0.4);
  background: rgba(212, 165, 116, 0.1);
  color: #d4a574;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.save-preset-btn:hover:not(:disabled) {
  background: rgba(212, 165, 116, 0.2);
}

.save-preset-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.preset-card {
  position: relative;
  padding: 14px;
  background: rgba(139, 90, 43, 0.08);
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-card:hover {
  background: rgba(139, 90, 43, 0.15);
  border-color: rgba(212, 165, 116, 0.4);
}

.preset-card.active {
  background: rgba(212, 165, 116, 0.15);
  border-color: rgba(212, 165, 116, 0.6);
}

.preset-name {
  font-size: 14px;
  font-weight: bold;
  color: #d4a574;
  margin-bottom: 4px;
}

.preset-sounds {
  font-size: 11px;
  color: #8b7355;
  line-height: 1.4;
}

.delete-preset-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 100, 100, 0.15);
  color: #ff8080;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  opacity: 0;
  transition: all 0.2s ease;
}

.preset-card:hover .delete-preset-btn {
  opacity: 1;
}

.delete-preset-btn:hover {
  background: rgba(255, 100, 100, 0.3);
}

.custom-sounds {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-area {
  padding: 30px;
  text-align: center;
  border: 2px dashed rgba(139, 90, 43, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(139, 90, 43, 0.03);
}

.upload-area:hover {
  border-color: rgba(212, 165, 116, 0.5);
  background: rgba(212, 165, 116, 0.05);
}

.upload-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #d4a574;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #8b7355;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: #8b7355;
}

.custom-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-sound-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgba(139, 90, 43, 0.08);
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.custom-sound-item.active {
  background: rgba(212, 165, 116, 0.1);
  border-color: rgba(212, 165, 116, 0.4);
}

.custom-sound-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
}

.custom-sound-icon {
  font-size: 20px;
}

.custom-sound-name {
  font-size: 14px;
  color: #d4a574;
}

.custom-sound-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.small-slider {
  width: 100px;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 100, 100, 0.1);
  color: #ff8080;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(255, 100, 100, 0.25);
}

.active-sounds-bar {
  padding: 12px 20px;
  background: rgba(212, 165, 116, 0.08);
  border-top: 1px solid rgba(139, 90, 43, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
}

.active-label {
  font-size: 12px;
  color: #8b7355;
  white-space: nowrap;
}

.active-sound-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.active-sound-tag {
  padding: 4px 10px;
  background: rgba(212, 165, 116, 0.15);
  color: #d4a574;
  font-size: 11px;
  border-radius: 12px;
  border: 1px solid rgba(212, 165, 116, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: linear-gradient(135deg, #2c241b 0%, #1a1510 100%);
  border: 1px solid rgba(139, 90, 43, 0.4);
  border-radius: 12px;
  padding: 24px;
  width: 320px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-content h4 {
  margin: 0 0 16px 0;
  color: #d4a574;
  font-size: 16px;
}

.preset-name-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(139, 90, 43, 0.3);
  background: rgba(0, 0, 0, 0.2);
  color: #d4a574;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.preset-name-input:focus {
  border-color: #d4a574;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.cancel-btn {
  border: 1px solid rgba(139, 90, 43, 0.3);
  background: transparent;
  color: #8b7355;
}

.cancel-btn:hover {
  background: rgba(139, 90, 43, 0.1);
}

.confirm-btn {
  border: none;
  background: #d4a574;
  color: #2c241b;
  font-weight: bold;
}

.confirm-btn:hover {
  background: #e0b887;
}
</style>
