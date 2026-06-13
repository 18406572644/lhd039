<template>
  <div class="editor-wrapper" ref="editorWrapper">
    <div 
      class="paper-container"
      :class="{ 'shake': isShaking, 'typewriter-effect': settingsStore.typewriterEffect }"
      :style="paperStyle"
      @click="focusEditor"
    >
      <div class="paper-shadow"></div>
      <div class="paper" ref="paperRef">
        <div class="paper-texture"></div>
        <div class="paper-lines" :style="linesStyle"></div>
        <div class="paper-holes">
          <div class="hole" v-for="i in 20" :key="i"></div>
        </div>
        <div class="title-input-wrapper">
          <input
            ref="titleInputRef"
            v-model="localTitle"
            class="title-input"
            :style="titleStyle"
            placeholder="请输入文章标题..."
            @input="handleTitleChange"
            @keydown="handleTitleKeydown"
          />
        </div>
        <div class="content-wrapper" ref="contentWrapper">
          <textarea
            ref="editorRef"
            v-model="localContent"
            class="editor-textarea"
            :style="editorStyle"
            placeholder="开始写作，让思绪在纸张上流淌..."
            @input="handleInput"
            @keydown="handleKeydown"
            @paste="handlePaste"
          />
          <div 
            v-if="settingsStore.typewriterEffect && displayContent !== localContent"
            class="typing-cursor"
            :style="cursorStyle"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useDocumentStore } from '../stores/document'
import { useSoundStore } from '../stores/sound'

const settingsStore = useSettingsStore()
const documentStore = useDocumentStore()
const soundStore = useSoundStore()

const editorWrapper = ref(null)
const paperRef = ref(null)
const editorRef = ref(null)
const titleInputRef = ref(null)
const contentWrapper = ref(null)

const localContent = ref('')
const localTitle = ref('')
const displayContent = ref('')
const isShaking = ref(false)
const isTypingEffect = ref(false)
const charIndex = ref(0)
const bellTriggered = ref(new Set())

const paperStyle = computed(() => ({
  '--font-size': `${settingsStore.fontSize}px`,
  '--line-height': `${settingsStore.lineHeight}`,
  fontSize: `${settingsStore.fontSize}px`
}))

const linesStyle = computed(() => ({
  backgroundSize: `100% ${settingsStore.fontSize * settingsStore.lineHeight}px`
}))

const editorStyle = computed(() => ({
  fontSize: `${settingsStore.fontSize}px`,
  lineHeight: `${settingsStore.lineHeight}`,
  fontFamily: getFontFamily()
}))

const titleStyle = computed(() => ({
  fontSize: `${settingsStore.fontSize * 1.5}px`,
  lineHeight: `${settingsStore.lineHeight}`,
  fontFamily: getFontFamily()
}))

const cursorStyle = computed(() => ({
  height: `${settingsStore.fontSize * 1.2}px`
}))

function getFontFamily() {
  return "'Typewriter', 'Courier New', Courier, monospace"
}

function focusEditor() {
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.focus()
    }
  })
}

function handleTitleChange() {
  documentStore.updateTitle(localTitle.value)
  triggerSave()
}

function handleTitleKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    focusEditor()
  }
}

function handleInput(e) {
  documentStore.updateContent(localContent.value)
  triggerSave()
  displayContent.value = localContent.value
}

function startTypingEffect() {
  if (isTypingEffect.value) return
  
  isTypingEffect.value = true
  const originalContent = localContent.value
  localContent.value = ''
  displayContent.value = ''
  charIndex.value = 0
  
  const typeNextChar = () => {
    if (charIndex.value < originalContent.length) {
      localContent.value += originalContent[charIndex.value]
      displayContent.value = localContent.value
      charIndex.value++
      setTimeout(typeNextChar, 15)
    } else {
      isTypingEffect.value = false
    }
  }
  
  typeNextChar()
}

function handleKeydown(e) {
  if (!settingsStore.soundEnabled) return
  
  soundStore.initAudio()
  
  if (e.key === 'Enter') {
    soundStore.playEnterSound(settingsStore.keySoundVolume)
    triggerPaperShake()
    checkBell(e)
  } else if (e.key === 'Backspace' || e.key === 'Delete') {
    soundStore.playBackspaceSound(settingsStore.keySoundVolume)
  } else if (e.key === ' ') {
    soundStore.playKeySound(settingsStore.keySoundVolume, true)
  } else if (e.key.length === 1) {
    soundStore.playKeySound(settingsStore.keySoundVolume)
    triggerPaperShake()
    checkBell(e)
  }
}

