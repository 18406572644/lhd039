<template>
  <div class="virtual-keyboard" :class="{ 'focus-hidden': settingsStore.focusMode }">
    <div class="keyboard-body">
      <div class="keyboard-top">
        <div class="typewriter-brand">VINTAGE</div>
        <div class="typewriter-model">Model 1920</div>
      </div>
      
      <div class="keyboard-keys">
        <div class="key-row">
          <div 
            v-for="key in row1" 
            :key="key.value"
            class="key"
            :class="{ 
              'key-wide': key.wide, 
              'key-active': activeKey === key.value,
              'key-number': key.isNumber
            }"
            @mousedown="pressKey(key)"
            @mouseup="releaseKey"
            @mouseleave="releaseKey"
          >
            <span class="key-label">{{ key.label }}</span>
          </div>
        </div>
        
        <div class="key-row">
          <div 
            v-for="key in row2" 
            :key="key.value"
            class="key"
            :class="{ 
              'key-wide': key.wide, 
              'key-active': activeKey === key.value 
            }"
            @mousedown="pressKey(key)"
            @mouseup="releaseKey"
            @mouseleave="releaseKey"
          >
            <span class="key-label">{{ key.label }}</span>
          </div>
        </div>
        
        <div class="key-row">
          <div 
            v-for="key in row3" 
            :key="key.value"
            class="key"
            :class="{ 
              'key-wide': key.wide, 
              'key-wider': key.wider,
              'key-active': activeKey === key.value 
            }"
            @mousedown="pressKey(key)"
            @mouseup="releaseKey"
            @mouseleave="releaseKey"
          >
            <span class="key-label">{{ key.label }}</span>
          </div>
        </div>
        
        <div class="key-row">
          <div 
            v-for="key in row4" 
            :key="key.value"
            class="key"
            :class="{ 
              'key-wide': key.wide, 
              'key-wider': key.wider,
              'key-active': activeKey === key.value 
            }"
            @mousedown="pressKey(key)"
            @mouseup="releaseKey"
            @mouseleave="releaseKey"
          >
            <span class="key-label">{{ key.label }}</span>
          </div>
        </div>
        
        <div class="key-row space-row">
          <div 
            class="key key-space"
            :class="{ 'key-active': activeKey === ' ' }"
            @mousedown="pressKey({ value: ' ', label: 'Space' })"
            @mouseup="releaseKey"
            @mouseleave="releaseKey"
          >
            <span class="key-label">SPACE</span>
          </div>
        </div>
      </div>
      
      <div class="keyboard-bottom">
        <div class="typewriter-lever left"></div>
        <div class="typewriter-lever right"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useSoundStore } from '../stores/sound'

const settingsStore = useSettingsStore()
const soundStore = useSoundStore()

const activeKey = ref(null)

const row1 = [
  { label: '`', value: '`', isNumber: true },
  { label: '1', value: '1', isNumber: true },
  { label: '2', value: '2', isNumber: true },
  { label: '3', value: '3', isNumber: true },
  { label: '4', value: '4', isNumber: true },
  { label: '5', value: '5', isNumber: true },
  { label: '6', value: '6', isNumber: true },
  { label: '7', value: '7', isNumber: true },
  { label: '8', value: '8', isNumber: true },
  { label: '9', value: '9', isNumber: true },
  { label: '0', value: '0', isNumber: true },
  { label: '-', value: '-' },
  { label: '=', value: '=' },
  { label: '⌫', value: 'Backspace', wide: true }
]

const row2 = [
  { label: 'Tab', value: 'Tab', wide: true },
  { label: 'Q', value: 'q' },
  { label: 'W', value: 'w' },
  { label: 'E', value: 'e' },
  { label: 'R', value: 'r' },
  { label: 'T', value: 't' },
  { label: 'Y', value: 'y' },
  { label: 'U', value: 'u' },
  { label: 'I', value: 'i' },
  { label: 'O', value: 'o' },
  { label: 'P', value: 'p' },
  { label: '[', value: '[' },
  { label: ']', value: ']' },
  { label: '\\', value: '\\' }
]

const row3 = [
  { label: 'Caps', value: 'CapsLock', wide: true },
  { label: 'A', value: 'a' },
  { label: 'S', value: 's' },
  { label: 'D', value: 'd' },
  { label: 'F', value: 'f' },
  { label: 'G', value: 'g' },
  { label: 'H', value: 'h' },
  { label: 'J', value: 'j' },
  { label: 'K', value: 'k' },
  { label: 'L', value: 'l' },
  { label: ';', value: ';' },
  { label: "'", value: "'" },
  { label: '↵', value: 'Enter', wider: true }
]

