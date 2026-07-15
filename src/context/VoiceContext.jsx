import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const VoiceContext = createContext(null)

const VOICES_BY_LANG = {
  'en': ['Google US English', 'Google UK English Female', 'Google UK English Male', 'Microsoft Zira', 'Microsoft David', 'Samantha', 'Daniel'],
  'fil': ['Google Filipino', 'Google Tagalog'],
}

function findBestVoice(lang = 'en') {
  const voices = window.speechSynthesis?.getVoices() || []
  if (voices.length === 0) return null

  const preferred = VOICES_BY_LANG[lang] || VOICES_BY_LANG['en']
  for (const name of preferred) {
    const match = voices.find(v => v.name.includes(name))
    if (match) return match
  }

  const langPrefix = lang === 'fil' ? 'fil' : 'en'
  const byLang = voices.find(v => v.lang.startsWith(langPrefix))
  if (byLang) return byLang

  return voices[0] || null
}

export function VoiceProvider({ children }) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('im_tts_enabled') === 'true')
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(() => localStorage.getItem('im_voice_commands') === 'true')
  const [readingMode, setReadingMode] = useState(() => localStorage.getItem('im_reading_mode') === 'true')
  const [highlightOnRead, setHighlightOnRead] = useState(() => localStorage.getItem('im_highlight_read') === 'true')
  const [speechRate, setSpeechRate] = useState(() => Number(localStorage.getItem('im_speech_rate')) || 1)
  const [voiceName, setVoiceName] = useState(() => localStorage.getItem('im_voice_name') || '')
  const [isListening, setIsListening] = useState(false)
  const [lastCommand, setLastCommand] = useState('')
  const [announceText, setAnnounceText] = useState('')
  const recognitionRef = useRef(null)
  const currentUtterance = useRef(null)
  const announceTimerRef = useRef(null)
  const enabledRef = useRef(enabled)
  const voiceCommandsEnabledRef = useRef(voiceCommandsEnabled)
  const readingModeRef = useRef(readingMode)
  const highlightOnReadRef = useRef(highlightOnRead)
  const speechRateRef = useRef(speechRate)

  useEffect(() => { enabledRef.current = enabled }, [enabled])
  useEffect(() => { voiceCommandsEnabledRef.current = voiceCommandsEnabled }, [voiceCommandsEnabled])
  useEffect(() => { readingModeRef.current = readingMode }, [readingMode])
  useEffect(() => { highlightOnReadRef.current = highlightOnRead }, [highlightOnRead])
  useEffect(() => { speechRateRef.current = speechRate }, [speechRate])

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('im_tts_enabled', enabled)
    localStorage.setItem('im_voice_commands', voiceCommandsEnabled)
    localStorage.setItem('im_reading_mode', readingMode)
    localStorage.setItem('im_highlight_read', highlightOnRead)
    localStorage.setItem('im_speech_rate', speechRate)
    localStorage.setItem('im_voice_name', voiceName)
  }, [enabled, voiceCommandsEnabled, readingMode, highlightOnRead, speechRate, voiceName])

  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    if (!window.speechSynthesis) return

    const onBoundary = () => setIsSpeaking(window.speechSynthesis.speaking)
    const onStart = () => setIsSpeaking(true)
    const onEnd = () => setIsSpeaking(false)
    const onPause = () => setIsSpeaking(window.speechSynthesis.speaking)
    const onResume = () => setIsSpeaking(true)

    window.speechSynthesis.addEventListener('boundary', onBoundary)
    window.speechSynthesis.addEventListener('start', onStart)
    window.speechSynthesis.addEventListener('end', onEnd)
    window.speechSynthesis.addEventListener('pause', onPause)
    window.speechSynthesis.addEventListener('resume', onResume)
    return () => {
      window.speechSynthesis.removeEventListener('boundary', onBoundary)
      window.speechSynthesis.removeEventListener('start', onStart)
      window.speechSynthesis.removeEventListener('end', onEnd)
      window.speechSynthesis.removeEventListener('pause', onPause)
      window.speechSynthesis.removeEventListener('resume', onResume)
    }
  }, [])

  const announce = useCallback((text) => {
    if (announceTimerRef.current) clearTimeout(announceTimerRef.current)
    setAnnounceText('')
    announceTimerRef.current = setTimeout(() => setAnnounceText(text), 50)
  }, [])

  const speak = useCallback((text, priority = false) => {
    if (!enabledRef.current || !text?.trim()) return
    if (!window.speechSynthesis) return

    if (priority) window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = findBestVoice()
    if (voice) utterance.voice = voice
    utterance.rate = speechRateRef.current
    utterance.pitch = 1
    utterance.volume = 1
    currentUtterance.current = utterance

    utterance.onend = () => { currentUtterance.current = null }
    utterance.onerror = () => { currentUtterance.current = null }

    window.speechSynthesis.speak(utterance)
  }, [])

  const speakElement = useCallback((element) => {
    if (!enabledRef.current || !element) return
    const text = getElementText(element)
    if (text) speak(text)
  }, [speak])

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    currentUtterance.current = null
  }, [])

  const speakPageTitle = useCallback(() => {
    const h1 = document.querySelector('h1')
    if (h1) speak(h1.textContent, true)
  }, [speak])

  const speakPageContent = useCallback(() => {
    const main = document.querySelector('main') || document.querySelector('[role="main"]') || document.querySelector('.max-w-7xl')
    if (!main) return
    const text = getElementText(main)
    if (text) speak(text, true)
  }, [speak])

  const speakFocused = useCallback(() => {
    const el = document.activeElement
    if (el && el !== document.body) speakElement(el)
  }, [speakElement])

  useEffect(() => {
    if (!readingModeRef.current || !enabledRef.current) return

    const handleMouseOver = (e) => {
      if (!readingModeRef.current || !enabledRef.current) return
      const target = e.target.closest('a, button, h1, h2, h3, h4, p, span, label, td, th')
      if (target && target.textContent?.trim()) {
        speak(target.textContent.trim().slice(0, 200), true)
        if (highlightOnReadRef.current) {
          document.querySelectorAll('.reading-highlight').forEach(el => el.classList.remove('reading-highlight'))
          target.classList.add('reading-highlight')
        }
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    return () => document.removeEventListener('mouseover', handleMouseOver)
  }, [readingMode, enabled, highlightOnRead, speak])

  const handleVoiceCommand = useCallback((command) => {
    const nav = (path) => { window.location.hash = ''; window.location.pathname = path }
    const click = (sel) => document.querySelector(sel)?.click()
    const focus = (sel) => document.querySelector(sel)?.focus()

    if (command.includes('help') || command.includes('commands')) {
      speak('Available commands: Go home, Go to catalog, Go to cart, Go to checkout, Scroll up, Scroll down, Go to top, Go to bottom, Read page, Read title, Stop speaking, Go back, Search, Open menu, Close menu, and focus navigation.', true)
      return
    }
    if (command.includes('go home') || command === 'home') { nav('/'); return }
    if (command.includes('catalog') || command.includes('shop')) { nav('/catalog'); return }
    if (command.includes('cart') || command.includes('basket')) { nav('/buyer/cart'); return }
    if (command.includes('checkout') || command.includes('check out')) { nav('/buyer/checkout'); return }
    if (command.includes('orders') || command.includes('my orders')) { nav('/buyer/orders'); return }
    if (command.includes('profile') || command.includes('my profile')) { nav('/buyer/profile'); return }
    if (command.includes('login') || command.includes('sign in')) { nav('/login'); return }
    if (command.includes('register') || command.includes('sign up')) { nav('/register'); return }
    if (command.includes('dashboard')) { nav('/seller/dashboard'); return }
    if (command.includes('analytics')) { nav('/seller/analytics'); return }
    if (command.includes('admin')) { nav('/admin/dashboard'); return }
    if (command.includes('scroll up')) { window.scrollBy({ top: -400, behavior: 'smooth' }); announce('Scrolled up'); return }
    if (command.includes('scroll down')) { window.scrollBy({ top: 400, behavior: 'smooth' }); announce('Scrolled down'); return }
    if (command.includes('go to top') || command.includes('top of page')) { window.scrollTo({ top: 0, behavior: 'smooth' }); announce('At top of page'); return }
    if (command.includes('go to bottom') || command.includes('bottom')) { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); announce('At bottom of page'); return }
    if (command.includes('read page') || command.includes('read this page')) { speakPageContent(); return }
    if (command.includes('read title') || command.includes('read heading')) { speakPageTitle(); return }
    if (command.includes('read') || command.includes('what is this')) { speakFocused(); return }
    if (command.includes('stop') || command.includes('stop speaking') || command.includes('shut up') || command.includes('quiet')) { stopSpeaking(); announce('Speech stopped'); return }
    if (command.includes('go back') || command.includes('back')) { window.history.back(); return }
    if (command.includes('search')) { focus('input[type="search"], input[placeholder*="Search"]'); announce('Search field focused'); return }
    if (command.includes('open menu') || command.includes('menu')) { click('button[aria-label*="menu"], button[aria-label*="Menu"]'); announce('Menu opened'); return }
    if (command.includes('close menu')) { click('button[aria-label*="close"], button[aria-label*="Close"]'); announce('Menu closed'); return }
    if (command.includes('next') || command.includes('next item')) { focus('[tabindex]:not([tabindex="-1"]):not(input):not(button):not(a)'); return }
    if (command.includes('focus navigation') || command.includes('navigation')) { focus('nav a, nav button'); announce('Navigation focused'); return }

    announce(`Command not recognized: "${command}". Say "help" for available commands.`)
  }, [speak, speakPageContent, speakPageTitle, speakFocused, stopSpeaking, announce])

  const startVoiceCommands = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      announce('Voice commands not supported in this browser')
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1]
      if (last.isFinal) {
        const command = last[0].transcript.toLowerCase().trim()
        setLastCommand(command)
        handleVoiceCommand(command)
      }
    }

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        announce('Voice command error: ' + event.error)
        setIsListening(false)
      }
    }

    recognition.onend = () => {
      if (voiceCommandsEnabledRef.current) {
        try { recognition.start() } catch { setIsListening(false) }
      }
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
      announce('Voice commands activated. Say "help" for available commands.')
    } catch {
      announce('Could not start voice recognition')
    }
  }, [handleVoiceCommand, announce])

  useEffect(() => {
    if (!voiceCommandsEnabled) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
        setIsListening(false)
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [voiceCommandsEnabled])

  const setHighContrastToggle = useCallback(() => {
    document.documentElement.classList.toggle('high-contrast')
    const isHC = document.documentElement.classList.contains('high-contrast')
    localStorage.setItem('im_high_contrast', isHC)
    announce(isHC ? 'High contrast enabled' : 'High contrast disabled')
  }, [announce])

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.altKey) {
        switch (e.key) {
          case '1': e.preventDefault(); speakPageTitle(); break
          case '2': e.preventDefault(); speakPageContent(); break
          case '3': e.preventDefault(); speakFocused(); break
          case '4': e.preventDefault(); stopSpeaking(); announce('Speech stopped'); break
          case '5': e.preventDefault(); setEnabled(prev => !prev); break
          case '6': e.preventDefault(); setVoiceCommandsEnabled(prev => !prev); break
          case '7': e.preventDefault(); setReadingMode(prev => !prev); break
          case '8': e.preventDefault(); document.querySelector('input[type="search"]')?.focus(); break
          case '9': e.preventDefault(); setHighContrastToggle(); break
          case '0': e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); announce('At top of page'); break
          case 'h': e.preventDefault(); handleVoiceCommand('help'); break
          default: break
        }
      }
      if (e.key === 'Escape') {
        stopSpeaking()
        document.querySelectorAll('.reading-highlight').forEach(el => el.classList.remove('reading-highlight'))
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [speakPageTitle, speakPageContent, speakFocused, stopSpeaking, announce, setEnabled, setVoiceCommandsEnabled, setReadingMode, setHighContrastToggle, handleVoiceCommand])

  const value = {
    enabled, setEnabled,
    voiceCommandsEnabled, setVoiceCommandsEnabled,
    readingMode, setReadingMode,
    highlightOnRead, setHighlightOnRead,
    speechRate, setSpeechRate,
    voiceName, setVoiceName,
    isListening, lastCommand, isSpeaking,
    speak, speakElement, speakPageTitle, speakPageContent, speakFocused,
    stopSpeaking, announce, startVoiceCommands,
    voices: typeof window !== 'undefined' ? (window.speechSynthesis?.getVoices?.() || []) : [],
  }

  return (
    <VoiceContext.Provider value={value}>
      {children}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="log"
      >
        {announceText}
      </div>
    </VoiceContext.Provider>
  )
}

export const useVoice = () => useContext(VoiceContext)

function getElementText(el) {
  if (!el) return ''
  const clone = el.cloneNode(true)
  clone.querySelectorAll('script, style, svg, img').forEach(n => n.remove())
  return (clone.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 500)
}
