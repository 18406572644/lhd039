<template>
  <div class="header-bar" :class="{ 'focus-hidden': settingsStore.focusMode }">
    <div class="header-left">
      <button 
        class="header-btn"
        @click="toggleDocumentList"
        title="文章列表"
      >
        📚
      </button>
      <button 
        class="header-btn"
        @click="openTemplateModalHandler"
        title="从模板创建 (Ctrl+N)"
      >
        📜
      </button>
      <button 
        class="header-btn"
        @click="openSaveAsTemplateModalHandler"
        title="另存为模板 (Ctrl+Shift+S)"
      >
        💾
      </button>
      <button 
        class="header-btn typing-btn"
        @click="enterTypingMode"
        title="打字训练"
      >
        ⌨️
      </button>
    </div>
    
    <div class="header-center">
      <input
        v-if="isEditingTitle"
        ref="titleInputRef"
        v-model="localTitle"
        class="title-edit-input"
        @blur="finishEditTitle"
        @keydown="handleTitleKeydown"
        @dblclick.stop
      />
      <div v-else class="current-title" @dblclick="editTitle">
        {{ documentStore.currentDocument?.title || '未命名文章' }}
      </div>
      <div v-if="documentStore.isSaving" class="saving-indicator">
        <span class="saving-dot"></span>
        保存中...
      </div>
      <div v-else-if="documentStore.lastSaved" class="last-saved">
        已保存于 {{ formatTime(documentStore.lastSaved) }}
      </div>
    </div>
    
    <div class="header-right">
      <button 
        class="header-btn ambient-btn"
        :class="{ active: ambientStore.isPlaying }"
        @click="toggleAmbientPanel"
        title="环境白噪音"
      >
        🎵
      </button>
      <button 
        class="header-btn"
        :class="{ active: settingsStore.soundEnabled }"
        @click="toggleSound"
        title="音效开关"
      >
        {{ settingsStore.soundEnabled ? '🔊' : '🔇' }}
      </button>
      <button 
        class="header-btn"
        :class="{ active: settingsStore.typewriterEffect }"
        @click="toggleTypewriter"
        title="打字机效果"
      >
        ⌨️
      </button>
      <button 
        class="header-btn focus-btn"
        :class="{ active: settingsStore.focusMode }"
        @click="toggleFocus"
        title="专注模式 (F11)"
      >
        {{ settingsStore.focusMode ? '🔆' : '🌙' }}
      </button>
      <button 
        class="header-btn"
        @click="toggleSettings"
        title="设置 (Ctrl+,)"
      >
        ⚙️
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, nextTick, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useDocumentStore } from '../stores/document'
import { useSoundStore } from '../stores/sound'
import { useAmbientSoundStore } from '../stores/ambientSound'
import { Message } from '@arco-design/web-vue'

const settingsStore = useSettingsStore()
const documentStore = useDocumentStore()
const soundStore = useSoundStore()
const ambientStore = useAmbientSoundStore()

const toggleSettings = inject('toggleSettings')
const toggleDocumentList = inject('toggleDocumentList')
const enterTypingMode = inject('enterTypingMode')
const toggleAmbientPanel = inject('toggleAmbientPanel')
const openTemplateModal = inject('openTemplateModal')
const openSaveAsTemplateModal = inject('openSaveAsTemplateModal')

const isEditingTitle = ref(false)
const titleInputRef = ref(null)
const localTitle = ref('')

function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function openTemplateModalHandler() {
  openTemplateModal()
  if (settingsStore.soundEnabled) {
    soundStore.playPageTurnSound(settingsStore.pageSoundVolume * 0.5)
  }
}

function openSaveAsTemplateModalHandler() {
  openSaveAsTemplateModal()
  if (settingsStore.soundEnabled) {
    soundStore.playKeySound(settingsStore.keySoundVolume * 0.5)
  }
}

function toggleSound() {
  settingsStore.toggleSound()
  if (settingsStore.soundEnabled) {
    soundStore.initAudio()
    soundStore.playKeySound(settingsStore.keySoundVolume)
  }
}

function toggleTypewriter() {
  settingsStore.toggleTypewriterEffect()
  if (settingsStore.soundEnabled) {
    soundStore.playKeySound(settingsStore.keySoundVolume)
  }
}

function toggleFocus() {
  settingsStore.toggleFocusMode()
  if (settingsStore.soundEnabled) {
    soundStore.playBellSound(settingsStore.pageSoundVolume * 0.3)
  }
}

function editTitle() {
  localTitle.value = documentStore.currentDocument?.title || ''
  isEditingTitle.value = true
  nextTick(() => {
    if (titleInputRef.value) {
      titleInputRef.value.focus()
      titleInputRef.value.select()
    }
  })
  if (settingsStore.soundEnabled) {
    soundStore.playKeySound(settingsStore.keySoundVolume)
  }
}

function finishEditTitle() {
  isEditingTitle.value = false
  const newTitle = localTitle.value.trim() || '未命名文章'
  documentStore.updateTitle(newTitle)
  documentStore.saveToStorage()
}

function handleTitleKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    finishEditTitle()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    isEditingTitle.value = false
  }
}

watch(() => documentStore.currentDocument, (doc) => {
  if (doc && !isEditingTitle.value) {
    localTitle.value = doc.title
  }
}, { immediate: true })

watch(() => documentStore.currentDocument?.title, (newTitle) => {
  if (newTitle !== undefined && !isEditingTitle.value) {
    localTitle.value = newTitle
  }
})
</script>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  background: linear-gradient(180deg, rgba(44, 36, 27, 0.95) 0%, rgba(26, 21, 16, 0.95) 100%);
  border-bottom: 1px solid rgba(139, 90, 43, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.focus-hidden {
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 100;
}

.focus-hidden:hover {
  opacity: 1;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.header-right {
  justify-content: flex-end;
}

.header-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(139, 90, 43, 0.1);
  color: #d4a574;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-btn:hover {
  background: rgba(139, 90, 43, 0.3);
  transform: translateY(-1px);
}

.header-btn.active {
  background: rgba(139, 90, 43, 0.4);
  color: #f5deb3;
}

.header-btn.focus-btn.active {
  background: rgba(212, 165, 116, 0.3);
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.current-title {
  font-size: 15px;
  font-weight: bold;
  color: #d4a574;
  letter-spacing: 1px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.current-title:hover {
  background: rgba(139, 90, 43, 0.2);
}

.title-edit-input {
  font-size: 15px;
  font-weight: bold;
  color: #d4a574;
  letter-spacing: 1px;
  padding: 4px 12px;
  border: 1px solid rgba(212, 165, 116, 0.5);
  border-radius: 6px;
  background: rgba(26, 21, 16, 0.8);
  outline: none;
  text-align: center;
  min-width: 200px;
  max-width: 400px;
}

.title-edit-input:focus {
  border-color: #d4a574;
  box-shadow: 0 0 8px rgba(212, 165, 116, 0.3);
}

.saving-indicator,
.last-saved {
  font-size: 12px;
  color: #8b7355;
  display: flex;
  align-items: center;
  gap: 6px;
}

.saving-dot {
  width: 6px;
  height: 6px;
  background: #d4a574;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