const row4 = [
  { label: 'Shift', value: 'Shift', wider: true },
  { label: 'Z', value: 'z' },
  { label: 'X', value: 'x' },
  { label: 'C', value: 'c' },
  { label: 'V', value: 'v' },
  { label: 'B', value: 'b' },
  { label: 'N', value: 'n' },
  { label: 'M', value: 'm' },
  { label: ',', value: ',' },
  { label: '.', value: '.' },
  { label: '/', value: '/' },
  { label: '↑', value: 'ArrowUp', wide: true },
  { label: 'Shift', value: 'Shift', wider: true }
]

function pressKey(key) {
  activeKey.value = key.value
  
  if (!settingsStore.soundEnabled) return
  soundStore.initAudio()
  
  if (key.value === 'Enter') {
    soundStore.playEnterSound(settingsStore.keySoundVolume)
  } else if (key.value === 'Backspace' || key.value === 'Delete') {
    soundStore.playBackspaceSound(settingsStore.keySoundVolume)
  } else if (key.value === ' ') {
    soundStore.playKeySound(settingsStore.keySoundVolume, true)
  } else if (key.value.length === 1) {
    soundStore.playKeySound(settingsStore.keySoundVolume)
  }
}

function releaseKey() {
  activeKey.value = null
}

function handlePhysicalKeyDown(e) {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
  activeKey.value = key
}

function handlePhysicalKeyUp() {
  activeKey.value = null
}

onMounted(() => {
  window.addEventListener('keydown', handlePhysicalKeyDown)
  window.addEventListener('keyup', handlePhysicalKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handlePhysicalKeyDown)
  window.removeEventListener('keyup', handlePhysicalKeyUp)
})
</script>

<style scoped>
.virtual-keyboard {
  padding: 10px 20px 20px;
  background: linear-gradient(180deg, rgba(26, 21, 16, 0.98) 0%, rgba(13, 10, 8, 0.98) 100%);
  border-top: 1px solid rgba(139, 90, 43, 0.3);
  transition: all 0.3s ease;
}

.focus-hidden {
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 99;
}

.focus-hidden:hover {
  opacity: 1;
}

.keyboard-body {
  background: linear-gradient(145deg, #3d2b1f 0%, #2c241b 50%, #1a1510 100%);
  border-radius: 12px 12px 8px 8px;
  padding: 15px 20px 20px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  position: relative;
}

.keyboard-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px 15px;
  border-bottom: 1px solid rgba(139, 90, 43, 0.3);
  margin-bottom: 15px;
}

.typewriter-brand {
  font-size: 14px;
  font-weight: bold;
  color: #d4a574;
  letter-spacing: 3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.typewriter-model {
  font-size: 11px;
  color: #8b7355;
  font-style: italic;
  letter-spacing: 1px;
}

.keyboard-keys {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.key-row {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.key {
  position: relative;
  min-width: 42px;
  height: 42px;
  background: linear-gradient(145deg, #f5f0e6 0%, #d4c4a8 50%, #b8a88a 100%);
  border-radius: 6px 6px 8px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 
    0 4px 0 #8b7355,
    0 6px 10px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.05s ease;
  user-select: none;
}

.key::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 4px 4px 0 0;
  pointer-events: none;
}

.key:hover {
  background: linear-gradient(145deg, #fff8e7 0%, #e8dcc0 50%, #ccbca0 100%);
}

.key-active {
  transform: translateY(3px);
  box-shadow: 
    0 1px 0 #8b7355,
    0 2px 5px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.key-number {
  background: linear-gradient(145deg, #e8dcc0 0%, #d4c4a8 50%, #b8a88a 100%);
}

.key-number::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 60%;
  border: 1px solid rgba(139, 115, 85, 0.3);
  border-radius: 3px;
  pointer-events: none;
}

.key-label {
  font-size: 13px;
  font-weight: bold;
  color: #3d2b1f;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
}

.key-wide {
  min-width: 70px;
}

.key-wider {
  min-width: 90px;
}

.space-row {
  margin-top: 4px;
}

.key-space {
  flex: 1;
  max-width: 400px;
  height: 46px;
  background: linear-gradient(145deg, #f5f0e6 0%, #d4c4a8 50%, #b8a88a 100%);
}

.key-space .key-label {
  font-size: 11px;
  letter-spacing: 3px;
}

.keyboard-bottom {
  display: flex;
  justify-content: space-between;
  padding: 15px 30px 0;
  margin-top: 10px;
  border-top: 1px solid rgba(139, 90, 43, 0.2);
}

.typewriter-lever {
  width: 60px;
  height: 8px;
  background: linear-gradient(90deg, #8b7355 0%, #d4a574 50%, #8b7355 100%);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.typewriter-lever::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(145deg, #d4a574, #8b7355);
  border-radius: 50%;
  margin-top: -2px;
}

.typewriter-lever.left::after {
  margin-left: -6px;
}

.typewriter-lever.right::after {
  margin-left: 54px;
}
</style>