function handlePaste(e) {
  if (settingsStore.soundEnabled) {
    soundStore.playPageTurnSound(settingsStore.pageSoundVolume)
  }
  if (settingsStore.typewriterEffect) {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const startPos = editorRef.value.selectionStart
    const endPos = editorRef.value.selectionEnd
    const newContent = localContent.value.substring(0, startPos) + pastedText + localContent.value.substring(endPos)
    localContent.value = newContent
    nextTick(() => {
      startTypingEffect()
    })
  }
}

function triggerPaperShake() {
  if (!settingsStore.typewriterEffect) return
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 100)
}

function checkBell(e) {
  if (!settingsStore.typewriterEffect) return
  
  const textarea = editorRef.value
  if (!textarea) return
  
  const lines = textarea.value.substring(0, textarea.selectionStart).split('\n')
  const currentLine = lines[lines.length - 1]
  const lineLength = currentLine.length
  
  if (lineLength >= 70 && !bellTriggered.value.has(lines.length - 1)) {
    bellTriggered.value.add(lines.length - 1)
    soundStore.playBellSound(settingsStore.keySoundVolume * 0.5)
  }
}

let saveTimeout = null
function triggerSave() {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    documentStore.saveToStorage()
  }, 1000)
}

watch(() => documentStore.currentDocument, (doc) => {
  if (doc) {
    localContent.value = doc.content
    localTitle.value = doc.title
    displayContent.value = doc.content
    bellTriggered.value.clear()
  }
}, { immediate: true })

onMounted(() => {
  focusEditor()
})
</script>

<style scoped>
.editor-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  perspective: 1000px;
}

.paper-container {
  position: relative;
  width: 100%;
  max-width: 750px;
  min-height: 600px;
  transform-style: preserve-3d;
  transition: transform 0.1s ease;
}

.paper-container.shake {
  animation: paperShake 0.1s ease-in-out;
}

.paper-shadow {
  position: absolute;
  top: 10px;
  left: 10px;
  right: -10px;
  bottom: -10px;
  background: rgba(0, 0, 0, 0.4);
  filter: blur(10px);
  border-radius: 4px;
  z-index: 0;
}

.paper {
  position: relative;
  background: #f5f0e6;
  border-radius: 2px;
  padding: 60px 50px 60px 80px;
  min-height: 600px;
  box-shadow: 
    0 1px 1px rgba(0,0,0,0.12),
    0 2px 2px rgba(0,0,0,0.12),
    0 4px 4px rgba(0,0,0,0.12),
    0 8px 8px rgba(0,0,0,0.12),
    inset 0 0 100px rgba(139, 90, 43, 0.1);
  z-index: 1;
  overflow: hidden;
}

.paper-texture {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
}

.paper-lines {
  position: absolute;
  top: 110px;
  left: 60px;
  right: 40px;
  bottom: 40px;
  background-image: linear-gradient(
    transparent 0%,
    transparent calc(100% - 1px),
    rgba(139, 90, 43, 0.3) calc(100% - 1px),
    rgba(139, 90, 43, 0.3) 100%
  );
  background-size: 100% 36px;
  pointer-events: none;
  z-index: 0;
}

.paper-holes {
  position: absolute;
  left: 30px;
  top: 50px;
  bottom: 40px;
  width: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
  z-index: 2;
}

.hole {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1a1510;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.1);
}

.title-input-wrapper {
  position: relative;
  z-index: 3;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(139, 90, 43, 0.3);
}

.title-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  color: #3d2b1f;
  font-weight: bold;
  text-align: center;
  resize: none;
  letter-spacing: 2px;
}

.title-input::placeholder {
  color: rgba(61, 43, 31, 0.4);
}

.content-wrapper {
  position: relative;
  z-index: 3;
  min-height: 400px;
}

.editor-textarea {
  width: 100%;
  min-height: 400px;
  border: none;
  background: transparent;
  outline: none;
  color: #3d2b1f;
  resize: none;
  letter-spacing: 1px;
  overflow-y: visible;
  caret-color: #8b5a2b;
}

.editor-textarea::placeholder {
  color: rgba(61, 43, 31, 0.4);
  font-style: italic;
}

.editor-textarea::-webkit-scrollbar {
  width: 6px;
}

.editor-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.editor-textarea::-webkit-scrollbar-thumb {
  background: rgba(139, 90, 43, 0.3);
  border-radius: 3px;
}

.typing-cursor {
  position: absolute;
  width: 3px;
  background: #8b5a2b;
  animation: cursorBlink 1s infinite;
  pointer-events: none;
}

@keyframes paperShake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-1px) rotate(-0.1deg); }
  75% { transform: translateX(1px) rotate(0.1deg); }
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.typewriter-effect .paper {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
