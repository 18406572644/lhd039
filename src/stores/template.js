import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { builtinTemplates } from '../data/templates'

export const useTemplateStore = defineStore('template', () => {
  const customTemplates = ref([])
  const marketTemplates = ref([])
  const userRatings = ref({})

  const allTemplates = computed(() => {
    return [
      ...builtinTemplates.map(t => ({ ...t, type: 'builtin' })),
      ...customTemplates.value.map(t => ({ ...t, type: 'custom' }))
    ]
  })

  const templatesByCategory = computed(() => {
    const categories = {}
    allTemplates.value.forEach(template => {
      if (!categories[template.category]) {
        categories[template.category] = []
      }
      categories[template.category].push(template)
    })
    return categories
  })

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function createDocumentFromTemplate(template) {
    if (!template) return null

    return {
      title: template.defaultTitle || '未命名文章',
      content: template.content || '',
      templateId: template.id,
      templateName: template.name
    }
  }

  function saveAsTemplate(document, name, description, category) {
    const template = {
      id: generateId(),
      name: name || document.title,
      description: description || '',
      category: category || '自定义',
      icon: '📝',
      defaultTitle: document.title,
      content: document.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true
    }

    customTemplates.value.unshift(template)
    saveToStorage()
    return template
  }

  function updateCustomTemplate(templateId, updates) {
    const index = customTemplates.value.findIndex(t => t.id === templateId)
    if (index > -1) {
      customTemplates.value[index] = {
        ...customTemplates.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveToStorage()
      return customTemplates.value[index]
    }
    return null
  }

  function deleteCustomTemplate(templateId) {
    const index = customTemplates.value.findIndex(t => t.id === templateId)
    if (index > -1) {
      customTemplates.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  function getTemplateById(templateId) {
    return allTemplates.value.find(t => t.id === templateId)
  }

  function rateTemplate(templateId, rating) {
    userRatings.value[templateId] = rating
    const marketTemplate = marketTemplates.value.find(t => t.id === templateId)
    if (marketTemplate) {
      if (!marketTemplate.ratingCount) {
        marketTemplate.ratingCount = 0
        marketTemplate.averageRating = 0
      }
      const oldTotal = marketTemplate.averageRating * marketTemplate.ratingCount
      marketTemplate.ratingCount += 1
      marketTemplate.averageRating = Math.round(((oldTotal + rating) / marketTemplate.ratingCount) * 10) / 10
    }
    saveToStorage()
  }

  function downloadTemplate(template) {
    const existing = customTemplates.value.find(t => t.marketId === template.id)
    if (existing) {
      return existing
    }

    const newTemplate = {
      id: generateId(),
      marketId: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon,
      defaultTitle: template.defaultTitle,
      content: template.content,
      author: template.author,
      downloads: template.downloads,
      averageRating: template.averageRating,
      ratingCount: template.ratingCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true,
      isDownloaded: true
    }

    customTemplates.value.unshift(newTemplate)
    saveToStorage()
    return newTemplate
  }

  function uploadTemplate(templateId) {
    const template = customTemplates.value.find(t => t.id === templateId)
    if (!template) return null

    const marketTemplate = {
      ...template,
      marketId: template.id,
      author: '用户',
      downloads: 0,
      averageRating: 0,
      ratingCount: 0,
      isOfficial: false,
      uploadedAt: new Date().toISOString()
    }

    marketTemplates.value.unshift(marketTemplate)
    saveToStorage()
    return marketTemplate
  }

  async function saveToStorage() {
    if (!window.electronAPI) return
    try {
      await window.electronAPI.saveTemplates({
        customTemplates: customTemplates.value,
        marketTemplates: marketTemplates.value,
        userRatings: userRatings.value
      })
    } catch (error) {
      console.error('保存模板失败:', error)
    }
  }

  async function loadFromStorage() {
    if (!window.electronAPI) {
      if (marketTemplates.value.length === 0) {
        initMarketTemplates()
      }
      return
    }
    try {
      const result = await window.electronAPI.loadTemplates()
      if (result.success && result.data) {
        customTemplates.value = result.data.customTemplates || []
        marketTemplates.value = result.data.marketTemplates || []
        userRatings.value = result.data.userRatings || {}
      }

      if (marketTemplates.value.length === 0) {
        initMarketTemplates()
      }
    } catch (error) {
      console.error('加载模板失败:', error)
      initMarketTemplates()
    }
  }

  function initMarketTemplates() {
    const sampleMarketTemplates = builtinTemplates
      .filter(t => ['日记', '周报月报', '会议记录', '读书笔记', '小说创作'].includes(t.category))
      .map((t, index) => ({
        ...t,
        marketId: 'market_' + t.id,
        author: index % 3 === 0 ? '官方推荐' : '热心用户',
        downloads: Math.floor(Math.random() * 5000) + 100,
        averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        ratingCount: Math.floor(Math.random() * 200) + 10,
        isOfficial: index % 3 === 0,
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }))

    marketTemplates.value = sampleMarketTemplates
    saveToStorage()
  }

  return {
    customTemplates,
    marketTemplates,
    userRatings,
    allTemplates,
    templatesByCategory,
    createDocumentFromTemplate,
    saveAsTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
    getTemplateById,
    rateTemplate,
    downloadTemplate,
    uploadTemplate,
    saveToStorage,
    loadFromStorage
  }
})
