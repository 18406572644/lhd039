<template>
  <div class="app-container" :class="{ 'focus-mode': settingsStore.focusMode }">
    <Sidebar v-if="!settingsStore.focusMode && !typingStore.isTypingMode" />
    <div class="main-content">
      <HeaderBar v-if="!typingStore.isTypingMode" />
      <TypingPractice v-if="typingStore.isTypingMode" @exit="exitTypingMode" />
      <template v-else>
        <TypewriterEditor />
        <StatusBar v-if="settingsStore.showStats" />
        <VirtualKeyboard v-if="settingsStore.showVirtualKeyboard" />
      </template>
    </div>
    
    <div v-if="settingsStore.focusMode" class="focus-exit-float-btn" @click="exitFocusMode" title="退出专注模式 (双击Esc)">
      <span class="focus-exit-icon">✕</span>
      <span class="focus-exit-hint">退出专注</span>
    </div>
    
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
    <DocumentList v-if="showDocumentList" @close="showDocumentList = false" />
    <AmbientSoundPanel v-if="showAmbientPanel" @close="showAmbientPanel = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { useSettingsStore } from './stores/settings'
import { useDocumentStore } from './stores/document'
import { useSoundStore } from './stores/sound'
import { useTypingStore } from './stores/typing'
import { useAmbientSoundStore } from './stores/ambientSound'
import Sidebar from './components/Sidebar.vue'
import HeaderBar from './components/HeaderBar.vue'
import TypewriterEditor from './components/TypewriterEditor.vue'
import StatusBar from './components/StatusBar.vue'
import VirtualKeyboard from './components/VirtualKeyboard.vue'
import SettingsModal from './components/SettingsModal.vue'
import DocumentList from './components/DocumentList.vue'
import TypingPractice from './components/TypingPractice.vue'
import AmbientSoundPanel from './components/AmbientSoundPanel.vue'

const settingsStore = useSettingsStore()
const documentStore = useDocumentStore()
const soundStore = useSoundStore()
const typingStore = useTypingStore()
const ambientStore = useAmbientSoundStore()

const showSettings = ref(false)
const showDocumentList = ref(false)
const showAmbientPanel = ref(false)
let autoSaveTimer = null
let writingTimer = null
let lastActivityTime = Date.now()
let lastEscPressTime = 0

provide('openSettings', () => { showSettings.value = true })
provide('openDocumentList', () => { showDocumentList.value = true })
provide('toggleSettings', () => { showSettings.value = !showSettings.value })
provide('toggleDocumentList', () => { showDocumentList.value = !showDocumentList.value })
provide('enterTypingMode', () => { typingStore.enterTypingMode() })
provide('exitTypingMode', () => { typingStore.exitTypingMode() })
provide('toggleAmbientPanel', () => { showAmbientPanel.value = !showAmbientPanel.value })

async function initApp() {
  await settingsStore.loadSettings()
  await documentStore.loadFromStorage()
  await typingStore.loadFromStorage()
  soundStore.initAudio()
  ambientStore.loadFromStorage()
  startTimers()
}

function startTimers() {
  autoSaveTimer = setInterval(() => {
    if (Date.now() - lastActivityTime < 5000) {
      documentStore.saveToStorage()
    }
  }, settingsStore.autoSaveInterval * 1000)

  writingTimer = setInterval(() => {
    if (Date.now() - lastActivityTime < 2000 && !typingStore.isTypingMode) {
      documentStore.addWritingTime(1)
    }
  }, 1000)
}

function handleActivity() {
  lastActivityTime = Date.now()
}

function handleKeydown(e) {
  if (e.key === 'F11') {
    e.preventDefault()
    settingsStore.toggleFocusMode()
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    if (showAmbientPanel.value) {
      showAmbientPanel.value = false
      return
    }
    if (showSettings.value) {
      showSettings.value = false
      return
    }
    if (showDocumentList.value) {
      showDocumentList.value = false
      return
    }
    const now = Date.now()
    if (now - lastEscPressTime < 500) {
      if (settingsStore.focusMode) {
        settingsStore.toggleFocusMode()
        if (settingsStore.soundEnabled) {
          soundStore.playBellSound(settingsStore.pageSoundVolume * 0.3)
        }
      }
      lastEscPressTime = 0
    } else {
      lastEscPressTime = now
    }
  }
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    documentStore.saveToStorage()
  }
  if (e.ctrlKey && e.key === ',') {
    e.preventDefault()
    showSettings.value = !showSettings.value
  }
  handleActivity()
}

function exitFocusMode() {
  if (settingsStore.focusMode) {
    settingsStore.toggleFocusMode()
    if (settingsStore.soundEnabled) {
      soundStore.playBellSound(settingsStore.pageSoundVolume * 0.3)
    }
  }
}

function exitTypingMode() {
  typingStore.exitTypingMode()
}

onMounted(() => {
  initApp()
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('mousemove', handleActivity)
  window.addEventListener('click', handleActivity)
})

onUnmounted(() => {
  if (autoSaveTimer) clearInterval(autoSaveTimer)
  if (writingTimer) clearInterval(writingTimer)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('mousemove', handleActivity)
  window.removeEventListener('click', handleActivity)
  documentStore.saveToStorage()
  typingStore.saveToStorage()
})
</script>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2c241b 0%, #1a1510 50%, #0d0a08 100%);
  transition: all 0.3s ease;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.focus-mode .main-content {
  padding: 20px;
}

.focus-mode {
  background: radial-gradient(ellipse at center, #1a1510 0%, #0a0806 100%);
}

.focus-exit-float-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(212, 165, 116, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 165, 116, 0.3);
  border-radius: 24px;
  color: #d4a574;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease;
}

.focus-exit-float-btn:hover {
  background: rgba(212, 165, 116, 0.3);
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(212, 165, 116, 0.3);
}

.focus-exit-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.focus-exit-hint {
  font-family: 'Courier Prime', 'Courier New', monospace;
  letter-spacing: 1px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
