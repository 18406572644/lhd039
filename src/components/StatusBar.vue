<template>
  <div class="status-bar" :class="{ 'focus-hidden': settingsStore.focusMode }">
    <div class="status-left">
      <div class="status-item">
        <span class="status-icon">📝</span>
        <span class="status-label">字数</span>
        <span class="status-value">{{ documentStore.wordCount }}</span>
      </div>
      <div class="status-item">
        <span class="status-icon">🔤</span>
        <span class="status-label">字符</span>
        <span class="status-value">{{ documentStore.charCount }}</span>
      </div>
      <div class="status-item">
        <span class="status-icon">📃</span>
        <span class="status-label">行数</span>
        <span class="status-value">{{ documentStore.lineCount }}</span>
      </div>
    </div>
    
    <div class="status-center">
      <div class="writing-time">
        <span class="status-icon">⏱️</span>
        <span class="status-label">本次写作</span>
        <span class="status-value">{{ formatWritingTime(currentWritingTime) }}</span>
      </div>
    </div>
    
    <div class="status-right">
      <div class="status-item">
        <span class="status-icon">📖</span>
        <span class="status-label">累计时长</span>
        <span class="status-value">{{ formatWritingTime(totalWritingTime) }}</span>
      </div>
      <div class="status-item">
        <span class="status-icon">🎯</span>
        <span class="status-label">速度</span>
        <span class="status-value">{{ typingSpeed }} 字/分钟</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useDocumentStore } from '../stores/document'

const settingsStore = useSettingsStore()
const documentStore = useDocumentStore()

const currentWritingTime = ref(0)
let timer = null

const totalWritingTime = computed(() => {
  return documentStore.currentDocument?.writingTime || 0
})

const typingSpeed = computed(() => {
  if (currentWritingTime.value < 60) return 0
  const minutes = currentWritingTime.value / 60
  return Math.round(documentStore.wordCount / minutes)
})

function formatWritingTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  timer = setInterval(() => {
    currentWritingTime.value++
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 20px;
  background: linear-gradient(180deg, rgba(26, 21, 16, 0.95) 0%, rgba(13, 10, 8, 0.95) 100%);
  border-top: 1px solid rgba(139, 90, 43, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.focus-hidden {
  opacity: 0;
  transform: translateY(100%);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.focus-hidden:hover {
  opacity: 1;
  transform: translateY(0);
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.status-item,
.writing-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.status-icon {
  font-size: 14px;
}

.status-label {
  color: #8b7355;
}

.status-value {
  color: #d4a574;
  font-weight: bold;
  min-width: 40px;
}

.writing-time .status-value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  letter-spacing: 1px;
}
</style>
