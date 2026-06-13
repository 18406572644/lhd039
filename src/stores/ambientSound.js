import { defineStore } from 'pinia'
import { ref, reactive, markRaw } from 'vue'

const BUILTIN_SOUNDS = [
  { id: 'cafe', name: '咖啡馆', icon: '☕', description: '人群低语 + 杯碟碰撞', category: 'indoor' },
  { id: 'rain_light', name: '小雨', icon: '🌧️', description: '绵绵细雨', category: 'nature' },
  { id: 'rain_medium', name: '中雨', icon: '🌧️', description: '淅沥雨声', category: 'nature' },
  { id: 'rain_heavy', name: '暴雨', icon: '⛈️', description: '倾盆大雨', category: 'nature' },
  { id: 'forest', name: '森林', icon: '🌲', description: '鸟鸣 + 树叶沙沙', category: 'nature' },
  { id: 'ocean', name: '海浪', icon: '🌊', description: '海浪拍打 + 海鸥', category: 'nature' },
  { id: 'fireplace', name: '壁炉', icon: '🔥', description: '柴火噼啪声', category: 'indoor' },
  { id: 'library', name: '图书馆', icon: '📚', description: '翻书声 + 安静低语', category: 'indoor' },
  { id: 'train', name: '老火车', icon: '🚂', description: '车轮轨道声', category: 'transport' },
  { id: 'study', name: '深夜书房', icon: '🕯️', description: '钟摆 + 微弱风声', category: 'indoor' }
]

const DEFAULT_PRESETS = [
  { id: 'cafe_rain', name: '咖啡馆的雨天', sounds: { cafe: 0.6, rain_light: 0.4 } },
  { id: 'forest_morning', name: '森林清晨', sounds: { forest: 0.7, rain_light: 0.2 } },
  { id: 'ocean_waves', name: '海边宁静', sounds: { ocean: 0.8 } },
  { id: 'cozy_night', name: '温馨夜晚', sounds: { fireplace: 0.5, study: 0.3 } }
]

