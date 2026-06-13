import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDocumentStore = defineStore('document', () => {
  const documents = ref([])
  const currentDocId = ref(null)
  const isSaving = ref(false)
  const lastSaved = ref(null)

  const currentDocument = computed(() => {
    return documents.value.find(doc => doc.id === currentDocId.value) || null
  })

  const wordCount = computed(() => {
    if (!currentDocument.value) return 0
    const text = currentDocument.value.content.trim()
    if (!text) return 0
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = text.replace(/[\u4e00-\u9fa5]/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length
    return chineseChars + englishWords
  })

  const charCount = computed(() => {
    if (!currentDocument.value) return 0
    return currentDocument.value.content.length
  })

  const lineCount = computed(() => {
    if (!currentDocument.value) return 0
    return currentDocument.value.content.split('\n').length
  })

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function createNewDocument() {
    const newDoc = {
      id: generateId(),
      title: '未命名文章',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      writingTime: 0,
      lastOpenedAt: new Date().toISOString()
    }
    documents.value.unshift(newDoc)
    currentDocId.value = newDoc.id
    saveToStorage()
    return newDoc
  }

  function createDocumentFromTemplate(templateData) {
    const newDoc = {
      id: generateId(),
      title: templateData.title || '未命名文章',
      content: templateData.content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      writingTime: 0,
      lastOpenedAt: new Date().toISOString(),
      templateId: templateData.templateId,
      templateName: templateData.templateName
    }
    documents.value.unshift(newDoc)
    currentDocId.value = newDoc.id
    saveToStorage()
    return newDoc
  }

  function openDocument(docId) {
    const doc = documents.value.find(d => d.id === docId)
    if (doc) {
      currentDocId.value = docId
      doc.lastOpenedAt = new Date().toISOString()
      saveToStorage()
    }
  }

  function updateContent(content) {
    if (currentDocument.value) {
      currentDocument.value.content = content
      currentDocument.value.updatedAt = new Date().toISOString()
    }
  }

  function updateTitle(title) {
    if (currentDocument.value) {
      currentDocument.value.title = title
      currentDocument.value.updatedAt = new Date().toISOString()
    }
  }

  function deleteDocument(docId) {
    const index = documents.value.findIndex(d => d.id === docId)
    if (index > -1) {
      documents.value.splice(index, 1)
      if (currentDocId.value === docId) {
        if (documents.value.length > 0) {
          currentDocId.value = documents.value[0].id
        } else {
          createNewDocument()
        }
      }
      saveToStorage()
    }
  }

  function addWritingTime(seconds) {
    if (currentDocument.value) {
      currentDocument.value.writingTime += seconds
    }
  }

  async function saveToStorage() {
    if (!window.electronAPI) return
    isSaving.value = true
    try {
      await window.electronAPI.saveDocument(documents.value)
      lastSaved.value = new Date()
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      isSaving.value = false
    }
  }

  async function loadFromStorage() {
    if (!window.electronAPI) {
      createNewDocument()
      return
    }
    try {
      const result = await window.electronAPI.loadDocuments()
      if (result.success && result.data && result.data.length > 0) {
        documents.value = result.data
        documents.value.sort((a, b) => new Date(b.lastOpenedAt) - new Date(a.lastOpenedAt))
        currentDocId.value = documents.value[0].id
      } else {
        createNewDocument()
      }
    } catch (error) {
      console.error('加载失败:', error)
      createNewDocument()
    }
  }

  function getDocumentForExport() {
    if (!currentDocument.value) return null
    return {
      title: currentDocument.value.title,
      content: currentDocument.value.content,
      writingTime: currentDocument.value.writingTime
    }
  }

  return {
    documents,
    currentDocId,
    currentDocument,
    isSaving,
    lastSaved,
    wordCount,
    charCount,
    lineCount,
    createNewDocument,
    createDocumentFromTemplate,
    openDocument,
    updateContent,
    updateTitle,
    deleteDocument,
    addWritingTime,
    saveToStorage,
    loadFromStorage,
    getDocumentForExport
  }
})
