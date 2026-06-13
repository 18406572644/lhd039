<template>
  <div class="app-container" :class="{ 'focus-mode': settingsStore.focusMode }">
    <Sidebar v-if="!settingsStore.focusMode" />
    <div class="main-content">
      <HeaderBar />
      <TypewriterEditor />
      <StatusBar v-if="settingsStore.showStats" />
      <VirtualKeyboard v-if="settingsStore.showVirtualKeyboard" />
    </div>
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
    <DocumentList v-if="showDocumentList" @close="showDocumentList = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { useSettingsStore } from './stores/settings'
import { useDocumentStore } from './stores/document'
import { useSoundStore } from './stores/sound'
import Sidebar from './components/Sidebar.vue'
import HeaderBar from './components/HeaderBar.vue'
import TypewriterEditor from './components/TypewriterEditor.vue'
import StatusBar from './components/StatusBar.vue'
import VirtualKeyboard from './components/VirtualKeyboard.vue'
import SettingsModal from './components/SettingsModal.vue'
import DocumentList from './components/DocumentList.vue'

const settingsStore = useSettingsStore()
const documentStore = useDocumentStore()
const soundStore = useSoundStore()

const showSettings = ref(false)
const showDocumentList = ref(false)
let autoSaveTimer = null
let writingTimer = null
let lastActivityTime = Date.now()

provide('openSettings', () => { showSettings.value = true })
provide('openDocumentList', () => { showDocumentList.value = true })
provide('toggleSettings', () => { showSettings.value = !showSettings.value })
provide('toggleDocumentList', () => { showDocumentList.value = !showDocumentList.value })

async function initApp() {
  await settingsStore.loadSettings()
  await documentStore.loadFromStorage()
  soundStore.initAudio()
  startTimers()
}

function startTimers() {
  autoSaveTimer = setInterval(() => {
    if (Date.now() - lastActivityTime < 5000) {
      documentStore.saveToStorage()
    }
  }, settingsStore.autoSaveInterval * 1000)

  writingTimer = setInterval(() => {
    if (Date.now() - lastActivityTime < 2000) {
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
})
</script>

<style scoped>
.app-container {
  display: flex;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2c241b 0%, #1a1510 50%, #0d0a08 100%);
  transition: all 0.3s ease;
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
</style>
