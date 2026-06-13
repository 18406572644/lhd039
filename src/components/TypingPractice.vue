<template>
  <div class="typing-practice">
    <div class="practice-header">
      <div class="header-left">
        <button class="back-btn" @click="$emit('exit')">
          <span>←</span> 返回写作
        </button>
        <h1 class="practice-title">⌨️ 打字训练</h1>
      </div>
      <div class="header-right">
        <button 
          class="mode-btn"
          :class="{ active: showHistory }"
          @click="showHistory = !showHistory"
        >
          {{ showHistory ? '🏋️ 练习' : '📊 历史成绩' }}
        </button>
      </div>
    </div>

    <div v-if="showHistory" class="history-view">
      <TypingHistory />
    </div>

    <div v-else class="practice-content">
      <div v-if="!typingStore.currentParagraph" class="paragraph-selector">
        <div class="selector-header">
          <h2 class="selector-title">选择练习段落</h2>
          <div class="quick-actions">
            <button class="action-btn" @click="selectRandomByDifficulty('easy')">
              🎲 随机简单
            </button>
            <button class="action-btn" @click="selectRandomByDifficulty('medium')">
              🎲 随机中等
            </button>
            <button class="action-btn" @click="selectRandomByDifficulty('hard')">
              🎲 随机困难
            </button>
          </div>
        </div>

        <div class="filter-bar">
          <div class="filter-group">
            <span class="filter-label">难度：</span>
            <div class="filter-options">
              <button
                v-for="(config, key) in DIFFICULTY_CONFIG"
                :key="key"
                class="filter-btn"
                :class="{ active: selectedDifficulty === key }"
                :style="{ '--color': config.color }"
                @click="selectedDifficulty = selectedDifficulty === key ? null : key"
              >
                {{ config.name }}
              </button>
            </div>
          </div>
          <div class="filter-group">
            <span class="filter-label">分类：</span>
            <div class="filter-options">
              <button
                v-for="(config, key) in CATEGORY_CONFIG"
                :key="key"
                class="filter-btn"
                :class="{ active: selectedCategory === key }"
                @click="selectedCategory = selectedCategory === key ? null : key"
              >
                {{ config.icon }} {{ config.name }}
              </button>
            </div>
          </div>
        </div>

        <div class="paragraph-list">
          <div
            v-for="paragraph in filteredParagraphs"
            :key="paragraph.id"
            class="paragraph-card"
            @click="selectParagraph(paragraph)"
          >
            <div class="card-header">
              <h3 class="paragraph-title">{{ paragraph.title }}</h3>
              <div class="card-tags">
                <span 
                  class="tag difficulty-tag" 
                  :style="{ background: DIFFICULTY_CONFIG[paragraph.difficulty].color + '33', color: DIFFICULTY_CONFIG[paragraph.difficulty].color }"
                >
                  {{ DIFFICULTY_CONFIG[paragraph.difficulty].name }}
                </span>
                <span class="tag category-tag">
                  {{ CATEGORY_CONFIG[paragraph.category].icon }} {{ CATEGORY_CONFIG[paragraph.category].name }}
                </span>
                <span class="tag length-tag">
                  {{ paragraph.content.length }}字
                </span>
              </div>
            </div>
            <p class="paragraph-preview">{{ paragraph.content.substring(0, 100) }}...</p>
          </div>
        </div>
      </div>

      <div v-else class="typing-area">
        <div class="typing-stats-bar">
          <div class="stat-item">
            <span class="stat-label">⏱️ 用时</span>
            <span class="stat-value time-value">{{ formatTime(typingStore.elapsedSeconds) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">⚡ CPM</span>
            <span class="stat-value speed-value">{{ typingStore.cpm }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">📝 WPM</span>
            <span class="stat-value speed-value">{{ typingStore.wpm }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">🎯 准确率</span>
            <span class="stat-value accuracy-value">{{ typingStore.accuracy }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">❌ 错误</span>
            <span class="stat-value error-value">{{ typingStore.errorCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">📊 进度</span>
            <span class="stat-value progress-value">{{ typingStore.progress }}%</span>
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: typingStore.progress + '%' }"></div>
        </div>

        <div v-if="!typingStore.isFinished" class="typing-main">
          <div class="paragraph-display" ref="paragraphDisplay">
            <span
              v-for="(char, index) in typingStore.currentParagraph.content"
              :key="index"
              class="char"
              :class="getCharClass(index)"
            >{{ char === ' ' ? '␣' : char === '\n' ? '↵' : char }}</span>
          </div>

          <div class="input-wrapper" @click="focusInput">
            <textarea
              ref="inputRef"
              v-model="typingStore.userInput"
              class="typing-input"
              @keydown="handleKeydown"
              @input="handleInput"
              :placeholder="typingStore.isStarted ? '继续输入...' : '点击这里开始打字练习'"
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
            />
          </div>

          <div class="action-bar">
            <button class="control-btn" @click="resetPractice">
              🔄 重新开始
            </button>
            <button class="control-btn" @click="changeParagraph">
              📋 换一段
            </button>
            <button class="control-btn" @click="backToSelect">
              ↩️ 返回选择
            </button>
          </div>

          <div v-if="typingStore.errorCount > 0" class="error-panel">
            <h4 class="error-title">常见错误：</h4>
            <div class="error-list">
              <span 
                v-for="(error, idx) in typingStore.getTopErrors(8)" 
                :key="idx" 
                class="error-tag"
              >
                {{ error.pattern }} × {{ error.count }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="result-panel">
          <div class="result-score">
            <div class="score-circle" :style="scoreColor">
              <span class="score-number">{{ currentScore }}</span>
              <span class="score-label">分</span>
            </div>
            <div class="result-title">练习完成！</div>
            <div class="result-desc">{{ currentSuggestion }}</div>
          </div>

          <div class="result-stats">
            <div class="result-stat-item">
              <span class="result-stat-icon">⚡</span>
              <span class="result-stat-value">{{ typingStore.cpm }}</span>
              <span class="result-stat-label">字符/分钟 (CPM)</span>
            </div>
            <div class="result-stat-item">
              <span class="result-stat-icon">📝</span>
              <span class="result-stat-value">{{ typingStore.wpm }}</span>
              <span class="result-stat-label">词/分钟 (WPM)</span>
            </div>
            <div class="result-stat-item">
              <span class="result-stat-icon">🎯</span>
              <span class="result-stat-value">{{ typingStore.accuracy }}%</span>
              <span class="result-stat-label">准确率</span>
            </div>
            <div class="result-stat-item">
              <span class="result-stat-icon">⏱️</span>
              <span class="result-stat-value">{{ formatTime(typingStore.elapsedSeconds) }}</span>
              <span class="result-stat-label">总用时</span>
            </div>
            <div class="result-stat-item">
              <span class="result-stat-icon">✅</span>
              <span class="result-stat-value">{{ typingStore.correctKeystrokes }}</span>
              <span class="result-stat-label">正确字符</span>
            </div>
            <div class="result-stat-item">
              <span class="result-stat-icon">❌</span>
              <span class="result-stat-value">{{ typingStore.errorCount }}</span>
              <span class="result-stat-label">错误次数</span>
            </div>
          </div>

          <div v-if="typingStore.errorCount > 0" class="result-errors">
            <h4>🔍 错误字符统计：</h4>
            <div class="error-chart">
              <div 
                v-for="(error, idx) in typingStore.getTopErrors(10)" 
                :key="idx" 
                class="error-bar-item"
              >
                <span class="error-pattern">{{ error.pattern }}</span>
                <div class="error-bar-wrapper">
                  <div 
                    class="error-bar" 
                    :style="{ width: (error.count / typingStore.errorCount * 100) + '%' }"
                  ></div>
                </div>
                <span class="error-count">{{ error.count }}</span>
              </div>
            </div>
          </div>

          <div class="result-actions">
            <button class="primary-btn" @click="resetPractice">
              🔄 再练一次
            </button>
            <button class="secondary-btn" @click="changeParagraph">
              📋 换一段
            </button>
            <button class="secondary-btn" @click="backToSelect">
              📚 重新选择
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useTypingStore } from '../stores/typing'
import { useSettingsStore } from '../stores/settings'
import { useSoundStore } from '../stores/sound'
import { 
  TYPING_PARAGRAPHS, 
  DIFFICULTY_CONFIG, 
  CATEGORY_CONFIG,
  getRandomParagraph
} from '../data/typingData'
import TypingHistory from './TypingHistory.vue'
import { Message } from '@arco-design/web-vue'

defineEmits(['exit'])

const typingStore = useTypingStore()
const settingsStore = useSettingsStore()
const soundStore = useSoundStore()

const inputRef = ref(null)
const paragraphDisplay = ref(null)
const selectedDifficulty = ref(null)
const selectedCategory = ref(null)
const showHistory = ref(false)
const lastInputLength = ref(0)
const isShaking = ref(false)

const filteredParagraphs = computed(() => {
  let result = TYPING_PARAGRAPHS
  if (selectedDifficulty.value) {
    result = result.filter(p => p.difficulty === selectedDifficulty.value)
  }
  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }
  return result
})

const currentScore = computed(() => {
  if (!typingStore.isFinished) return 0
  const lastRecord = typingStore.history[0]
  return lastRecord ? typingStore.getScore(lastRecord) : 0
})

const currentSuggestion = computed(() => {
  if (!typingStore.isFinished) return ''
  const lastRecord = typingStore.history[0]
  return lastRecord ? typingStore.getSuggestion(lastRecord) : ''
})

const scoreColor = computed(() => {
  const score = currentScore.value
  if (score >= 90) return { background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)' }
  if (score >= 75) return { background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' }
  if (score >= 60) return { background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)' }
  return { background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)' }
})

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function selectParagraph(paragraph) {
  typingStore.selectParagraph(paragraph)
  if (settingsStore.soundEnabled) {
    soundStore.playPageTurnSound(settingsStore.pageSoundVolume)
  }
  nextTick(() => {
    focusInput()
  })
}

function selectRandomByDifficulty(difficulty) {
  const paragraph = typingStore.selectRandomParagraph(difficulty, selectedCategory.value)
  if (paragraph) {
    if (settingsStore.soundEnabled) {
      soundStore.playPageTurnSound(settingsStore.pageSoundVolume)
    }
    Message.success(`已随机选择：${paragraph.title}`)
    nextTick(() => {
      focusInput()
    })
  }
}

function resetPractice() {
  typingStore.resetTyping()
  lastInputLength.value = 0
  if (settingsStore.soundEnabled) {
    soundStore.playBackspaceSound(settingsStore.keySoundVolume)
  }
  nextTick(() => {
    focusInput()
  })
}

function changeParagraph() {
  const current = typingStore.currentParagraph
  let next = null
  if (current) {
    const filtered = filteredParagraphs.value
    const idx = filtered.findIndex(p => p.id === current.id)
    next = filtered[(idx + 1) % filtered.length]
  }
  if (!next) {
    next = getRandomParagraph(selectedDifficulty.value, selectedCategory.value)
  }
  if (next) {
    typingStore.selectParagraph(next)
    if (settingsStore.soundEnabled) {
      soundStore.playPageTurnSound(settingsStore.pageSoundVolume)
    }
    lastInputLength.value = 0
    nextTick(() => {
      focusInput()
    })
  }
}

function backToSelect() {
  typingStore.currentParagraph = null
  typingStore.resetTyping()
  lastInputLength.value = 0
  if (settingsStore.soundEnabled) {
    soundStore.playPageTurnSound(settingsStore.pageSoundVolume * 0.7)
  }
}

function focusInput() {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
}

function getCharClass(index) {
  const inputLen = typingStore.userInput.length
  if (index >= inputLen) {
    return index === inputLen ? 'char-current' : ''
  }
  const expected = typingStore.currentParagraph.content[index]
  const typed = typingStore.userInput[index]
  return expected === typed ? 'char-correct' : 'char-wrong'
}

function handleInput(e) {
  const newLength = typingStore.userInput.length
  const oldLength = lastInputLength.value

  if (newLength > oldLength) {
    const typedChar = typingStore.userInput[newLength - 1]
    const expectedChar = typingStore.currentParagraph?.content[newLength - 1]
    if (expectedChar !== undefined) {
      typingStore.handleKeystroke(expectedChar, typedChar)
      if (settingsStore.typewriterEffect && expectedChar !== typedChar) {
        triggerShake()
      }
    }
  }

  lastInputLength.value = newLength
  scrollToCurrentChar()
}

function handleKeydown(e) {
  if (!settingsStore.soundEnabled) return

  soundStore.initAudio()

  if (e.key === 'Enter') {
    soundStore.playEnterSound(settingsStore.keySoundVolume)
    triggerShake()
  } else if (e.key === 'Backspace' || e.key === 'Delete') {
    soundStore.playBackspaceSound(settingsStore.keySoundVolume)
  } else if (e.key === ' ') {
    soundStore.playKeySound(settingsStore.keySoundVolume, true)
    triggerShake()
  } else if (e.key.length === 1) {
    soundStore.playKeySound(settingsStore.keySoundVolume)
    triggerShake()
  }
}

function triggerShake() {
  if (!settingsStore.typewriterEffect) return
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 100)
}

function scrollToCurrentChar() {
  nextTick(() => {
    if (!paragraphDisplay.value) return
    const currentIdx = typingStore.userInput.length
    const chars = paragraphDisplay.value.querySelectorAll('.char')
    if (chars[currentIdx]) {
      chars[currentIdx].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  })
}

watch(() => typingStore.isFinished, (finished) => {
  if (finished && settingsStore.soundEnabled) {
    soundStore.playBellSound(settingsStore.keySoundVolume)
  }
})

onMounted(() => {
  focusInput()
})
</script>

<style scoped>
.typing-practice {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #2c241b 0%, #1a1510 50%, #0d0a08 100%);
  overflow: hidden;
}

.practice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: linear-gradient(180deg, rgba(44, 36, 27, 0.95) 0%, rgba(26, 21, 16, 0.95) 100%);
  border-bottom: 1px solid rgba(139, 90, 43, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(139, 90, 43, 0.2);
  border: 1px solid rgba(139, 90, 43, 0.3);
  color: #d4a574;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.back-btn:hover {
  background: rgba(139, 90, 43, 0.3);
  transform: translateX(-2px);
}

.practice-title {
  font-size: 18px;
  font-weight: bold;
  color: #d4a574;
  margin: 0;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.mode-btn {
  padding: 8px 16px;
  background: rgba(139, 90, 43, 0.2);
  border: 1px solid rgba(139, 90, 43, 0.3);
  color: #d4a574;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.mode-btn:hover,
.mode-btn.active {
  background: rgba(139, 90, 43, 0.4);
  color: #f5deb3;
}

.practice-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.history-view {
  flex: 1;
  overflow-y: auto;
}

.paragraph-selector {
  max-width: 1200px;
  margin: 0 auto;
}

.selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.selector-title {
  font-size: 20px;
  color: #d4a574;
  margin: 0;
}

.quick-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 10px 18px;
  background: linear-gradient(145deg, #8b5a2b, #6b4423);
  border: none;
  color: #f5deb3;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-weight: 500;
}

.action-btn:hover {
  background: linear-gradient(145deg, #a06c35, #8b5a2b);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: rgba(139, 90, 43, 0.1);
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 8px;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #8b7355;
  font-weight: 500;
  min-width: 50px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-btn {
  padding: 6px 14px;
  background: rgba(139, 90, 43, 0.15);
  border: 1px solid rgba(139, 90, 43, 0.3);
  color: #a89078;
  font-size: 13px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.filter-btn:hover {
  background: rgba(139, 90, 43, 0.25);
  color: #d4a574;
}

.filter-btn.active {
  background: var(--color, #8b5a2b);
  border-color: var(--color, #8b5a2b);
  color: #fff;
}

.paragraph-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.paragraph-card {
  padding: 20px;
  background: linear-gradient(145deg, #2c241b 0%, #1a1510 100%);
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.paragraph-card:hover {
  transform: translateY(-3px);
  border-color: rgba(212, 165, 116, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card-header {
  margin-bottom: 12px;
}

.paragraph-title {
  font-size: 16px;
  color: #d4c4a8;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 3px 10px;
  font-size: 11px;
  border-radius: 12px;
  font-weight: 500;
}

.difficulty-tag {
  font-weight: 600;
}

.category-tag {
  background: rgba(24, 144, 255, 0.2);
  color: #69b1ff;
}

.length-tag {
  background: rgba(139, 90, 43, 0.2);
  color: #d4a574;
}

.paragraph-preview {
  font-size: 13px;
  color: #8b7355;
  line-height: 1.8;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.typing-area {
  max-width: 1000px;
  margin: 0 auto;
}

.typing-stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 16px 20px;
  background: linear-gradient(145deg, #2c241b 0%, #1a1510 100%);
  border: 1px solid rgba(139, 90, 43, 0.3);
  border-radius: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: #8b7355;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.time-value {
  color: #d4a574;
}

.speed-value {
  color: #69b1ff;
}

.accuracy-value {
  color: #52c41a;
}

.error-value {
  color: #ff4d4f;
}

.progress-value {
  color: #faad14;
}

.progress-bar {
  height: 6px;
  background: rgba(139, 90, 43, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5a2b 0%, #d4a574 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.typing-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.paragraph-display {
  padding: 30px;
  background: #f5f0e6;
  border-radius: 8px;
  font-size: 20px;
  line-height: 2.2;
  font-family: 'Typewriter', 'Courier New', monospace;
  letter-spacing: 2px;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 0 60px rgba(139, 90, 43, 0.08);
  cursor: text;
}

.char {
  color: #a89078;
  transition: all 0.1s ease;
  position: relative;
}

.char-correct {
  color: #389e0d;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 2px;
}

.char-wrong {
  color: #cf1322;
  background: rgba(255, 77, 79, 0.15);
  border-radius: 2px;
  text-decoration: underline;
}

.char-current {
  color: #3d2b1f;
  background: rgba(250, 173, 20, 0.3);
  border-radius: 2px;
  animation: currentBlink 1s infinite;
}

@keyframes currentBlink {
  0%, 100% { background: rgba(250, 173, 20, 0.3); }
  50% { background: rgba(250, 173, 20, 0.5); }
}

.input-wrapper {
  cursor: text;
}

.typing-input {
  width: 100%;
  min-height: 120px;
  padding: 20px;
  background: linear-gradient(145deg, #2c241b 0%, #1a1510 100%);
  border: 2px solid rgba(139, 90, 43, 0.3);
  border-radius: 10px;
  color: #f5deb3;
  font-size: 18px;
  line-height: 2;
  font-family: 'Typewriter', 'Courier New', monospace;
  letter-spacing: 1px;
  outline: none;
  resize: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.typing-input:focus {
  border-color: #d4a574;
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

.typing-input::placeholder {
  color: rgba(212, 165, 116, 0.4);
  font-style: italic;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.control-btn {
  padding: 10px 20px;
  background: rgba(139, 90, 43, 0.2);
  border: 1px solid rgba(139, 90, 43, 0.3);
  color: #d4a574;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.control-btn:hover {
  background: rgba(139, 90, 43, 0.35);
  transform: translateY(-1px);
}

.error-panel {
  padding: 16px 20px;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  border-radius: 8px;
}

.error-title {
  font-size: 13px;
  color: #ff7875;
  margin: 0 0 10px 0;
}

.error-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.error-tag {
  padding: 4px 10px;
  background: rgba(255, 77, 79, 0.15);
  border: 1px solid rgba(255, 77, 79, 0.3);
  color: #ff7875;
  font-size: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.result-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 40px 20px;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-score {
  text-align: center;
}

.score-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.score-number {
  font-size: 52px;
  font-weight: bold;
  color: #fff;
  line-height: 1;
  font-family: 'Courier New', monospace;
}

.score-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.result-title {
  font-size: 24px;
  font-weight: bold;
  color: #d4a574;
  margin-bottom: 10px;
}

.result-desc {
  font-size: 14px;
  color: #a89078;
  max-width: 400px;
  line-height: 1.8;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 700px;
}

.result-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(145deg, #2c241b 0%, #1a1510 100%);
  border: 1px solid rgba(139, 90, 43, 0.2);
  border-radius: 10px;
  gap: 6px;
}

.result-stat-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.result-stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #d4a574;
  font-family: 'Courier New', monospace;
}

.result-stat-label {
  font-size: 11px;
  color: #8b7355;
  text-align: center;
}

.result-errors {
  width: 100%;
  max-width: 600px;
  padding: 20px;
  background: rgba(255, 77, 79, 0.08);
  border: 1px solid rgba(255, 77, 79, 0.2);
  border-radius: 10px;
}

.result-errors h4 {
  font-size: 14px;
  color: #ff7875;
  margin: 0 0 16px 0;
}

.error-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.error-bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-pattern {
  min-width: 80px;
  font-size: 13px;
  color: #ff7875;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.error-bar-wrapper {
  flex: 1;
  height: 8px;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.error-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff4d4f, #ff7875);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.error-count {
  min-width: 30px;
  text-align: right;
  font-size: 13px;
  color: #ff7875;
  font-weight: bold;
}

.result-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.primary-btn {
  padding: 12px 28px;
  background: linear-gradient(145deg, #8b5a2b, #6b4423);
  border: none;
  color: #f5deb3;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.primary-btn:hover {
  background: linear-gradient(145deg, #a06c35, #8b5a2b);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.secondary-btn {
  padding: 12px 28px;
  background: rgba(139, 90, 43, 0.2);
  border: 1px solid rgba(139, 90, 43, 0.4);
  color: #d4a574;
  font-size: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.secondary-btn:hover {
  background: rgba(139, 90, 43, 0.35);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .result-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .typing-stats-bar {
    gap: 8px;
  }
  .stat-value {
    font-size: 16px;
  }
}
</style>
