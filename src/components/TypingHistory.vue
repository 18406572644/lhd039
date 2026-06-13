<template>
  <div class="typing-history">
    <div class="history-container">
      <div class="history-header">
        <h2 class="history-title">📊 打字练习数据统计</h2>
        <button 
          v-if="typingStore.history.length > 0"
          class="clear-btn" 
          @click="confirmClear"
        >
          🗑️ 清空记录
        </button>
      </div>

      <div class="stats-overview">
        <div class="overview-card">
          <div class="overview-icon">🏋️</div>
          <div class="overview-info">
            <div class="overview-value">{{ typingStore.history.length }}</div>
            <div class="overview-label">练习次数</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="overview-icon">⚡</div>
          <div class="overview-info">
            <div class="overview-value">{{ typingStore.averageCpm }}</div>
            <div class="overview-label">平均 CPM</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="overview-icon">🎯</div>
          <div class="overview-info">
            <div class="overview-value">{{ typingStore.averageAccuracy }}%</div>
            <div class="overview-label">平均准确率</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="overview-icon">⏱️</div>
          <div class="overview-info">
            <div class="overview-value">{{ formatTotalTime(typingStore.totalPracticeTime) }}</div>
            <div class="overview-label">总练习时长</div>
          </div>
        </div>
      </div>

      <div v-if="typingStore.history.length > 0" class="charts-section">
        <div class="chart-card">
          <h3 class="chart-title">📈 最近10次 CPM 趋势</h3>
          <div class="chart-container">
            <div class="bar-chart">
              <div 
                v-for="(record, idx) in recentRecords" 
                :key="idx" 
                class="bar-item"
              >
                <div 
                  class="bar" 
                  :style="{ height: (record.cpm / maxCpm * 100) + '%', background: getScoreColor(typingStore.getScore(record)) }"
                  :title="`${record.paragraphTitle}: ${record.cpm} CPM, ${record.accuracy}%`"
                >
                  <span class="bar-value">{{ record.cpm }}</span>
                </div>
                <span class="bar-label">#{{ recentRecords.length - idx }}</span>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot" style="background: #52c41a;"></span>
                <span>优秀 (90+)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #1890ff;"></span>
                <span>良好 (75-89)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #faad14;"></span>
                <span>合格 (60-74)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #ff4d4f;"></span>
                <span>待提升 (0-59)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3 class="chart-title">📊 难度分布</h3>
          <div class="difficulty-stats">
            <div 
              v-for="(config, key) in DIFFICULTY_CONFIG" 
              :key="key"
              class="diff-stat-item"
            >
              <div class="diff-header">
                <span 
                  class="diff-tag"
                  :style="{ background: config.color + '33', color: config.color }"
                >{{ config.name }}</span>
                <span class="diff-count">{{ getDifficultyCount(key) }} 次</span>
              </div>
              <div class="diff-meta">
                <span>平均 CPM: <strong>{{ getDifficultyAvgCpm(key) }}</strong></span>
                <span>平均准确率: <strong>{{ getDifficultyAvgAccuracy(key) }}%</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="records-section">
        <div class="section-header">
          <h3 class="section-title">📋 练习记录</h3>
          <div class="filter-group">
            <button
              v-for="(config, key) in ['all', ...Object.keys(DIFFICULTY_CONFIG)]"
              :key="key"
              class="filter-btn"
              :class="{ active: filterDifficulty === key }"
              @click="filterDifficulty = key"
            >
              {{ key === 'all' ? '全部' : DIFFICULTY_CONFIG[key]?.name || key }}
            </button>
          </div>
        </div>

        <div v-if="filteredRecords.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>还没有练习记录，开始你的第一次打字练习吧！</p>
        </div>

        <div v-else class="records-list">
          <div 
            v-for="record in filteredRecords" 
            :key="record.id"
            class="record-card"
          >
            <div class="record-left">
              <div class="record-score" :style="{ background: getScoreColor(typingStore.getScore(record)) }">
                {{ typingStore.getScore(record) }}
              </div>
            </div>
            <div class="record-main">
              <div class="record-header">
                <h4 class="record-title">{{ record.paragraphTitle }}</h4>
                <span 
                  class="record-tag"
                  :style="{ background: DIFFICULTY_CONFIG[record.difficulty]?.color + '33', color: DIFFICULTY_CONFIG[record.difficulty]?.color }"
                >
                  {{ DIFFICULTY_CONFIG[record.difficulty]?.name }}
                </span>
                <span class="record-tag category-tag">
                  {{ CATEGORY_CONFIG[record.category]?.icon }} {{ CATEGORY_CONFIG[record.category]?.name }}
                </span>
              </div>
              <div class="record-stats">
                <span class="record-stat">
                  <span class="stat-icon">⚡</span>
                  <strong>{{ record.cpm }}</strong> CPM
                </span>
                <span class="record-stat">
                  <span class="stat-icon">📝</span>
                  <strong>{{ record.wpm }}</strong> WPM
                </span>
                <span class="record-stat">
                  <span class="stat-icon">🎯</span>
                  <strong>{{ record.accuracy }}%</strong> 准确率
                </span>
                <span class="record-stat">
                  <span class="stat-icon">⏱️</span>
                  <strong>{{ formatTime(record.duration) }}</strong>
                </span>
                <span class="record-stat">
                  <span class="stat-icon">❌</span>
                  <strong>{{ record.errors }}</strong> 错误
                </span>
                <span class="record-stat">
                  <span class="stat-icon">📅</span>
                  {{ formatDate(record.completedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTypingStore } from '../stores/typing'
import { DIFFICULTY_CONFIG, CATEGORY_CONFIG } from '../data/typingData'
import { Modal, Message } from '@arco-design/web-vue'

const typingStore = useTypingStore()

const filterDifficulty = ref('all')

const filteredRecords = computed(() => {
  if (filterDifficulty.value === 'all') {
    return typingStore.history
  }
  return typingStore.history.filter(r => r.difficulty === filterDifficulty.value)
})

const recentRecords = computed(() => {
  return typingStore.history.slice(0, 10).reverse()
})

const maxCpm = computed(() => {
  if (recentRecords.value.length === 0) return 100
  return Math.max(...recentRecords.value.map(r => r.cpm), 100)
})

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

function formatTotalTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${mins}分`
  }
  return `${mins}分钟`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getScoreColor(score) {
  if (score >= 90) return '#52c41a'
  if (score >= 75) return '#1890ff'
  if (score >= 60) return '#faad14'
  return '#ff4d4f'
}

function getDifficultyCount(difficulty) {
  return typingStore.history.filter(r => r.difficulty === difficulty).length
}

function getDifficultyAvgCpm(difficulty) {
  const records = typingStore.history.filter(r => r.difficulty === difficulty)
  if (records.length === 0) return 0
  const sum = records.reduce((acc, r) => acc + r.cpm, 0)
  return Math.round(sum / records.length)
}

function getDifficultyAvgAccuracy(difficulty) {
  const records = typingStore.history.filter(r => r.difficulty === difficulty)
  if (records.length === 0) return 0
  const sum = records.reduce((acc, r) => acc + r.accuracy, 0)
  return Math.round(sum / records.length)
}

function confirmClear() {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空所有打字练习记录吗？此操作无法撤销。',
    okText: '清空',
    cancelText: '取消',
    okButtonProps: { status: 'danger' },
    onOk: () => {
      typingStore.clearHistory()
      Message.success('已清空所有记录')
    }
  })
}
</script>

<style scoped>
.typing-history {
  width: 100%;
  min-height: 100%;
}

.history-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.history-title {
  font-size: 22px;
  color: #d4a574;
  margin: 0;
}

.clear-btn {
  padding: 8px 16px;
  background: rgba(255, 77, 79, 0.15);
  border: 1px solid rgba(255, 77, 79, 0.3);
  color: #ff7875;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.clear-btn:hover {
  background: rgba(255, 77, 79, 0.25);
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(145deg, #2c241b 0%, #1a1510 100%);
  border: 1px solid rgba(139, 90, 43, 0.25);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  border-color: rgba(212, 165, 116, 0.4);
}

.overview-icon {
  font-size: 32px;
}

.overview-value {
  font-size: 26px;
  font-weight: bold;
  color: #d4a574;
  font-family: 'Courier New', monospace;
  line-height: 1.2;
}

.overview-label {
  font-size: 12px;
  color: #8b7355;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 28px;
}

.chart-card {
  padding: 20px;
  background: linear-gradient(145deg, #2c241b 0%, #1a1510 100%);
  border: 1px solid rgba(139, 90, 43, 0.25);
  border-radius: 12px;
}

.chart-title {
  font-size: 16px;
  color: #d4c4a8;
  margin: 0 0 20px 0;
}

.chart-container {
  min-height: 200px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 180px;
  padding: 0 10px;
  gap: 8px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.bar {
  width: 100%;
  max-width: 40px;
  min-height: 4px;
  background: #8b5a2b;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.5s ease;
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.bar-value {
  font-size: 11px;
  color: #fff;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.bar-label {
  font-size: 10px;
  color: #8b7355;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8b7355;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.difficulty-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.diff-stat-item {
  padding: 12px;
  background: rgba(139, 90, 43, 0.1);
  border-radius: 8px;
}

.diff-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.diff-tag {
  padding: 3px 10px;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 600;
}

.diff-count {
  font-size: 13px;
  color: #d4a574;
  font-weight: 500;
}

.diff-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8b7355;
}

.diff-meta strong {
  color: #d4c4a8;
}

.records-section {
  background: linear-gradient(145deg, #2c241b 0%, #1a1510 100%);
  border: 1px solid rgba(139, 90, 43, 0.25);
  border-radius: 12px;
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  color: #d4c4a8;
  margin: 0;
}

.filter-group {
  display: flex;
  gap: 6px;
}

.filter-btn {
  padding: 5px 12px;
  background: rgba(139, 90, 43, 0.15);
  border: 1px solid rgba(139, 90, 43, 0.3);
  color: #a89078;
  font-size: 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.filter-btn:hover {
  color: #d4a574;
}

.filter-btn.active {
  background: #8b5a2b;
  border-color: #8b5a2b;
  color: #f5deb3;
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

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(139, 90, 43, 0.08);
  border: 1px solid rgba(139, 90, 43, 0.15);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.record-card:hover {
  background: rgba(139, 90, 43, 0.15);
  transform: translateX(4px);
}

.record-left {
  flex-shrink: 0;
}

.record-score {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  font-family: 'Courier New', monospace;
}

.record-main {
  flex: 1;
  min-width: 0;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.record-title {
  font-size: 15px;
  color: #d4c4a8;
  margin: 0;
  font-weight: 600;
}

.record-tag {
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 10px;
  font-weight: 500;
}

.category-tag {
  background: rgba(24, 144, 255, 0.2);
  color: #69b1ff;
}

.record-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.record-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8b7355;
}

.record-stat strong {
  color: #d4a574;
  font-size: 14px;
  font-family: 'Courier New', monospace;
}

.stat-icon {
  font-size: 13px;
}

@media (max-width: 968px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  .record-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