export const useAmbientSoundStore = defineStore('ambientSound', () => {
  const audioContext = ref(null)
  const masterGain = ref(null)
  const soundNodes = {}
  const soundVolumes = reactive({})
  const masterVolume = ref(0.7)
  const isPlaying = ref(false)
  const presets = ref([...DEFAULT_PRESETS])
  const customSounds = ref([])
  const activePreset = ref(null)
  const timeouts = reactive({})

  function getAllSounds() {
    return [...BUILTIN_SOUNDS, ...customSounds.value]
  }

  function initAudioContext() {
    if (audioContext.value) return
    try {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
      masterGain.value = audioContext.value.createGain()
      masterGain.value.gain.value = masterVolume.value
      masterGain.value.connect(audioContext.value.destination)
    } catch (error) {
      console.error('音频上下文初始化失败:', error)
    }
  }

  function resumeAudioContext() {
    if (audioContext.value && audioContext.value.state === 'suspended') {
      try {
        audioContext.value.resume()
      } catch (e) {
        console.warn('恢复音频上下文失败:', e)
      }
    }
  }

  function setMasterVolume(volume) {
    masterVolume.value = Math.max(0, Math.min(1, volume))
    if (masterGain.value) {
      masterGain.value.gain.value = masterVolume.value
    }
  }

  function createNoiseBuffer(type = 'white', duration = 2) {
    if (!audioContext.value) return null
    const sampleRate = audioContext.value.sampleRate
    const bufferSize = sampleRate * duration
    const buffer = audioContext.value.createBuffer(2, bufferSize, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      if (type === 'white') {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1
        }
      } else if (type === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.96900 * b2 + white * 0.1538520
          b3 = 0.86650 * b3 + white * 0.3104856
          b4 = 0.55000 * b4 + white * 0.5329522
          b5 = -0.7616 * b5 - white * 0.0168980
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
          b6 = white * 0.115926
        }
      } else if (type === 'brown') {
        let lastOut = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          data[i] = (lastOut + 0.02 * white) / 1.02
          lastOut = data[i]
          data[i] *= 3.5
        }
      }
    }
    return buffer
  }

  function createLoopSource(buffer) {
    if (!audioContext.value) return null
    const source = audioContext.value.createBufferSource()
    source.buffer = buffer
    source.loop = true
    return source
  }

  function safeClearTimeout(id) {
    if (id) {
      clearTimeout(id)
    }
  }

  function clearSoundTimeouts(soundId) {
    if (timeouts[soundId]) {
      timeouts[soundId].forEach(id => safeClearTimeout(id))
      delete timeouts[soundId]
    }
  }

  function addTimeout(soundId, id) {
    if (!timeouts[soundId]) {
      timeouts[soundId] = []
    }
    timeouts[soundId].push(id)
  }

  function createCafeSound(soundId) {
    if (!audioContext.value || !masterGain.value) return null
    const group = audioContext.value.createGain()
    group.gain.value = 0
    group.connect(masterGain.value)

    const crowdBuffer = createNoiseBuffer('pink', 4)
    const crowdSource = createLoopSource(crowdBuffer)
    const crowdFilter = audioContext.value.createBiquadFilter()
    crowdFilter.type = 'bandpass'
    crowdFilter.frequency.value = 800
    crowdFilter.Q.value = 0.7
    const crowdGain = audioContext.value.createGain()
    crowdGain.gain.value = 0.3
    crowdSource.connect(crowdFilter)
    crowdFilter.connect(crowdGain)
    crowdGain.connect(group)
    crowdSource.start()

    function playClink() {
      if (!audioContext.value || group.gain.value === 0) return
      try {
        const osc = audioContext.value.createOscillator()
        const gain = audioContext.value.createGain()
        osc.type = 'sine'
        osc.frequency.value = 2000 + Math.random() * 1000
        gain.gain.setValueAtTime(0, audioContext.value.currentTime)
        gain.gain.linearRampToValueAtTime(0.08, audioContext.value.currentTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.3)
        osc.connect(gain)
        gain.connect(group)
        osc.start()
        osc.stop(audioContext.value.currentTime + 0.3)
      } catch (e) {
        console.warn('播放杯碟声失败:', e)
      }
    }

    function scheduleClinks() {
      const delay = 2000 + Math.random() * 4000
      const id = setTimeout(() => {
        playClink()
        scheduleClinks()
      }, delay)
      addTimeout(soundId, id)
    }

    scheduleClinks()

    return {
      stop: () => {
        try {
          clearSoundTimeouts(soundId)
          crowdSource.stop()
        } catch (e) {
          console.warn('停止咖啡馆音效失败:', e)
        }
      },
      gainNode: group
    }
  }

  function createRainSound(soundId, intensity = 'medium') {
    if (!audioContext.value || !masterGain.value) return null
    const group = audioContext.value.createGain()
    group.gain.value = 0
    group.connect(masterGain.value)

    const intensityMap = {
      light: { noiseGain: 0.15, dropRate: 0.5, filterFreq: 4000 },
      medium: { noiseGain: 0.3, dropRate: 1, filterFreq: 3000 },
      heavy: { noiseGain: 0.5, dropRate: 2, filterFreq: 2000 }
    }
    const config = intensityMap[intensity] || intensityMap.medium

    const rainBuffer = createNoiseBuffer('white', 3)
    const rainSource = createLoopSource(rainBuffer)
    const rainFilter = audioContext.value.createBiquadFilter()
    rainFilter.type = 'lowpass'
    rainFilter.frequency.value = config.filterFreq
    const rainGain = audioContext.value.createGain()
    rainGain.gain.value = config.noiseGain
    rainSource.connect(rainFilter)
    rainFilter.connect(rainGain)
    rainGain.connect(group)
    rainSource.start()

    function playDrop() {
      if (!audioContext.value || group.gain.value === 0) return
      try {
        const osc = audioContext.value.createOscillator()
        const gain = audioContext.value.createGain()
        osc.type = 'sine'
        osc.frequency.value = 800 + Math.random() * 400
        gain.gain.setValueAtTime(0, audioContext.value.currentTime)
        gain.gain.linearRampToValueAtTime(0.02, audioContext.value.currentTime + 0.005)
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.1)
        osc.connect(gain)
        gain.connect(group)
        osc.start()
        osc.stop(audioContext.value.currentTime + 0.1)
      } catch (e) {
        console.warn('播放雨滴声失败:', e)
      }
    }

    function scheduleDrops() {
      const delay = 100 / config.dropRate + Math.random() * 200
      const id = setTimeout(() => {
        playDrop()
        scheduleDrops()
      }, delay)
      addTimeout(soundId, id)
    }

    scheduleDrops()

    return {
      stop: () => {
        try {
          clearSoundTimeouts(soundId)
          rainSource.stop()
        } catch (e) {
          console.warn('停止雨声失败:', e)
        }
      },
      gainNode: group
    }
  }

  function createForestSound(soundId) {
    if (!audioContext.value || !masterGain.value) return null
    const group = audioContext.value.createGain()
    group.gain.value = 0
    group.connect(masterGain.value)

    const windBuffer = createNoiseBuffer('pink', 5)
    const windSource = createLoopSource(windBuffer)
    const windFilter = audioContext.value.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 600
    windFilter.Q.value = 0.5
    const windGain = audioContext.value.createGain()
    windGain.gain.value = 0.15
    windSource.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(group)
    windSource.start()

    const leavesBuffer = createNoiseBuffer('white', 2)
    const leavesSource = createLoopSource(leavesBuffer)
    const leavesFilter = audioContext.value.createBiquadFilter()
    leavesFilter.type = 'highpass'
    leavesFilter.frequency.value = 2000
    const leavesGain = audioContext.value.createGain()
    leavesGain.gain.value = 0.08
    leavesSource.connect(leavesFilter)
    leavesFilter.connect(leavesGain)
    leavesGain.connect(group)
    leavesSource.start()

    function playBird() {
      if (!audioContext.value || group.gain.value === 0) return
      try {
        const osc = audioContext.value.createOscillator()
        const gain = audioContext.value.createGain()
        osc.type = 'sine'
        const baseFreq = 1500 + Math.random() * 1000
        osc.frequency.setValueAtTime(baseFreq, audioContext.value.currentTime)
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, audioContext.value.currentTime + 0.1)
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.8, audioContext.value.currentTime + 0.2)
        gain.gain.setValueAtTime(0, audioContext.value.currentTime)
        gain.gain.linearRampToValueAtTime(0.06, audioContext.value.currentTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.4)
        osc.connect(gain)
        gain.connect(group)
        osc.start()
        osc.stop(audioContext.value.currentTime + 0.4)
      } catch (e) {
        console.warn('播放鸟鸣失败:', e)
      }
    }

    function scheduleBirds() {
      const delay = 3000 + Math.random() * 7000
      const id = setTimeout(() => {
        playBird()
        if (Math.random() > 0.5) {
          const id2 = setTimeout(playBird, 200 + Math.random() * 300)
          addTimeout(soundId, id2)
        }
        scheduleBirds()
      }, delay)
      addTimeout(soundId, id)
    }

    scheduleBirds()

    return {
      stop: () => {
        try {
          clearSoundTimeouts(soundId)
          windSource.stop()
          leavesSource.stop()
        } catch (e) {
          console.warn('停止森林音效失败:', e)
        }
      },
      gainNode: group
    }
  }

  function createOceanSound(soundId) {
    if (!audioContext.value || !masterGain.value) return null
    const group = audioContext.value.createGain()
    group.gain.value = 0
    group.connect(masterGain.value)

    const waveBuffer = createNoiseBuffer('brown', 8)
    const waveSource = createLoopSource(waveBuffer)
    const waveFilter = audioContext.value.createBiquadFilter()
    waveFilter.type = 'lowpass'
    waveFilter.frequency.value = 800
    const waveGain = audioContext.value.createGain()
    waveGain.gain.value = 0.25
    waveSource.connect(waveFilter)
    waveFilter.connect(waveGain)
    waveGain.connect(group)
    waveSource.start()

    function modulateWave() {
      if (!audioContext.value) return
      try {
        const now = audioContext.value.currentTime
        const cycleDuration = 6 + Math.random() * 2
        waveGain.gain.setValueAtTime(0.15, now)
        waveGain.gain.linearRampToValueAtTime(0.35, now + cycleDuration * 0.3)
        waveGain.gain.linearRampToValueAtTime(0.15, now + cycleDuration * 0.7)
        waveGain.gain.linearRampToValueAtTime(0.15, now + cycleDuration)
        const id = setTimeout(modulateWave, cycleDuration * 1000)
        addTimeout(soundId, id)
      } catch (e) {
        console.warn('调制海浪音量失败:', e)
      }
    }
    modulateWave()

    function playSeagull() {
      if (!audioContext.value || group.gain.value === 0) return
      try {
        const osc = audioContext.value.createOscillator()
        const gain = audioContext.value.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(1200, audioContext.value.currentTime)
        osc.frequency.linearRampToValueAtTime(800, audioContext.value.currentTime + 0.3)
        gain.gain.setValueAtTime(0, audioContext.value.currentTime)
        gain.gain.linearRampToValueAtTime(0.04, audioContext.value.currentTime + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.5)
        osc.connect(gain)
        gain.connect(group)
        osc.start()
        osc.stop(audioContext.value.currentTime + 0.5)
      } catch (e) {
        console.warn('播放海鸥声失败:', e)
      }
    }

    function scheduleSeagulls() {
      const delay = 8000 + Math.random() * 12000
      const id = setTimeout(() => {
        playSeagull()
        scheduleSeagulls()
      }, delay)
      addTimeout(soundId, id)
    }

    scheduleSeagulls()

    return {
      stop: () => {
        try {
          clearSoundTimeouts(soundId)
          waveSource.stop()
        } catch (e) {
          console.warn('停止海浪音效失败:', e)
        }
      },
      gainNode: group
    }
  }

  function createFireplaceSound(soundId) {
    if (!audioContext.value || !masterGain.value) return null
    const group = audioContext.value.createGain()
    group.gain.value = 0
    group.connect(masterGain.value)

    const fireBuffer = createNoiseBuffer('brown', 3)
    const fireSource = createLoopSource(fireBuffer)
    const fireFilter = audioContext.value.createBiquadFilter()
    fireFilter.type = 'lowpass'
    fireFilter.frequency.value = 1500
    const fireGain = audioContext.value.createGain()
    fireGain.gain.value = 0.2
    fireSource.connect(fireFilter)
    fireFilter.connect(fireGain)
    fireGain.connect(group)
    fireSource.start()

    function playCrackle() {
      if (!audioContext.value || group.gain.value === 0) return
      try {
        const bufferSize = audioContext.value.sampleRate * 0.1
        const buffer = audioContext.value.createBuffer(1, bufferSize, audioContext.value.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
        }
        const source = audioContext.value.createBufferSource()
        const gain = audioContext.value.createGain()
        const filter = audioContext.value.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.value = 3000
        source.buffer = buffer
        gain.gain.value = 0.1 + Math.random() * 0.1
        source.connect(filter)
        filter.connect(gain)
        gain.connect(group)
        source.start()
      } catch (e) {
        console.warn('播放噼啪声失败:', e)
      }
    }

    function scheduleCrackles() {
      const delay = 300 + Math.random() * 800
      const id = setTimeout(() => {
        playCrackle()
        scheduleCrackles()
      }, delay)
      addTimeout(soundId, id)
    }

    scheduleCrackles()

    return {
      stop: () => {
        try {
          clearSoundTimeouts(soundId)
          fireSource.stop()
        } catch (e) {
          console.warn('停止壁炉音效失败:', e)
        }
      },
      gainNode: group
    }
  }

  function createLibrarySound(soundId) {
    if (!audioContext.value || !masterGain.value) return null
    const group = audioContext.value.createGain()
    group.gain.value = 0
    group.connect(masterGain.value)

    const ambientBuffer = createNoiseBuffer('pink', 4)
    const ambientSource = createLoopSource(ambientBuffer)
    const ambientFilter = audioContext.value.createBiquadFilter()
    ambientFilter.type = 'lowpass'
    ambientFilter.frequency.value = 1200
    const ambientGain = audioContext.value.createGain()
    ambientGain.gain.value = 0.08
    ambientSource.connect(ambientFilter)
    ambientFilter.connect(ambientGain)
    ambientGain.connect(group)
    ambientSource.start()

    function playPageTurn() {
      if (!audioContext.value || group.gain.value === 0) return
      try {
        const bufferSize = audioContext.value.sampleRate * 0.3
        const buffer = audioContext.value.createBuffer(1, bufferSize, audioContext.value.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          const t = i / bufferSize
          const envelope = Math.sin(t * Math.PI)
          data[i] = (Math.random() * 2 - 1) * envelope * 0.3
        }
        const source = audioContext.value.createBufferSource()
        const gain = audioContext.value.createGain()
        const filter = audioContext.value.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = 3000
        filter.Q.value = 0.5
        source.buffer = buffer
        gain.gain.value = 0.1
        source.connect(filter)
        filter.connect(gain)
        gain.connect(group)
        source.start()
      } catch (e) {
        console.warn('播放翻书声失败:', e)
      }
    }

    function schedulePages() {
      const delay = 5000 + Math.random() * 10000
      const id = setTimeout(() => {
        playPageTurn()
        schedulePages()
      }, delay)
      addTimeout(soundId, id)
    }

    schedulePages()

    function playWhisper() {
      if (!audioContext.value || group.gain.value === 0) return
      try {
        const osc = audioContext.value.createOscillator()
        const gain = audioContext.value.createGain()
        osc.type = 'sine'
        const freq = 180 + Math.random() * 80
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0, audioContext.value.currentTime)
        gain.gain.linearRampToValueAtTime(0.015, audioContext.value.currentTime + 0.1)
        gain.gain.linearRampToValueAtTime(0.01, audioContext.value.currentTime + 0.5)
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.8)
        osc.connect(gain)
        gain.connect(group)
        osc.start()
        osc.stop(audioContext.value.currentTime + 0.8)
      } catch (e) {
        console.warn('播放低语声失败:', e)
      }
    }

    function scheduleWhispers() {
      const delay = 8000 + Math.random() * 15000
      const id = setTimeout(() => {
        playWhisper()
        scheduleWhispers()
      }, delay)
      addTimeout(soundId, id)
    }

    scheduleWhispers()

    return {
      stop: () => {
        try {
          clearSoundTimeouts(soundId)
          ambientSource.stop()
        } catch (e) {
          console.warn('停止图书馆音效失败:', e)
        }
      },
      gainNode: group
    }
  }

  function createTrainSound(soundId) {
    if (!audioContext.value || !masterGain.value) return null
    const group = audioContext.value.createGain()
    group.gain.value = 0
    group.connect(masterGain.value)

    const rumbleBuffer = createNoiseBuffer('brown', 2)
    const rumbleSource = createLoopSource(rumbleBuffer)
    const rumbleFilter = audioContext.value.createBiquadFilter()
    rumbleFilter.type = 'lowpass'
    rumbleFilter.frequency.value = 400
    const rumbleGain = audioContext.value.createGain()
    rumbleGain.gain.value = 0.3
    rumbleSource.connect(rumbleFilter)
    rumbleFilter.connect(rumbleGain)
    rumbleGain.connect(group)
    rumbleSource.start()

    function playClick() {
      if (!audioContext.value || group.gain.value === 0) return
      try {
        const osc = audioContext.value.createOscillator()
        const gain = audioContext.value.createGain()
        osc.type = 'square'
        osc.frequency.value = 120
        gain.gain.setValueAtTime(0, audioContext.value.currentTime)
        gain.gain.linearRampToValueAtTime(0.06, audioContext.value.currentTime + 0.005)
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.08)
        osc.connect(gain)
        gain.connect(group)
        osc.start()
        osc.stop(audioContext.value.currentTime + 0.08)
      } catch (e) {
        console.warn('播放咔哒声失败:', e)
      }
    }

    function playClickClack() {
      playClick()
      const id = setTimeout(playClick, 60)
      addTimeout(soundId, id)
    }

    function scheduleClicks() {
      const delay = 500 + Math.random() * 100
      const id = setTimeout(() => {
        playClickClack()
        scheduleClicks()
      }, delay)
      addTimeout(soundId, id)
    }

    scheduleClicks()

    function playWhistle() {
      if (!audioContext.value || group.gain.value === 0) return
      try {
        const osc = audioContext.value.createOscillator()
        const gain = audioContext.value.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, audioContext.value.currentTime)
        osc.frequency.linearRampToValueAtTime(800, audioContext.value.currentTime + 0.5)
        gain.gain.setValueAtTime(0, audioContext.value.currentTime)
        gain.gain.linearRampToValueAtTime(0.05, audioContext.value.currentTime + 0.1)
        gain.gain.linearRampToValueAtTime(0.03, audioContext.value.currentTime + 0.8)
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 1.2)
        osc.connect(gain)
        gain.connect(group)
        osc.start()
        osc.stop(audioContext.value.currentTime + 1.2)
      } catch (e) {
        console.warn('播放汽笛声失败:', e)
      }
    }

    function scheduleWhistles() {
      const delay = 20000 + Math.random() * 30000
      const id = setTimeout(() => {
        playWhistle()
        scheduleWhistles()
      }, delay)
      addTimeout(soundId, id)
    }

    scheduleWhistles()

    return {
      stop: () => {
        try {
          clearSoundTimeouts(soundId)
          rumbleSource.stop()
        } catch (e) {
          console.warn('停止火车音效失败:', e)
        }
      },
      gainNode: group
    }
  }

  function createStudySound(soundId) {
    if (!audioContext.value || !masterGain.value) return null
    const group = audioContext.value.createGain()
    group.gain.value = 0
    group.connect(masterGain.value)

    const windBuffer = createNoiseBuffer('pink', 4)
    const windSource = createLoopSource(windBuffer)
    const windFilter = audioContext.value.createBiquadFilter()
    windFilter.type = 'lowpass'
    windFilter.frequency.value = 500
    const windGain = audioContext.value.createGain()
    windGain.gain.value = 0.06
    windSource.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(group)
    windSource.start()

    function playTick() {
      if (!audioContext.value || group.gain.value === 0) return
      try {
        const osc = audioContext.value.createOscillator()
        const gain = audioContext.value.createGain()
        osc.type = 'sine'
        osc.frequency.value = 2500
        gain.gain.setValueAtTime(0, audioContext.value.currentTime)
        gain.gain.linearRampToValueAtTime(0.04, audioContext.value.currentTime + 0.002)
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.05)
        osc.connect(gain)
        gain.connect(group)
        osc.start()
        osc.stop(audioContext.value.currentTime + 0.05)
      } catch (e) {
        console.warn('播放钟摆声失败:', e)
      }
    }

    function scheduleTicks() {
      const id = setTimeout(() => {
        playTick()
        scheduleTicks()
      }, 1000)
      addTimeout(soundId, id)
    }

    scheduleTicks()

    return {
      stop: () => {
        try {
          clearSoundTimeouts(soundId)
          windSource.stop()
        } catch (e) {
          console.warn('停止书房音效失败:', e)
        }
      },
      gainNode: group
    }
  }

  function createCustomSound(soundId) {
    const sound = customSounds.value.find(s => s.id === soundId)
    if (!sound || !audioContext.value || !masterGain.value) return null

    try {
      const group = audioContext.value.createGain()
      group.gain.value = 0
      group.connect(masterGain.value)

      const source = audioContext.value.createBufferSource()
      source.buffer = sound.audioBuffer
      source.loop = true
      const gain = audioContext.value.createGain()
      gain.gain.value = 1
      source.connect(gain)
      gain.connect(group)
      source.start()

      return {
        stop: () => {
          try {
            source.stop()
          } catch (e) {
            console.warn('停止自定义音效失败:', e)
          }
        },
        gainNode: group
      }
    } catch (error) {
      console.error('创建自定义音效失败:', error)
      return null
    }
  }

  function createSound(soundId) {
    initAudioContext()
    resumeAudioContext()

    try {
      switch (soundId) {
        case 'cafe':
          return createCafeSound(soundId)
        case 'rain_light':
          return createRainSound(soundId, 'light')
        case 'rain_medium':
          return createRainSound(soundId, 'medium')
        case 'rain_heavy':
          return createRainSound(soundId, 'heavy')
        case 'forest':
          return createForestSound(soundId)
        case 'ocean':
          return createOceanSound(soundId)
        case 'fireplace':
          return createFireplaceSound(soundId)
        case 'library':
          return createLibrarySound(soundId)
        case 'train':
          return createTrainSound(soundId)
        case 'study':
          return createStudySound(soundId)
        default:
          if (customSounds.value.find(s => s.id === soundId)) {
            return createCustomSound(soundId)
          }
          return null
      }
    } catch (error) {
      console.error('创建音效失败:', soundId, error)
      return null
    }
  }

  function toggleSound(soundId) {
    try {
      initAudioContext()
      resumeAudioContext()

      if (soundNodes[soundId]) {
        stopSound(soundId)
      } else {
        playSound(soundId)
      }
      activePreset.value = null
    } catch (error) {
      console.error('切换音效失败:', error)
    }
  }

  function playSound(soundId, volume = null) {
    try {
      initAudioContext()
      resumeAudioContext()

      if (soundNodes[soundId]) {
        if (volume !== null) {
          setSoundVolume(soundId, volume)
        }
        return
      }

      const node = createSound(soundId)
      if (node) {
        soundNodes[soundId] = node
        const vol = volume !== null ? volume : (soundVolumes[soundId] ?? 0.5)
        setSoundVolume(soundId, vol)
        updateIsPlaying()
      }
    } catch (error) {
      console.error('播放音效失败:', soundId, error)
    }
  }

  function stopSound(soundId) {
    try {
      if (soundNodes[soundId]) {
        if (soundNodes[soundId].stop) {
          soundNodes[soundId].stop()
        }
        delete soundNodes[soundId]
        updateIsPlaying()
      }
    } catch (error) {
      console.error('停止音效失败:', soundId, error)
      delete soundNodes[soundId]
      updateIsPlaying()
    }
  }

  function setSoundVolume(soundId, volume) {
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume))
      soundVolumes[soundId] = clampedVolume
      if (soundNodes[soundId] && soundNodes[soundId].gainNode) {
        soundNodes[soundId].gainNode.gain.value = clampedVolume
      }
    } catch (error) {
      console.error('设置音量失败:', soundId, error)
    }
  }

  function updateIsPlaying() {
    isPlaying.value = Object.keys(soundNodes).length > 0
  }

  function stopAll() {
    try {
      const ids = Object.keys(soundNodes)
      ids.forEach(soundId => {
        stopSound(soundId)
      })
    } catch (error) {
      console.error('停止所有音效失败:', error)
    }
  }

  function applyPreset(presetId) {
    try {
      const preset = presets.value.find(p => p.id === presetId)
      if (!preset) return

      stopAll()
      activePreset.value = presetId

      Object.entries(preset.sounds).forEach(([soundId, volume]) => {
        playSound(soundId, volume)
      })
    } catch (error) {
      console.error('应用预设失败:', error)
    }
  }

  function savePreset(name, sounds) {
    try {
      const id = 'preset_' + Date.now()
      const preset = {
        id,
        name,
        sounds: { ...sounds }
      }
      presets.value.push(preset)
      saveToStorage()
      return id
    } catch (error) {
      console.error('保存预设失败:', error)
      return null
    }
  }

  function deletePreset(presetId) {
    try {
      const index = presets.value.findIndex(p => p.id === presetId)
      if (index > -1) {
        presets.value.splice(index, 1)
        if (activePreset.value === presetId) {
          activePreset.value = null
        }
        saveToStorage()
      }
    } catch (error) {
      console.error('删除预设失败:', error)
    }
  }

  function saveCurrentAsPreset(name) {
    try {
      const currentSounds = {}
      Object.keys(soundNodes).forEach(soundId => {
        currentSounds[soundId] = soundVolumes[soundId] ?? 0.5
      })
      if (Object.keys(currentSounds).length === 0) {
        return null
      }
      return savePreset(name, currentSounds)
    } catch (error) {
      console.error('保存当前预设失败:', error)
      return null
    }
  }

  async function addCustomSound(file) {
    try {
      initAudioContext()
      resumeAudioContext()

      if (!audioContext.value) return null

      if (file.size > 20 * 1024 * 1024) {
        throw new Error('文件大小不能超过 20MB')
      }

      const arrayBuffer = await file.arrayBuffer()
      let audioBuffer = null

      try {
        audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer.slice(0))
      } catch (decodeError) {
        console.error('音频解码失败:', decodeError)
        throw new Error('音频文件格式不支持或已损坏')
      }

      if (!audioBuffer) {
        throw new Error('无法解码音频文件')
      }

      const sound = {
        id: 'custom_' + Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        icon: '🎵',
        description: '自定义音频',
        category: 'custom',
        audioBuffer: markRaw(audioBuffer),
        fileName: file.name
      }

      customSounds.value.push(sound)
      saveToStorage()
      return sound
    } catch (error) {
      console.error('添加自定义音效失败:', error)
      return null
    }
  }

  function removeCustomSound(soundId) {
    try {
      stopSound(soundId)
      const index = customSounds.value.findIndex(s => s.id === soundId)
      if (index > -1) {
        customSounds.value.splice(index, 1)
        saveToStorage()
      }
    } catch (error) {
      console.error('删除自定义音效失败:', error)
    }
  }

  function saveToStorage() {
    try {
      const customPresets = presets.value.filter(p => !DEFAULT_PRESETS.find(dp => dp.id === p.id))
      const volumes = {}
      Object.keys(soundVolumes).forEach(key => {
        volumes[key] = soundVolumes[key]
      })

      const data = {
        presets: customPresets,
        masterVolume: masterVolume.value,
        soundVolumes: volumes
      }
      localStorage.setItem('ambientSound', JSON.stringify(data))
    } catch (error) {
      console.error('保存环境音设置失败:', error)
    }
  }

  function loadFromStorage() {
    try {
      const data = localStorage.getItem('ambientSound')
      if (data) {
        const parsed = JSON.parse(data)

        if (parsed.presets && Array.isArray(parsed.presets)) {
          presets.value = [...DEFAULT_PRESETS, ...parsed.presets]
        }

        if (typeof parsed.masterVolume === 'number') {
          masterVolume.value = parsed.masterVolume
          if (masterGain.value) {
            masterGain.value.gain.value = masterVolume.value
          }
        }

        if (parsed.soundVolumes && typeof parsed.soundVolumes === 'object') {
          Object.keys(parsed.soundVolumes).forEach(key => {
            if (typeof parsed.soundVolumes[key] === 'number') {
              soundVolumes[key] = parsed.soundVolumes[key]
            }
          })
        }
      }
    } catch (error) {
      console.error('加载环境音设置失败:', error)
    }
  }

  function getActiveSounds() {
    try {
      return Object.keys(soundNodes).map(id => {
        const sound = getAllSounds().find(s => s.id === id)
        return {
          id,
          name: sound?.name || id,
          icon: sound?.icon || '🎵',
          volume: soundVolumes[id] ?? 0.5
        }
      })
    } catch (error) {
      console.error('获取活跃音效失败:', error)
      return []
    }
  }

  function isSoundActive(soundId) {
    return !!soundNodes[soundId]
  }

  return {
    masterVolume,
    isPlaying,
    presets,
    customSounds,
    activePreset,
    soundVolumes,
    getAllSounds,
    initAudioContext,
    resumeAudioContext,
    setMasterVolume,
    toggleSound,
    playSound,
    stopSound,
    setSoundVolume,
    stopAll,
    applyPreset,
    savePreset,
    deletePreset,
    saveCurrentAsPreset,
    addCustomSound,
    removeCustomSound,
    saveToStorage,
    loadFromStorage,
    getActiveSounds,
    isSoundActive
  }
})
