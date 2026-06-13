<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">💾 另存为模板</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="modal-body">
        <div v-if="!documentStore.currentDocument" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>请先打开一篇文章，再将其另存为模板</p>
        </div>
        
        <div v-else class="form-content">
          <div class="doc-preview">
            <div class="doc-preview-icon">📄</div>
            <div class="doc-preview-info">
              <div class="doc-preview-title">{{ documentStore.currentDocument.title }}</div>
              <div class="doc-preview-meta">{{ getWordCount(documentStore.currentDocument.content) }} 字</div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">模板名称</label>
            <input 
              v-model="templateName" 
              type="text" 
              class="form-input"
              placeholder="为模板取个名字..."
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">模板描述</label>
            <textarea 
              v-model="templateDescription" 
              class="form-textarea"
              placeholder="简要描述这个模板的用途..."
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">分类</label>
            <div class="category-select">
              <button 
                v-for="cat in templateCategories" 
                :key="cat.id"
                class="category-btn"
                :class="{ active: selectedCategory === cat.name }"
                @click="selectedCategory = cat.name"
              >
                <span>{{ cat.icon }}</span>
                <span>{{ cat.name }}</span>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">模板图标</label>
            <div class="icon-select">
              <button 
                v-for="icon in iconOptions" 
                :key="icon"
                class="icon-btn"
                :class="{ active: selectedIcon === icon }"
                @click="selectedIcon = icon"
              >
                {{ icon }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer" v-if="documentStore.currentDocument">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button class="save-btn" @click="saveAsTemplate" :disabled="!templateName.trim()">
          💾 保存为模板
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDocumentStore } from '../stores/document'
import { useTemplateStore } from '../stores/template'
import { useSettingsStore } from '../stores/settings'
import { useSoundStore } from '../stores/sound'
import { templateCategories } from '../data/templates'
import { Message } from '@arco-design/web-vue'

const emit = defineEmits(['close'])

const documentStore = useDocumentStore()
const templateStore = useTemplateStore()
const settingsStore = useSettingsStore()
const soundStore = useSoundStore()

const templateName = ref(documentStore.currentDocument?.title || '')
const templateDescription = ref('')
const selectedCategory = ref('自定义')
const selectedIcon = ref('📝')

const iconOptions = [
  '📝', '📔', '📚', '📖', '📋', '📊', '🎓', '✈️',
  '💌', '🌅', '🙏', '✅', '💼', '🎨', '💡', '🔧'
]

function getWordCount(content) {
  if (!content) return 0
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = content.replace(/[\u4e00-\u9fa5]/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length
  return chineseChars + englishWords
}

function saveAsTemplate() {
  if (!templateName.value.trim()) {
    Message.warning('请输入模板名称')
    return
  }

  const doc = documentStore.currentDocument
  const template = templateStore.saveAsTemplate(
    doc,
    templateName.value.trim(),
    templateDescription.value.trim(),
    selectedCategory.value
  )

  if (template) {
    templateStore.updateCustomTemplate(template.id, {
      icon: selectedIcon.value
    })

    if (settingsStore.soundEnabled) {
      soundStore.playPageTurnSound(settingsStore.pageSoundVolume)
    }
    Message.success(`模板「${templateName.value}」保存成功！`)
    emit('close')
  }
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
  width: 560px;
  max-height: 85vh;
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
  padding: 20px 24px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #8b7355;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.doc-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(139, 90, 43, 0.1);
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 8px;
  margin-bottom: 24px;
}

.doc-preview-icon {
  font-size: 32px;
}

.doc-preview-title {
  font-size: 15px;
  font-weight: 500;
  color: #d4c4a8;
  margin-bottom: 4px;
}

.doc-preview-meta {
  font-size: 12px;
  color: #8b7355;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #a89078;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(139, 90, 43, 0.3);
  background: rgba(0, 0, 0, 0.2);
  color: #d4c4a8;
  font-size: 14px;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
}

.form-input:focus {
  border-color: rgba(212, 165, 116, 0.5);
}

.form-input::placeholder {
  color: #8b7355;
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px 14px;
  border: 1px solid rgba(139, 90, 43, 0.3);
  background: rgba(0, 0, 0, 0.2);
  color: #d4c4a8;
  font-size: 13px;
  border-radius: 8px;
  outline: none;
  resize: vertical;
  font-family: inherit;
}

.form-textarea:focus {
  border-color: rgba(212, 165, 116, 0.5);
}

.form-textarea::placeholder {
  color: #8b7355;
}

.category-select {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid rgba(139, 90, 43, 0.3);
  background: transparent;
  color: #8b7355;
  font-size: 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.category-btn:hover {
  color: #d4a574;
  border-color: rgba(212, 165, 116, 0.4);
}

.category-btn.active {
  background: rgba(139, 90, 43, 0.3);
  color: #f5deb3;
  border-color: rgba(212, 165, 116, 0.5);
}

.icon-select {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(139, 90, 43, 0.2);
  background: rgba(0, 0, 0, 0.1);
  font-size: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: rgba(139, 90, 43, 0.2);
  border-color: rgba(212, 165, 116, 0.4);
}

.icon-btn.active {
  background: rgba(139, 90, 43, 0.4);
  border-color: rgba(212, 165, 116, 0.6);
  box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.2);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(139, 90, 43, 0.3);
}

.cancel-btn, .save-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.cancel-btn {
  border: 1px solid rgba(139, 90, 43, 0.3);
  background: transparent;
  color: #a89078;
}

.cancel-btn:hover {
  background: rgba(139, 90, 43, 0.2);
}

.save-btn {
  border: none;
  background: linear-gradient(145deg, #8b5a2b, #6b4423);
  color: #f5deb3;
  font-weight: 500;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #a06c35, #8b5a2b);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
