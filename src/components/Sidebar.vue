<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">⌨️</span>
        <span class="logo-text">复古打字机</span>
      </div>
    </div>
    
    <div class="sidebar-menu">
      <div 
        class="menu-item"
        :class="{ active: typingStore.isTypingMode }"
        @click="enterTypingMode"
      >
        <span class="menu-icon">⌨️</span>
        <span class="menu-text">打字训练</span>
      </div>
      
      <div 
        class="menu-item active"
        @click="toggleDocumentList"
      >
        <span class="menu-icon">📄</span>
        <span class="menu-text">我的文章</span>
        <span class="menu-badge">{{ documentStore.documents.length }}</span>
      </div>
      
      <div 
        class="menu-item"
        @click="openTemplateModalHandler"
      >
        <span class="menu-icon">📜</span>
        <span class="menu-text">从模板创建</span>
      </div>
      
      <div 
        class="menu-item"
        @click="openSaveAsTemplateModalHandler"
      >
        <span class="menu-icon">💾</span>
        <span class="menu-text">另存为模板</span>
      </div>
      
      <div class="menu-divider"></div>
      
      <div 
        class="menu-item"
        :class="{ active: settingsStore.focusMode }"
        @click="toggleFocus"
      >
        <span class="menu-icon">{{ settingsStore.focusMode ? '🔆' : '🌙' }}</span>
        <span class="menu-text">{{ settingsStore.focusMode ? '退出专注' : '专注模式' }}</span>
      </div>
      
      <div 
        class="menu-item"
        @click="exportTxt"
      >
        <span class="menu-icon">📝</span>
        <span class="menu-text">导出 TXT</span>
      </div>
      
      <div 
        class="menu-item"
        @click="exportPdf"
      >
        <span class="menu-icon">📕</span>
        <span class="menu-text">导出 PDF</span>
      </div>
      
      <div class="menu-divider"></div>
      
      <div 
        class="menu-item"
        @click="toggleSettings"
      >
        <span class="menu-icon">⚙️</span>
        <span class="menu-text">设置</span>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <div class="quick-stats">
        <div class="stat-item">
          <span class="stat-value">{{ formatTime(totalWritingTime) }}</span>
          <span class="stat-label">总写作时长</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalWords }}</span>
          <span class="stat-label">总字数</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useDocumentStore } from '../stores/document'
import { useSoundStore } from '../stores/sound'
import { useTypingStore } from '../stores/typing'
import { Message } from '@arco-design/web-vue'

const settingsStore = useSettingsStore()
const documentStore = useDocumentStore()
const soundStore = useSoundStore()
const typingStore = useTypingStore()

const toggleSettings = inject('toggleSettings')
const toggleDocumentList = inject('toggleDocumentList')
const enterTypingMode = inject('enterTypingMode')
const openTemplateModal = inject('openTemplateModal')
const openSaveAsTemplateModal = inject('openSaveAsTemplateModal')

const totalWritingTime = computed(() => {
  return documentStore.documents.reduce((sum, doc) => sum + (doc.writingTime || 0), 0)
})

const totalWords = computed(() => {
  return documentStore.documents.reduce((sum, doc) => {
    const content = doc.content || ''
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = content.replace(/[\u4e00-\u9fa5]/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length
    return sum + chineseChars + englishWords
  }, 0)
})

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分`
  }
  return `${minutes}分钟`
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

function toggleFocus() {
  settingsStore.toggleFocusMode()
  if (settingsStore.soundEnabled) {
    soundStore.playBellSound(settingsStore.pageSoundVolume * 0.3)
  }
}

async function exportTxt() {
  if (!documentStore.currentDocument) return
  
  const docData = documentStore.getDocumentForExport()
  const result = await window.electronAPI.exportTxt(docData.content, docData.title)
  
  if (result.success) {
    Message.success(`已导出到: ${result.path}`)
    if (settingsStore.soundEnabled) {
      soundStore.playPageTurnSound(settingsStore.pageSoundVolume)
    }
  } else if (!result.canceled) {
    Message.error('导出失败: ' + (result.error || '未知错误'))
  }
}

async function exportPdf() {
  if (!documentStore.currentDocument) return
  
  const docData = documentStore.getDocumentForExport()
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          background: #f5f0e6;
          padding: 60px 50px;
          line-height: 2;
          color: #3d2b1f;
          font-size: 16px;
        }
        h1 {
          text-align: center;
          font-size: 24px;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(139, 90, 43, 0.3);
          letter-spacing: 2px;
        }
        .content {
          white-space: pre-wrap;
          word-wrap: break-word;
          letter-spacing: 1px;
        }
        .footer {
          margin-top: 60px;
          text-align: right;
          font-size: 12px;
          color: rgba(61, 43, 31, 0.5);
        }
      </style>
    </head>
    <body>
      <h1>${docData.title}</h1>
      <div class="content">${docData.content.replace(/\n/g, '<br>')}</div>
      <div class="footer">由复古打字机生成 | 写作时长: ${formatTime(docData.writingTime)}</div>
    </body>
    </html>
  `
  
  const result = await window.electronAPI.exportPdf(htmlContent, docData.title)
  
  if (result.success) {
    Message.success(`已导出到: ${result.path}`)
    if (settingsStore.soundEnabled) {
      soundStore.playPageTurnSound(settingsStore.pageSoundVolume)
    }
  } else if (!result.canceled) {
    Message.error('导出失败: ' + (result.error || '未知错误'))
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #2c241b 0%, #1a1510 100%);
  border-right: 2px solid rgba(139, 90, 43, 0.3);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(139, 90, 43, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
  color: #d4a574;
  letter-spacing: 1px;
}

.sidebar-menu {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #a89078;
}

.menu-item:hover {
  background: rgba(139, 90, 43, 0.2);
  color: #d4a574;
}

.menu-item.active {
  background: rgba(139, 90, 43, 0.3);
  color: #f5deb3;
}

.menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-size: 14px;
}

.menu-badge {
  background: rgba(139, 90, 43, 0.5);
  color: #f5deb3;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.menu-divider {
  height: 1px;
  background: rgba(139, 90, 43, 0.2);
  margin: 16px 8px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(139, 90, 43, 0.2);
}

.quick-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #d4a574;
  margin-bottom: 4px;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #8b7355;
}
</style>
