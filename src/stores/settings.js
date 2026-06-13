import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const typewriterEffect = ref(true)
  const soundEnabled = ref(true)
  const keySoundVolume = ref(0.6)
  const pageSoundVolume = ref(0.5)
  const showVirtualKeyboard = ref(true)
  const focusMode = ref(false)
  const fontSize = ref(18)
  const lineHeight = ref(2)
  const paperStyle = ref('vintage')
  const autoSaveInterval = ref(30)
  const showStats = ref(true)

  const defaultSettings = {
    typewriterEffect: true,
    soundEnabled: true,
    keySoundVolume: 0.6,
    pageSoundVolume: 0.5,
    showVirtualKeyboard: true,
    focusMode: false,
    fontSize: 18,
    lineHeight: 2,
    paperStyle: 'vintage',
    autoSaveInterval: 30,
    showStats: true
  }

  async function loadSettings() {
    if (!window.electronAPI) return
    try {
      const result = await window.electronAPI.loadSettings()
      if (result.success && result.data) {
        const data = result.data
        typewriterEffect.value = data.typewriterEffect ?? defaultSettings.typewriterEffect
        soundEnabled.value = data.soundEnabled ?? defaultSettings.soundEnabled
        keySoundVolume.value = data.keySoundVolume ?? defaultSettings.keySoundVolume
        pageSoundVolume.value = data.pageSoundVolume ?? defaultSettings.pageSoundVolume
        showVirtualKeyboard.value = data.showVirtualKeyboard ?? defaultSettings.showVirtualKeyboard
        focusMode.value = false
        fontSize.value = data.fontSize ?? defaultSettings.fontSize
        lineHeight.value = data.lineHeight ?? defaultSettings.lineHeight
        paperStyle.value = data.paperStyle ?? defaultSettings.paperStyle
        autoSaveInterval.value = data.autoSaveInterval ?? defaultSettings.autoSaveInterval
        showStats.value = data.showStats ?? defaultSettings.showStats
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  async function saveSettings() {
    if (!window.electronAPI) return
    try {
      await window.electronAPI.saveSettings({
        typewriterEffect: typewriterEffect.value,
        soundEnabled: soundEnabled.value,
        keySoundVolume: keySoundVolume.value,
        pageSoundVolume: pageSoundVolume.value,
        showVirtualKeyboard: showVirtualKeyboard.value,
        focusMode: false,
        fontSize: fontSize.value,
        lineHeight: lineHeight.value,
        paperStyle: paperStyle.value,
        autoSaveInterval: autoSaveInterval.value,
        showStats: showStats.value
      })
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  }

  function toggleFocusMode() {
    focusMode.value = !focusMode.value
    saveSettings()
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    saveSettings()
  }

  function toggleTypewriterEffect() {
    typewriterEffect.value = !typewriterEffect.value
    saveSettings()
  }

  function toggleVirtualKeyboard() {
    showVirtualKeyboard.value = !showVirtualKeyboard.value
    saveSettings()
  }

  return {
    typewriterEffect,
    soundEnabled,
    keySoundVolume,
    pageSoundVolume,
    showVirtualKeyboard,
    focusMode,
    fontSize,
    lineHeight,
    paperStyle,
    autoSaveInterval,
    showStats,
    loadSettings,
    saveSettings,
    toggleFocusMode,
    toggleSound,
    toggleTypewriterEffect,
    toggleVirtualKeyboard
  }
})
