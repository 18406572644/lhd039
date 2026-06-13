import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSoundStore = defineStore('sound', () => {
  const audioContext = ref(null)
  const isInitialized = ref(false)

  function initAudio() {
    if (isInitialized.value) return
    try {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
      isInitialized.value = true
    } catch (error) {
      console.error('音频初始化失败:', error)
    }
  }

  function playKeySound(volume = 0.6, isSpace = false) {
    if (!isInitialized.value) initAudio()
    if (!audioContext.value) return

    const ctx = audioContext.value
    const now = ctx.currentTime
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    if (isSpace) {
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(150, now)
      oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.08)
    } else {
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(800 + Math.random() * 200, now)
      oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.03)
    }

    gainNode.gain.setValueAtTime(volume * 0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    oscillator.start(now)
    oscillator.stop(now + 0.1)

    const noiseGain = ctx.createGain()
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.1
    }
    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = noiseBuffer
    noiseSource.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noiseGain.gain.setValueAtTime(volume * 0.15, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    noiseSource.start(now)
  }

  function playEnterSound(volume = 0.6) {
    if (!isInitialized.value) initAudio()
    if (!audioContext.value) return

    const ctx = audioContext.value
    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.type = 'triangle'
    osc1.frequency.setValueAtTime(300, now)
    osc1.frequency.exponentialRampToValueAtTime(150, now + 0.15)
    gain1.gain.setValueAtTime(volume * 0.4, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    osc1.start(now)
    osc1.stop(now + 0.2)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.type = 'sawtooth'
    osc2.frequency.setValueAtTime(80, now + 0.05)
    gain2.gain.setValueAtTime(volume * 0.2, now + 0.05)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc2.start(now + 0.05)
    osc2.stop(now + 0.3)
  }

  function playBackspaceSound(volume = 0.6) {
    if (!isInitialized.value) initAudio()
    if (!audioContext.value) return

    const ctx = audioContext.value
    const now = ctx.currentTime

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(400, now)
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1)
    gainNode.gain.setValueAtTime(volume * 0.3, now)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    oscillator.start(now)
    oscillator.stop(now + 0.15)
  }

  function playPageTurnSound(volume = 0.5) {
    if (!isInitialized.value) initAudio()
    if (!audioContext.value) return

    const ctx = audioContext.value
    const now = ctx.currentTime

    const bufferSize = ctx.sampleRate * 0.4
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize
      const envelope = Math.sin(t * Math.PI)
      data[i] = (Math.random() * 2 - 1) * envelope * (1 - t * 0.8)
    }

    const source = ctx.createBufferSource()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    source.buffer = buffer
    filter.type = 'bandpass'
    filter.frequency.value = 2000
    filter.Q.value = 0.5

    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    gainNode.gain.setValueAtTime(volume * 0.5, now)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    source.start(now)
  }

  function playBellSound(volume = 0.5) {
    if (!isInitialized.value) initAudio()
    if (!audioContext.value) return

    const ctx = audioContext.value
    const now = ctx.currentTime

    const frequencies = [880, 1320, 1760]
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(volume * 0.2, now + index * 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5)
      osc.start(now + index * 0.02)
      osc.stop(now + 1.5)
    })
  }

  return {
    isInitialized,
    initAudio,
    playKeySound,
    playEnterSound,
    playBackspaceSound,
    playPageTurnSound,
    playBellSound
  }
})
