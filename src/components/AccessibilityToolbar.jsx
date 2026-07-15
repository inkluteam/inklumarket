import { useState, useEffect } from 'react'
import { Accessibility, Type, Contrast, ZoomIn, ZoomOut, X, Volume2, VolumeX, Mic, MicOff, Eye, BookOpen, Sparkles, Keyboard, Hand, HelpCircle, ChevronDown, ChevronUp, Languages } from 'lucide-react'
import { useVoice } from '../context/VoiceContext'

const SHORTCUTS = [
  { keys: 'Alt + 1', desc: 'Read page title' },
  { keys: 'Alt + 2', desc: 'Read page content' },
  { keys: 'Alt + 3', desc: 'Read focused element' },
  { keys: 'Alt + 4', desc: 'Stop speaking' },
  { keys: 'Alt + 5', desc: 'Toggle text-to-speech' },
  { keys: 'Alt + 6', desc: 'Toggle voice commands' },
  { keys: 'Alt + 7', desc: 'Toggle reading mode' },
  { keys: 'Alt + 8', desc: 'Focus search' },
  { keys: 'Alt + 9', desc: 'Toggle high contrast' },
  { keys: 'Alt + 0', desc: 'Scroll to top' },
  { keys: 'Alt + H', desc: 'Voice command help' },
  { keys: 'Escape', desc: 'Stop all speech' },
]

