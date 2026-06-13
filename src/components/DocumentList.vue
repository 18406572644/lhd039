<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">📚 我的文章</h2>
        <div class="header-actions">
          <button class="new-btn" @click="createNew">
            <span>✏️</span> 新建
          </button>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>
      </div>
      
      <div class="modal-body">
        <div v-if="documentStore.documents.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>还没有文章，点击上方按钮创建第一篇吧</p>
        </div>
        
        <div v-else class="document-list">
          <div 
            v-for="doc in sortedDocuments" 
            :key="doc.id"
            class="document-item"
            :class="{ active: doc.id === documentStore.currentDocId }"
            @click="openDocument(doc.id)"
          >
            <div class="doc-icon">📄</div>
            <div class="doc-info">
              <div class="doc-title">{{ doc.title || '未命名文章' }}</div>
              <div class="doc-meta">
                <span class="meta-item">
                  <span class="meta-icon">📝</span>
                  {{ getWordCount(doc.content) }} 字
                </span>
                <span class="meta-item">
                  <span class="meta-icon">⏱️</span>
                  {{ formatTime(doc.writingTime) }}
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📅</span>
                  {{ formatDate(doc.updatedAt) }}
                </span>
              </div>
            </div>
            <div class="doc-actions">
              <button 
                class="action-btn delete-btn" 
                @click.stop="deleteDoc(doc)"
                title="删除"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDocumentStore } from '../stores/document'
import { useSettingsStore } from '../stores/settings'
import { useSoundStore } from '../stores/sound'
import { Message, Modal } from '@arco-design/web-vue'

const emit = defineEmits(['close'])

const documentStore = useDocumentStore()
const settingsStore = useSettingsStore()
const soundStore = useSoundStore()

const sortedDocuments = computed(() => {
  return [...documentStore.documents].sort((a, b) => 
    new Date(b.updatedAt) - new Date(a.updatedAt)
  )
})

function getWordCount(content) {
  if (!content) return 0
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = content.replace(/[\u4e00-\u9fa5]/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length
  return chineseChars + englishWords
}

function formatTime(seconds) {
  if (!seconds) return '0分钟'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分`
  }
  return `${minutes}分钟`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
}

function createNew() {
  documentStore.createNewDocument()
  if (settingsStore.soundEnabled) {
    soundStore.playPageTurnSound(settingsStore.pageSoundVolume)
  }
  Message.success('已创建新文章')
  emit('close')
}

function openDocument(docId) {
  documentStore.openDocument(docId)
  if (settingsStore.soundEnabled) {
    soundStore.playPageTurnSound(settingsStore.pageSoundVolume * 0.7)
  }
  emit('close')
}

function deleteDoc(doc) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除文章「${doc.title || '未命名文章'}」吗？此操作无法撤销。`,
    okText: '删除',
    cancelText: '取消',
    okButtonProps: { status: 'danger' },
    onOk: () => {
      documentStore.deleteDocument(doc.id)
      if (settingsStore.soundEnabled) {
        soundStore.playBackspaceSound(settingsStore.keySoundVolume)
      }
      Message.success('文章已删除')
    }
  })
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
  width: 700px;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.new-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: linear-gradient(145deg, #8b5a2b, #6b4423);
  color: #f5deb3;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.new-btn:hover {
  background: linear-gradient(145deg, #a06c35, #8b5a2b);
  transform: translateY(-1px);
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
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #8b7355;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(139, 90, 43, 0.1);
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.document-item:hover {
  background: rgba(139, 90, 43, 0.2);
  border-color: rgba(139, 90, 43, 0.4);
  transform: translateX(4px);
}

.document-item.active {
  background: rgba(139, 90, 43, 0.3);
  border-color: rgba(212, 165, 116, 0.5);
}

.doc-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-title {
  font-size: 15px;
  font-weight: 500;
  color: #d4c4a8;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8b7355;
}

.meta-icon {
  font-size: 11px;
}

.doc-actions {
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #8b7355;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(139, 90, 43, 0.3);
}

.delete-btn:hover {
  background: rgba(220, 50, 50, 0.2);
  color: #ff6b6b;
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
</style>
