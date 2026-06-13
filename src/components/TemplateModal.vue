<template>
  <div class="template-modal-overlay" @click.self="$emit('close')">
    <div class="template-modal-container">
      <div class="modal-header">
        <h2 class="modal-title">📜 从模板创建</h2>
        <div class="header-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'templates' }"
            @click="activeTab = 'templates'"
          >
            📚 模板库
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'market' }"
            @click="activeTab = 'market'"
          >
            🏪 模板市场
          </button>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="modal-body">
        <div v-if="activeTab === 'templates'" class="templates-view">
          <div class="sidebar">
            <div class="category-list">
              <div 
                class="category-item"
                :class="{ active: selectedCategory === 'all' }"
                @click="selectedCategory = 'all'"
              >
                <span class="category-icon">📁</span>
                <span class="category-name">全部模板</span>
                <span class="category-count">{{ templateStore.allTemplates.length }}</span>
              </div>
              <div 
                v-for="cat in templateCategories" 
                :key="cat.id"
                class="category-item"
                :class="{ active: selectedCategory === cat.name }"
                @click="selectedCategory = cat.name"
              >
                <span class="category-icon">{{ cat.icon }}</span>
                <span class="category-name">{{ cat.name }}</span>
                <span class="category-count">{{ getCategoryCount(cat.name) }}</span>
              </div>
            </div>
            
            <div class="quick-actions">
              <button class="blank-doc-btn" @click="createBlankDocument">
                <span class="btn-icon">📄</span>
                <span>创建空白文档</span>
              </button>
            </div>
          </div>
          
          <div class="template-grid-wrapper">
            <div class="search-bar">
              <input 
                v-model="searchKeyword" 
                type="text" 
                class="search-input"
                placeholder="🔍 搜索模板..."
              />
            </div>
            
            <div class="template-grid">
              <div 
                v-for="template in filteredTemplates" 
                :key="template.id"
                class="template-card"
                :class="{ selected: selectedTemplate?.id === template.id, custom: template.type === 'custom' }"
                @click="selectTemplate(template)"
                @dblclick="useTemplate(template)"
              >
                <div class="template-header">
                  <span class="template-icon">{{ template.icon }}</span>
                  <span v-if="template.type === 'custom'" class="custom-badge">我的</span>
                  <span v-else class="builtin-badge">内置</span>
                </div>
                <h3 class="template-name">{{ template.name }}</h3>
                <p class="template-desc">{{ template.description }}</p>
                <div class="template-meta">
                  <span class="template-category">{{ template.category }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="preview-panel" v-if="selectedTemplate">
            <div class="preview-header">
              <h3 class="preview-title">{{ selectedTemplate.icon }} {{ selectedTemplate.name }}</h3>
              <button 
                v-if="selectedTemplate.type === 'custom'" 
                class="delete-btn"
                @click="deleteTemplate(selectedTemplate)"
                title="删除模板"
              >
                🗑️
              </button>
            </div>
            <div class="preview-content">
              <div class="preview-paper">
                <div class="preview-title-hint">{{ selectedTemplate.defaultTitle }}</div>
                <div class="preview-body">{{ truncateContent(selectedTemplate.content) }}</div>
              </div>
            </div>
            <div class="preview-actions">
              <button class="use-template-btn" @click="useTemplate(selectedTemplate)">
                ✨ 使用此模板
              </button>
            </div>
          </div>
          <div class="preview-panel empty-preview" v-else>
            <div class="empty-preview-content">
              <div class="empty-icon">👆</div>
              <p>选择一个模板查看预览</p>
              <p class="hint">双击模板可直接使用</p>
            </div>
          </div>
        </div>
        
        <div v-else-if="activeTab === 'market'" class="market-view">
          <div class="market-header">
            <div class="market-search">
              <input 
                v-model="marketSearchKeyword" 
                type="text" 
                class="search-input"
                placeholder="🔍 搜索模板市场..."
              />
            </div>
            <div class="market-filters">
              <button 
                v-for="filter in marketFilters" 
                :key="filter.value"
                class="filter-btn"
                :class="{ active: marketFilter === filter.value }"
                @click="marketFilter = filter.value"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>
          
          <div class="market-grid">
            <div 
              v-for="template in filteredMarketTemplates" 
              :key="template.marketId || template.id"
              class="market-card"
            >
              <div class="market-card-header">
                <span class="market-template-icon">{{ template.icon }}</span>
                <div class="market-card-title">
                  <h3>{{ template.name }}</h3>
                  <span v-if="template.isOfficial" class="official-badge">✨ 官方推荐</span>
                </div>
              </div>
              <p class="market-card-desc">{{ template.description }}</p>
              <div class="market-card-stats">
                <div class="stat-item">
                  <span class="stat-icon">⭐</span>
                  <span>{{ template.averageRating || '4.8' }}</span>
                  <span class="stat-count">({{ template.ratingCount || 128 }})</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">⬇️</span>
                  <span>{{ formatNumber(template.downloads || 1024) }}</span>
                </div>
              </div>
              <div class="market-card-author">
                <span>👤 {{ template.author || '热心用户' }}</span>
              </div>
              <div class="market-card-actions">
                <button class="download-btn" @click="downloadMarketTemplate(template)">
                  ⬇️ 下载
                </button>
                <button class="rate-btn" @click="showRatingModal(template)">
                  ⭐ 评分
                </button>
              </div>
            </div>
          </div>
          
          <div class="upload-section">
            <h3 class="upload-title">📤 分享我的模板</h3>
            <p class="upload-desc">将你的优秀模板分享给更多用户</p>
            <button class="upload-btn" @click="showUploadModal = true">
              📤 上传模板
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showRatingModalFlag" class="rating-modal-overlay" @click.self="showRatingModalFlag = false">
      <div class="rating-modal">
        <h3>为模板评分</h3>
        <div class="stars">
          <span 
            v-for="i in 5" 
            :key="i"
            class="star"
            :class="{ active: i <= userRating }"
            @click="userRating = i"
          >
            ⭐
          </span>
        </div>
        <textarea 
          v-model="ratingComment"
          class="rating-comment"
          placeholder="写下你的评价（选填）"
        ></textarea>
        <div class="rating-actions">
          <button class="cancel-btn" @click="showRatingModalFlag = false">取消</button>
          <button class="submit-btn" @click="submitRating">提交评分</button>
        </div>
      </div>
    </div>
    
    <div v-if="showUploadModal" class="upload-modal-overlay" @click.self="showUploadModal = false">
      <div class="upload-modal">
        <h3>上传模板到市场</h3>
        <div class="upload-form">
          <div class="form-group">
            <label>选择模板</label>
            <select v-model="uploadTemplateId" class="form-select">
              <option value="">请选择一个自定义模板</option>
              <option 
                v-for="t in templateStore.customTemplates" 
                :key="t.id" 
                :value="t.id"
              >
                {{ t.icon }} {{ t.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>模板描述</label>
            <textarea 
              v-model="uploadDescription" 
              class="form-textarea"
              placeholder="介绍一下你的模板..."
            ></textarea>
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="uploadCategory" class="form-select">
              <option v-for="cat in templateCategories" :key="cat.id" :value="cat.name">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="upload-actions">
          <button class="cancel-btn" @click="showUploadModal = false">取消</button>
          <button class="submit-btn" @click="submitUpload">上传</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useTemplateStore } from '../stores/template'
import { useDocumentStore } from '../stores/document'
import { useSettingsStore } from '../stores/settings'
import { useSoundStore } from '../stores/sound'
import { templateCategories } from '../data/templates'
import { Message, Modal } from '@arco-design/web-vue'

const emit = defineEmits(['close'])

const templateStore = useTemplateStore()
const documentStore = useDocumentStore()
const settingsStore = useSettingsStore()
const soundStore = useSoundStore()

const activeTab = ref('templates')
const selectedCategory = ref('all')
const searchKeyword = ref('')
const selectedTemplate = ref(null)

const marketSearchKeyword = ref('')
const marketFilter = ref('all')
const showRatingModalFlag = ref(false)
const showUploadModal = ref(false)
const ratingTemplate = ref(null)
const userRating = ref(5)
const ratingComment = ref('')
const uploadTemplateId = ref('')
const uploadDescription = ref('')
const uploadCategory = ref('日记')

const marketFilters = [
  { label: '全部', value: 'all' },
  { label: '🔥 热门', value: 'hot' },
  { label: '✨ 官方', value: 'official' },
  { label: '🆕 最新', value: 'new' }
]

const filteredTemplates = computed(() => {
  let templates = templateStore.allTemplates
  
  if (selectedCategory.value !== 'all') {
    templates = templates.filter(t => t.category === selectedCategory.value)
  }
  
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    templates = templates.filter(t => 
      t.name.toLowerCase().includes(keyword) || 
      t.description.toLowerCase().includes(keyword)
    )
  }
  
  return templates
})

const filteredMarketTemplates = computed(() => {
  let templates = [...templateStore.marketTemplates]
  
  if (marketFilter.value === 'hot') {
    templates = templates.sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
  } else if (marketFilter.value === 'official') {
    templates = templates.filter(t => t.isOfficial)
  } else if (marketFilter.value === 'new') {
    templates = templates.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
  }
  
  if (marketSearchKeyword.value.trim()) {
    const keyword = marketSearchKeyword.value.toLowerCase()
    templates = templates.filter(t => 
      t.name.toLowerCase().includes(keyword) || 
      t.description.toLowerCase().includes(keyword)
    )
  }
  
  return templates
})

function getCategoryCount(categoryName) {
  if (categoryName === '自定义') {
    return templateStore.customTemplates.length
  }
  return templateStore.allTemplates.filter(t => t.category === categoryName).length
}

function selectTemplate(template) {
  selectedTemplate.value = template
  if (settingsStore.soundEnabled) {
    soundStore.playKeySound(settingsStore.keySoundVolume * 0.5)
  }
}

function useTemplate(template) {
  const docData = templateStore.createDocumentFromTemplate(template)
  if (docData) {
    documentStore.createDocumentFromTemplate(docData)
    if (settingsStore.soundEnabled) {
      soundStore.playPageTurnSound(settingsStore.pageSoundVolume)
    }
    Message.success(`已从「${template.name}」创建新文档`)
    emit('close')
  }
}

function createBlankDocument() {
  documentStore.createNewDocument()
  if (settingsStore.soundEnabled) {
    soundStore.playPageTurnSound(settingsStore.pageSoundVolume)
  }
  Message.success('已创建空白文档')
  emit('close')
}

function deleteTemplate(template) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除模板「${template.name}」吗？此操作无法撤销。`,
    okText: '删除',
    cancelText: '取消',
    okButtonProps: { status: 'danger' },
    onOk: () => {
      templateStore.deleteCustomTemplate(template.id)
      if (selectedTemplate.value?.id === template.id) {
        selectedTemplate.value = null
      }
      Message.success('模板已删除')
      if (settingsStore.soundEnabled) {
        soundStore.playBackspaceSound(settingsStore.keySoundVolume)
      }
    }
  })
}

function truncateContent(content) {
  if (!content) return ''
  return content.substring(0, 300) + (content.length > 300 ? '...' : '')
}

function downloadMarketTemplate(template) {
  const result = templateStore.downloadTemplate(template)
  if (result) {
    Message.success(`已下载模板「${template.name}」到我的模板`)
    if (settingsStore.soundEnabled) {
      soundStore.playPageTurnSound(settingsStore.pageSoundVolume * 0.7)
    }
  }
}

function showRatingModal(template) {
  ratingTemplate.value = template
  userRating.value = templateStore.userRatings[template.marketId || template.id] || 5
  ratingComment.value = ''
  showRatingModalFlag.value = true
}

function submitRating() {
  if (ratingTemplate.value) {
    templateStore.rateTemplate(ratingTemplate.value.marketId || ratingTemplate.value.id, userRating.value)
    Message.success('感谢您的评分！')
    showRatingModalFlag.value = false
    if (settingsStore.soundEnabled) {
      soundStore.playKeySound(settingsStore.keySoundVolume * 0.7)
    }
  }
}

function submitUpload() {
  if (!uploadTemplateId.value) {
    Message.warning('请选择要上传的模板')
    return
  }
  
  const result = templateStore.uploadTemplate(uploadTemplateId.value)
  if (result) {
    if (uploadDescription.value || uploadCategory.value) {
      templateStore.updateCustomTemplate(uploadTemplateId.value, {
        description: uploadDescription.value,
        category: uploadCategory.value
      })
    }
    Message.success('模板已成功上传到市场！')
    showUploadModal.value = false
    uploadTemplateId.value = ''
    uploadDescription.value = ''
    if (settingsStore.soundEnabled) {
      soundStore.playBellSound(settingsStore.pageSoundVolume * 0.5)
    }
  }
}

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<style scoped>
.template-modal-overlay {
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

.template-modal-container {
  width: 1100px;
  max-width: 95vw;
  height: 700px;
  max-height: 90vh;
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
  gap: 20px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(139, 90, 43, 0.3);
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #d4a574;
  margin: 0;
}

.header-tabs {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: 8px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #8b7355;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.tab-btn:hover {
  color: #d4a574;
}

.tab-btn.active {
  background: rgba(139, 90, 43, 0.4);
  color: #f5deb3;
}

.close-btn {
  margin-left: auto;
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
  overflow: hidden;
  display: flex;
}

.templates-view {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid rgba(139, 90, 43, 0.2);
  display: flex;
  flex-direction: column;
}

.category-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #a89078;
}

.category-item:hover {
  background: rgba(139, 90, 43, 0.2);
  color: #d4a574;
}

.category-item.active {
  background: rgba(139, 90, 43, 0.35);
  color: #f5deb3;
}

.category-icon {
  font-size: 16px;
}

.category-name {
  flex: 1;
  font-size: 13px;
}

.category-count {
  font-size: 11px;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
  color: #8b7355;
}

.category-item.active .category-count {
  background: rgba(212, 165, 116, 0.2);
  color: #d4a574;
}

.quick-actions {
  padding: 12px;
  border-top: 1px solid rgba(139, 90, 43, 0.2);
}

.blank-doc-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px dashed rgba(139, 90, 43, 0.4);
  background: rgba(139, 90, 43, 0.1);
  color: #d4a574;
  font-size: 13px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.blank-doc-btn:hover {
  background: rgba(139, 90, 43, 0.2);
  border-color: rgba(212, 165, 116, 0.5);
}

.template-grid-wrapper {
  flex: 1 1 auto;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(139, 90, 43, 0.25);
  background: rgba(0, 0, 0, 0.08);
}

.search-bar {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(139, 90, 43, 0.2);
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid rgba(139, 90, 43, 0.3);
  background: rgba(0, 0, 0, 0.2);
  color: #d4c4a8;
  font-size: 13px;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
}

.search-input:focus {
  border-color: rgba(212, 165, 116, 0.5);
}

.search-input::placeholder {
  color: #8b7355;
}

.template-grid {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  align-content: start;
  min-height: 0;
}

.template-card {
  background: linear-gradient(145deg, #3d3126 0%, #2c241b 100%);
  border: 1px solid rgba(139, 90, 43, 0.45);
  border-radius: 10px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  overflow: hidden;
  min-height: 130px;
}

.template-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #d4a574, #8b5a2b);
  opacity: 0.7;
}

.template-card:hover {
  background: linear-gradient(145deg, #4a3c2e 0%, #3d3126 100%);
  border-color: rgba(212, 165, 116, 0.6);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.template-card:hover::before {
  opacity: 1;
}

.template-card.selected {
  background: linear-gradient(145deg, #5c4a38 0%, #4a3c2e 100%);
  border-color: rgba(212, 165, 116, 0.85);
  box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.3), 0 4px 16px rgba(0, 0, 0, 0.4);
}

.template-card.selected::before {
  opacity: 1;
  background: linear-gradient(90deg, #f5deb3, #d4a574);
}

.template-card.custom {
  border-left: 4px solid #d4a574;
}

.template-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-icon {
  font-size: 24px;
}

.builtin-badge, .custom-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.builtin-badge {
  color: #8b7355;
}

.custom-badge {
  color: #d4a574;
  background: rgba(212, 165, 116, 0.2);
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #e8d5b7;
  margin: 0;
  line-height: 1.3;
}

.template-desc {
  font-size: 12px;
  color: #a89078;
  margin: 0;
  line-height: 1.5;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-meta {
  display: flex;
  justify-content: space-between;
}

.template-category {
  font-size: 11px;
  color: #6b5344;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.preview-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.2);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(139, 90, 43, 0.2);
}

.preview-title {
  font-size: 15px;
  font-weight: 500;
  color: #d4a574;
  margin: 0;
}

.delete-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #8b7355;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: rgba(220, 50, 50, 0.2);
  color: #ff6b6b;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.preview-paper {
  background: #f5f0e6;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.preview-title-hint {
  font-size: 12px;
  font-weight: bold;
  color: #3d2b1f;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(139, 90, 43, 0.3);
  margin-bottom: 10px;
}

.preview-body {
  font-size: 10px;
  color: #6b5344;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.preview-actions {
  padding: 16px;
  border-top: 1px solid rgba(139, 90, 43, 0.2);
}

.use-template-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: linear-gradient(145deg, #8b5a2b, #6b4423);
  color: #f5deb3;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.use-template-btn:hover {
  background: linear-gradient(145deg, #a06c35, #8b5a2b);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 90, 43, 0.4);
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-preview-content {
  text-align: center;
  color: #8b7355;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.hint {
  font-size: 12px;
  color: #6b5344;
  margin-top: 8px;
}

.market-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
}

.market-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.market-search {
  flex: 1;
}

.market-filters {
  display: flex;
  gap: 4px;
}

.filter-btn {
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

.filter-btn:hover {
  color: #d4a574;
  border-color: rgba(212, 165, 116, 0.4);
}

.filter-btn.active {
  background: rgba(139, 90, 43, 0.3);
  color: #f5deb3;
  border-color: rgba(212, 165, 116, 0.5);
}

.market-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  align-content: start;
}

.market-card {
  background: rgba(139, 90, 43, 0.15);
  border: 1px solid rgba(139, 90, 43, 0.25);
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s ease;
}

.market-card:hover {
  background: rgba(139, 90, 43, 0.25);
  border-color: rgba(212, 165, 116, 0.4);
  transform: translateY(-2px);
}

.market-card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.market-template-icon {
  font-size: 32px;
}

.market-card-title {
  flex: 1;
}

.market-card-title h3 {
  font-size: 15px;
  font-weight: 500;
  color: #d4c4a8;
  margin: 0 0 4px 0;
}

.official-badge {
  display: inline-block;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: linear-gradient(135deg, #d4a574, #b8956a);
  color: #1a1510;
  font-weight: 500;
}

.market-card-desc {
  font-size: 12px;
  color: #8b7355;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.market-card-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #a89078;
}

.stat-icon {
  font-size: 11px;
}

.stat-count {
  color: #6b5344;
  font-size: 11px;
}

.market-card-author {
  font-size: 11px;
  color: #6b5344;
  margin-bottom: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(139, 90, 43, 0.2);
}

.market-card-actions {
  display: flex;
  gap: 8px;
}

.download-btn, .rate-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid rgba(139, 90, 43, 0.3);
  background: rgba(139, 90, 43, 0.1);
  color: #d4a574;
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.download-btn:hover, .rate-btn:hover {
  background: rgba(139, 90, 43, 0.2);
  border-color: rgba(212, 165, 116, 0.4);
}

.upload-section {
  margin-top: 16px;
  padding: 20px;
  text-align: center;
  background: rgba(139, 90, 43, 0.1);
  border: 1px dashed rgba(139, 90, 43, 0.4);
  border-radius: 10px;
}

.upload-title {
  font-size: 16px;
  color: #d4a574;
  margin: 0 0 8px 0;
}

.upload-desc {
  font-size: 12px;
  color: #8b7355;
  margin: 0 0 16px 0;
}

.upload-btn {
  padding: 10px 24px;
  border: none;
  background: linear-gradient(145deg, #8b5a2b, #6b4423);
  color: #f5deb3;
  font-size: 13px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.upload-btn:hover {
  background: linear-gradient(145deg, #a06c35, #8b5a2b);
}

.rating-modal-overlay, .upload-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.rating-modal, .upload-modal {
  width: 400px;
  background: linear-gradient(145deg, #2c241b 0%, #1a1510 100%);
  border-radius: 12px;
  border: 1px solid rgba(139, 90, 43, 0.4);
  padding: 24px;
  animation: slideUp 0.2s ease;
}

.rating-modal h3, .upload-modal h3 {
  font-size: 18px;
  color: #d4a574;
  margin: 0 0 20px 0;
  text-align: center;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.star {
  font-size: 32px;
  cursor: pointer;
  opacity: 0.3;
  transition: all 0.2s ease;
}

.star:hover {
  transform: scale(1.2);
}

.star.active {
  opacity: 1;
}

.rating-comment, .form-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid rgba(139, 90, 43, 0.3);
  background: rgba(0, 0, 0, 0.2);
  color: #d4c4a8;
  font-size: 13px;
  border-radius: 8px;
  outline: none;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 16px;
}

.rating-comment:focus, .form-textarea:focus, .form-select:focus {
  border-color: rgba(212, 165, 116, 0.5);
}

.rating-comment::placeholder, .form-textarea::placeholder {
  color: #8b7355;
}

.rating-actions, .upload-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn, .submit-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(139, 90, 43, 0.3);
  background: transparent;
  color: #a89078;
  font-size: 13px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.cancel-btn:hover {
  background: rgba(139, 90, 43, 0.2);
}

.submit-btn {
  background: linear-gradient(145deg, #8b5a2b, #6b4423);
  color: #f5deb3;
  border: none;
}

.submit-btn:hover {
  background: linear-gradient(145deg, #a06c35, #8b5a2b);
}

.upload-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #a89078;
  margin-bottom: 8px;
}

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(139, 90, 43, 0.3);
  background: rgba(0, 0, 0, 0.2);
  color: #d4c4a8;
  font-size: 13px;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
}

.form-select option {
  background: #2c241b;
  color: #d4c4a8;
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
