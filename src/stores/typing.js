import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getRandomParagraph } from '../data/typingData'

export const useTypingStore = defineStore('typing', () => {
  const isTypingMode = ref(false)
  const currentParagraph = ref(null)
  const userInput = ref('')
  const startTime = ref(null)
  const endTime = ref(null)
  const isStarted = ref(false)
  const isFinished = ref(false)
  const errorChars = ref({})
  const totalKeystrokes = ref(0)
  const correctKeystrokes = ref(0)
  const history = ref([])

  const elapsedSeconds = computed(() => {
    if (!startTime.value) return 0
    const end = endTime.value || Date.now()
    return Math.floor((end - startTime.value) / 1000)
  })

  const cpm = computed(() => {
    if (elapsedSeconds.value === 0) return 0
    const minutes = elapsedSeconds.value / 60
    return Math.round(correctKeystrokes.value / minutes)
  })

  const wpm = computed(() => {
    if (elapsedSeconds.value === 0) return 0
    const minutes = elapsedSeconds.value / 60
    const words = correctKeystrokes.value / 5
    return Math.round(words / minutes)
  })

  const accuracy = computed(() => {
    if (totalKeystrokes.value === 0) return 100
    return Math.round((correctKeystrokes.value / totalKeystrokes.value) * 100)
  })

  const progress = computed(() => {
    if (!currentParagraph.value) return 0
    return Math.round((userInput.value.length / currentParagraph.value.content.length) * 100)
  })

  const errorCount = computed(() => {
    return Object.values(errorChars.value).reduce((sum, count) => sum + count, 0)
  })

  const averageCpm = computed(() => {
    if (history.value.length === 0) return 0
    const sum = history.value.reduce((acc, record) => acc + record.cpm, 0)
    return Math.round(sum / history.value.length)
  })

  const averageAccuracy = computed(() => {
    if (history.value.length === 0) return 0
    const sum = history.value.reduce((acc, record) => acc + record.accuracy, 0)
    return Math.round(sum / history.value.length)
  })

  const totalPracticeTime = computed(() => {
    return history.value.reduce((sum, record) => sum + record.duration, 0)
  })

  function enterTypingMode() {
    isTypingMode.value = true
    resetTyping()
  }

  function exitTypingMode() {
    isTypingMode.value = false
    resetTyping()
  }

  function selectParagraph(paragraph) {
    currentParagraph.value = paragraph
    resetTyping()
  }

  function selectRandomParagraph(difficulty = null, category = null) {
    const paragraph = getRandomParagraph(difficulty, category)
    if (paragraph) {
      selectParagraph(paragraph)
    }
    return paragraph
  }

  function resetTyping() {
    userInput.value = ''
    startTime.value = null
    endTime.value = null
    isStarted.value = false
    isFinished.value = false
    errorChars.value = {}
    totalKeystrokes.value = 0
    correctKeystrokes.value = 0
  }

  function handleKeystroke(expectedChar, typedChar) {
    if (!isStarted.value) {
      startTyping()
    }
    if (isFinished.value) return

    totalKeystrokes.value++

    if (expectedChar === typedChar) {
      correctKeystrokes.value++
    } else {
      const key = `${typedChar || '空'}→${expectedChar}`
      errorChars.value[key] = (errorChars.value[key] || 0) + 1
    }

    if (userInput.value.length >= currentParagraph.value.content.length) {
      finishTyping()
    }
  }

  function startTyping() {
    isStarted.value = true
    startTime.value = Date.now()
    endTime.value = null
  }

  function finishTyping() {
    isFinished.value = true
    endTime.value = Date.now()
    saveRecord()
  }

  function saveRecord() {
    if (!currentParagraph.value) return

    const record = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      paragraphId: currentParagraph.value.id,
      paragraphTitle: currentParagraph.value.title,
      difficulty: currentParagraph.value.difficulty,
      category: currentParagraph.value.category,
      cpm: cpm.value,
      wpm: wpm.value,
      accuracy: accuracy.value,
      duration: elapsedSeconds.value,
      errors: errorCount.value,
      errorChars: { ...errorChars.value },
      totalChars: currentParagraph.value.content.length,
      correctChars: correctKeystrokes.value,
      totalKeystrokes: totalKeystrokes.value,
      completedAt: new Date().toISOString()
    }

    history.value.unshift(record)
    if (history.value.length > 100) {
      history.value = history.value.slice(0, 100)
    }

    saveToStorage()
    return record
  }

  function getScore(record) {
    const speedScore = Math.min(record.cpm * 0.3, 40)
    const accuracyScore = record.accuracy * 0.5
    const difficultyBonus = record.difficulty === 'hard' ? 10 : record.difficulty === 'medium' ? 5 : 0
    return Math.round(Math.min(speedScore + accuracyScore + difficultyBonus, 100))
  }

  function getSuggestion(record) {
    const score = getScore(record)
    if (score >= 90) {
      return '太棒了！你的打字速度和准确率都非常出色，继续保持！可以尝试更高难度的练习。'
    } else if (score >= 75) {
      return '表现优秀！你已经具备了很好的打字基础，建议多练习困难模式来进一步提升。'
    } else if (score >= 60) {
      return '成绩不错！建议在保持准确率的前提下，逐步提高打字速度。'
    } else if (score >= 40) {
      return '继续努力！建议从简单难度开始，多进行基础练习，注意手指的正确位置。'
    } else {
      return '不要着急，打字需要循序渐进。建议先进行简单难度的练习，打好基础后再逐步提高。'
    }
  }

  function getTopErrors(limit = 5) {
    const errors = Object.entries(errorChars.value)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
    return errors.map(([pattern, count]) => ({ pattern, count }))
  }

  async function saveToStorage() {
    if (!window.electronAPI) return
    try {
      await window.electronAPI.saveTypingHistory(history.value)
    } catch (error) {
      console.error('保存打字练习记录失败:', error)
    }
  }

  async function loadFromStorage() {
    if (!window.electronAPI) return
    try {
      const result = await window.electronAPI.loadTypingHistory()
      if (result.success && result.data) {
        history.value = result.data
      }
    } catch (error) {
      console.error('加载打字练习记录失败:', error)
    }
  }

  function clearHistory() {
    history.value = []
    saveToStorage()
  }

  return {
    isTypingMode,
    currentParagraph,
    userInput,
    isStarted,
    isFinished,
    errorChars,
    totalKeystrokes,
    correctKeystrokes,
    history,
    elapsedSeconds,
    cpm,
    wpm,
    accuracy,
    progress,
    errorCount,
    averageCpm,
    averageAccuracy,
    totalPracticeTime,
    enterTypingMode,
    exitTypingMode,
    selectParagraph,
    selectRandomParagraph,
    resetTyping,
    handleKeystroke,
    startTyping,
    finishTyping,
    getScore,
    getSuggestion,
    getTopErrors,
    saveToStorage,
    loadFromStorage,
    clearHistory
  }
})