const VOICE_COMMANDS_HELP = [
  { cmd: '"Go home"', desc: 'Navigate to home page' },
  { cmd: '"Go to catalog"', desc: 'Open product catalog' },
  { cmd: '"Go to cart"', desc: 'Open shopping cart' },
  { cmd: '"Go to checkout"', desc: 'Go to checkout' },
  { cmd: '"Read page"', desc: 'Read all page content aloud' },
  { cmd: '"Read title"', desc: 'Read the page title' },
  { cmd: '"Stop speaking"', desc: 'Stop all speech' },
  { cmd: '"Scroll up / down"', desc: 'Scroll the page' },
  { cmd: '"Go to top"', desc: 'Scroll to page top' },
  { cmd: '"Search"', desc: 'Focus the search field' },
  { cmd: '"Go back"', desc: 'Navigate back' },
  { cmd: '"Help"', desc: 'List all available commands' },
]

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('display')
  const {
    enabled: ttsEnabled, setEnabled: setTtsEnabled,
    voiceCommandsEnabled, setVoiceCommandsEnabled,
    readingMode, setReadingMode,
    highlightOnRead, setHighlightOnRead,
    speechRate, setSpeechRate,
    isListening, lastCommand,
    speak, stopSpeaking, startVoiceCommands, speakPageTitle,
  } = useVoice()

  const [fontSize, setFontSize] = useState(() => localStorage.getItem('im_font_size') || '16')
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('im_high_contrast') === 'true')
  const [visualAlerts, setVisualAlerts] = useState(() => localStorage.getItem('im_visual_alerts') === 'true')
  const [largeCursors, setLargeCursors] = useState(() => localStorage.getItem('im_large_cursors') === 'true')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showVoiceHelp, setShowVoiceHelp] = useState(false)

  useEffect(() => {
    const sync = () => {
      setHighContrast(localStorage.getItem('im_high_contrast') === 'true')
      setVisualAlerts(localStorage.getItem('im_visual_alerts') === 'true')
      setLargeCursors(localStorage.getItem('im_large_cursors') === 'true')
      setFontSize(localStorage.getItem('im_font_size') || '16')
    }
    window.addEventListener('storage', sync)
    const interval = setInterval(sync, 500)
    return () => {
      window.removeEventListener('storage', sync)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + 'px'
    localStorage.setItem('im_font_size', fontSize)
  }, [fontSize])

  useEffect(() => {
    if (highContrast) document.documentElement.classList.add('high-contrast')
    else document.documentElement.classList.remove('high-contrast')
    localStorage.setItem('im_high_contrast', highContrast)
  }, [highContrast])

  useEffect(() => {
    if (visualAlerts) localStorage.setItem('im_visual_alerts', 'true')
    else localStorage.removeItem('im_visual_alerts')
  }, [visualAlerts])

  useEffect(() => {
    if (largeCursors) document.documentElement.classList.add('large-cursors')
    else document.documentElement.classList.remove('large-cursors')
    localStorage.setItem('im_large_cursors', largeCursors)
  }, [largeCursors])

  const tabs = [
    { id: 'display', label: 'Display', icon: Eye },
    { id: 'speech', label: 'Speech', icon: Volume2 },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ]

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label={open ? 'Close accessibility settings' : 'Open accessibility settings'}
        title="Accessibility settings (Alt+A)"
      >
        <Accessibility className="w-6 h-6" />
      </button>

      {open && (
        <div
          className="fixed bottom-20 left-6 z-50 bg-white rounded-xl shadow-2xl border w-80 max-h-[85vh] overflow-hidden flex flex-col"
          role="dialog"
          aria-label="Accessibility settings"
          aria-modal="false"
        >
          <div className="flex justify-between items-center px-5 py-4 border-b bg-gradient-to-r from-blue-50 to-emerald-50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
              <Accessibility className="w-5 h-5 text-blue-600" /> Accessibility
            </h2>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100" aria-label="Close accessibility panel">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b" role="tablist">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors ${tab === t.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Display Tab */}
            {tab === 'display' && (
              <div id="panel-display" role="tabpanel" className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Type className="w-4 h-4" /> Font Size
                  </label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setFontSize(String(Math.max(12, Number(fontSize) - 2)))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Decrease font size" disabled={Number(fontSize) <= 12}>
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold w-16 text-center bg-gray-50 py-1 rounded">{fontSize}px</span>
                    <button onClick={() => setFontSize(String(Math.min(28, Number(fontSize) + 2)))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Increase font size" disabled={Number(fontSize) >= 28}>
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={() => setFontSize('16')} className="text-xs text-blue-600 hover:text-blue-700 font-medium underline">Reset</button>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[12, 14, 16, 18, 20, 24, 28].map(size => (
                      <button key={size} onClick={() => setFontSize(String(size))} className={`text-xs px-2 py-1 rounded ${Number(fontSize) === size ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{size}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Contrast className="w-4 h-4" /> Display Mode
                  </label>
                  <div className="space-y-2">
                    <ToggleButton
                      active={highContrast}
                      onToggle={() => setHighContrast(!highContrast)}
                      label="High Contrast"
                      desc="Increases contrast for better visibility"
                    />
                    <ToggleButton
                      active={largeCursors}
                      onToggle={() => setLargeCursors(!largeCursors)}
                      label="Large Cursor"
                      desc="Enlarged mouse cursor for easier tracking"
                    />
                    <ToggleButton
                      active={visualAlerts}
                      onToggle={() => setVisualAlerts(!visualAlerts)}
                      label="Visual Alert Flash"
                      desc="Screen flash for deaf/hard-of-hearing users"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Speech Tab */}
            {tab === 'speech' && (
              <div id="panel-speech" role="tabpanel" className="space-y-5">
                <div>
                  <ToggleButton
                    active={ttsEnabled}
                    onToggle={() => setTtsEnabled(!ttsEnabled)}
                    label="Text-to-Speech"
                    desc="Read page content aloud"
                    icon={<Volume2 className="w-4 h-4" />}
                  />
                </div>

                {ttsEnabled && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Languages className="w-4 h-4" /> Speech Rate
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={speechRate}
                          onChange={(e) => setSpeechRate(Number(e.target.value))}
                          className="flex-1 accent-blue-600"
                          aria-label="Speech rate"
                        />
                        <span className="text-sm font-bold w-10 text-center">{speechRate}x</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Slower</span>
                        <span>Faster</span>
                      </div>
                    </div>

                    <div>
                      <ToggleButton
                        active={readingMode}
                        onToggle={() => setReadingMode(!readingMode)}
                        label="Reading Mode"
                        desc="Hover over elements to hear them read aloud"
                        icon={<BookOpen className="w-4 h-4" />}
                      />
                    </div>

                    {readingMode && (
                      <div className="pl-4">
                        <ToggleButton
                          active={highlightOnRead}
                          onToggle={() => setHighlightOnRead(!highlightOnRead)}
                          label="Highlight on Read"
                          desc="Visually highlight text being read"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={speakPageTitle} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                          <Volume2 className="w-4 h-4" /> Read Title
                        </button>
                        <button onClick={stopSpeaking} className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                          <VolumeX className="w-4 h-4" /> Stop
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Voice Commands Tab */}
            {tab === 'voice' && (
              <div id="panel-voice" role="tabpanel" className="space-y-5">
                <div>
                  <ToggleButton
                    active={voiceCommandsEnabled}
                    onToggle={() => setVoiceCommandsEnabled(!voiceCommandsEnabled)}
                    label="Voice Commands"
                    desc="Control the app with your voice"
                    icon={<Mic className="w-4 h-4" />}
                  />
                </div>

                {voiceCommandsEnabled && (
                  <>
                    <div className={`p-3 rounded-lg flex items-center gap-3 ${isListening ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{isListening ? 'Listening...' : 'Not active'}</p>
                        {lastCommand && <p className="text-xs text-gray-500 mt-0.5">Last: "{lastCommand}"</p>}
                      </div>
                      <button
                        onClick={startVoiceCommands}
                        className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                        aria-label={isListening ? 'Stop listening' : 'Start listening'}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>

                    <button onClick={() => setShowVoiceHelp(!showVoiceHelp)} className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                      <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Available Voice Commands</span>
                      {showVoiceHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showVoiceHelp && (
                      <div className="space-y-1.5 bg-gray-50 rounded-lg p-3">
                        {VOICE_COMMANDS_HELP.map((cmd, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <code className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono shrink-0">{cmd.cmd}</code>
                            <span className="text-gray-600">{cmd.desc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Help Tab */}
            {tab === 'help' && (
              <div id="panel-help" role="tabpanel" className="space-y-5">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                    <Hand className="w-4 h-4" /> For Blind / Low Vision Users
                  </h3>
                  <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside">
                    <li>Enable <strong>Text-to-Speech</strong> to hear page content</li>
                    <li>Enable <strong>Reading Mode</strong> — hover over any element to hear it</li>
                    <li>Enable <strong>Voice Commands</strong> to navigate hands-free</li>
                    <li>Use <strong>Alt + Number</strong> keys for quick actions</li>
                    <li>Press <strong>Tab</strong> to navigate between interactive elements</li>
                    <li>Use <strong>High Contrast</strong> for better visibility</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-bold text-purple-900 text-sm mb-2 flex items-center gap-2">
                    <Mic className="w-4 h-4" /> For Deaf / Hard of Hearing Users
                  </h3>
                  <ul className="text-xs text-purple-800 space-y-1.5 list-disc list-inside">
                    <li>Enable <strong>Visual Alert Flash</strong> for on-screen notifications</li>
                    <li>All alerts appear as large visual banners on screen</li>
                    <li>No audio required — all info displayed visually</li>
                    <li>Use keyboard shortcuts for all actions</li>
                    <li>Cart updates show visual confirmation</li>
                  </ul>
                </div>

                <div>
                  <button onClick={() => setShowShortcuts(!showShortcuts)} className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                    <span className="flex items-center gap-2"><Keyboard className="w-4 h-4" /> Keyboard Shortcuts</span>
                    {showShortcuts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showShortcuts && (
                    <div className="mt-2 space-y-1 bg-gray-50 rounded-lg p-3">
                      {SHORTCUTS.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <kbd className="bg-white border px-2 py-0.5 rounded font-mono text-gray-700 font-semibold">{s.keys}</kbd>
                          <span className="text-gray-500">{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { speak('Accessibility help panel. This panel provides information about text to speech, voice commands, visual alerts, and keyboard shortcuts for blind and deaf users.') }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  aria-label="Hear help information"
                >
                  <Volume2 className="w-4 h-4" /> Hear This Help
                </button>
              </div>
            )}
          </div>

          <div className="border-t px-5 py-3 bg-gray-50 text-center">
            <p className="text-xs text-gray-400">Press <kbd className="bg-white border px-1 rounded text-xs">Alt+H</kbd> for help anywhere</p>
          </div>
        </div>
      )}
    </>
  )
}

function ToggleButton({ active, onToggle, label, desc, icon }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${active ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
      role="switch"
      aria-checked={active}
      aria-label={`${label}: ${active ? 'on' : 'off'}`}
    >
      {icon && <span className={`${active ? 'text-blue-600' : 'text-gray-400'}`}>{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${active ? 'text-blue-900' : 'text-gray-700'}`}>{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${active ? 'bg-blue-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${active ? 'translate-x-5' : ''}`} />
      </div>
    </button>
  )
}
