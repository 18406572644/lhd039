<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">⚙️ 设置</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="modal-body">
        <div class="settings-section">
          <h3 class="section-title">📝 写作体验</h3>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">打字机效果</span>
              <span class="setting-desc">模拟老式打字机的纸张震动和文字效果</span>
            </div>
            <a-switch 
              v-model="settingsStore.typewriterEffect" 
              @change="save"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">显示虚拟键盘</span>
              <span class="setting-desc">在底部显示复古风格的物理键盘</span>
            </div>
            <a-switch 
              v-model="settingsStore.showVirtualKeyboard" 
              @change="save"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">显示统计信息</span>
              <span class="setting-desc">在状态栏显示字数、时长等统计</span>
            </div>
            <a-switch 
              v-model="settingsStore.showStats" 
              @change="save"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Markdown 渲染模式</span>
              <span class="setting-desc">实时渲染 Markdown 语法为格式化文本</span>
            </div>
            <a-switch 
              :model-value="settingsStore.editorMode === 'markdown'"
              @change="toggleMarkdownMode"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">字体大小</span>
              <span class="setting-desc">调整编辑区域的文字大小</span>
            </div>
            <div class="setting-control">
              <a-slider 
                v-model="settingsStore.fontSize" 
                :min="12" 
                :max="28" 
                :step="1"
                @change="save"
                style="width: 150px;"
              />
              <span class="setting-value">{{ settingsStore.fontSize }}px</span>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">行高</span>
              <span class="setting-desc">调整编辑区域的行间距</span>
            </div>
            <div class="setting-control">
              <a-slider 
                v-model="settingsStore.lineHeight" 
                :min="1.2" 
                :max="3" 
                :step="0.1"
                @change="save"
                style="width: 150px;"
              />
              <span class="setting-value">{{ settingsStore.lineHeight.toFixed(1) }}</span>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">自动保存间隔</span>
              <span class="setting-desc">每隔多少秒自动保存一次</span>
            </div>
            <div class="setting-control">
              <a-slider 
                v-model="settingsStore.autoSaveInterval" 
                :min="10" 
                :max="120" 
                :step="10"
                @change="save"
                style="width: 150px;"
              />
              <span class="setting-value">{{ settingsStore.autoSaveInterval }}秒</span>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h3 class="section-title">🔊 音效设置</h3>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">音效开关</span>
              <span class="setting-desc">开启或关闭所有打字机音效</span>
            </div>
            <a-switch 
              v-model="settingsStore.soundEnabled" 
              @change="save"
            />
          </div>
          
          <div class="setting-item" v-if="settingsStore.soundEnabled">
            <div class="setting-info">
              <span class="setting-label">按键音音量</span>
              <span class="setting-desc">调整打字按键声音的大小</span>
            </div>
            <div class="setting-control">
              <a-slider 
                v-model="settingsStore.keySoundVolume" 
                :min="0" 
                :max="1" 
                :step="0.1"
                @change="save"
                style="width: 150px;"
              />
              <span class="setting-value">{{ Math.round(settingsStore.keySoundVolume * 100) }}%</span>
            </div>
          </div>
          
          <div class="setting-item" v-if="settingsStore.soundEnabled">
            <div class="setting-info">
              <span class="setting-label">翻页音音量</span>
              <span class="setting-desc">调整翻页和切换文档的声音大小</span>
            </div>
            <div class="setting-control">
              <a-slider 
                v-model="settingsStore.pageSoundVolume" 
                :min="0" 
                :max="1" 
                :step="0.1"
                @change="save"
                style="width: 150px;"
              />
              <span class="setting-value">{{ Math.round(settingsStore.pageSoundVolume * 100) }}%</span>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h3 class="section-title">⌨️ 快捷键</h3>
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <span class="shortcut-key">F11</span>
              <span class="shortcut-desc">切换专注模式</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-key">Ctrl + S</span>
              <span class="shortcut-desc">手动保存</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-key">Ctrl + ,</span>
              <span class="shortcut-desc">打开设置</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-key">Ctrl + N</span>
              <span class="shortcut-desc">新建文章</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <a-button type="primary" @click="$emit('close')">完成</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '../stores/settings'

defineEmits(['close'])

const settingsStore = useSettingsStore()

function save() {
  settingsStore.saveSettings()
}

function toggleMarkdownMode(checked) {
  if (checked) {
    settingsStore.editorMode = 'markdown'
  } else {
    settingsStore.editorMode = 'plaintext'
  }
  save()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  width: 600px;
  max-height: 80vh;
  background: linear-gradient(145deg, #2c241b 0%, #1a1510 100%);
  border-radius: 12px;
  border: 1px solid rgba(139, 90, 43, 0.4);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(139, 90, 43, 0.3);
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #d4a574;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(139, 90, 43, 0.2);
  color: #a89078;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(139, 90, 43, 0.4);
  color: #d4a574;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.settings-section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #d4a574;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(139, 90, 43, 0.2);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid rgba(139, 90, 43, 0.1);
}

.setting-info {
  flex: 1;
}

.setting-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #d4c4a8;
  margin-bottom: 4px;
}

.setting-desc {
  display: block;
  font-size: 12px;
  color: #8b7355;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-value {
  min-width: 50px;
  text-align: right;
  font-size: 13px;
  color: #d4a574;
  font-weight: bold;
}

.shortcuts-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: rgba(139, 90, 43, 0.1);
  border-radius: 6px;
}

.shortcut-key {
  padding: 4px 10px;
  background: rgba(139, 90, 43, 0.3);
  color: #f5deb3;
  font-size: 12px;
  font-weight: bold;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}

.shortcut-desc {
  font-size: 12px;
  color: #a89078;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(139, 90, 43, 0.3);
  display: flex;
  justify-content: flex-end;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

:deep(.arco-switch-checked) {
  background-color: #8b5a2b !important;
}

:deep(.arco-slider-button::after) {
  background-color: #d4a574 !important;
  border-color: #d4a574 !important;
}

:deep(.arco-slider-bar) {
  background-color: #8b5a2b !important;
}

:deep(.arco-btn-primary) {
  background-color: #8b5a2b !important;
  border-color: #8b5a2b !important;
}

:deep(.arco-btn-primary:hover) {
  background-color: #a06c35 !important;
  border-color: #a06c35 !important;
}
</style>
