import { useVoice } from '../context/VoiceContext'
import { Volume2, VolumeX } from 'lucide-react'

export default function SpeakButton({ text, label, className = '' }) {
  const { speak, stopSpeaking, enabled, isSpeaking } = useVoice()

  if (!enabled) return null

  return (
    <button
      onClick={() => {
        if (isSpeaking) {
          stopSpeaking()
        } else {
          speak(text)
        }
      }}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors ${className}`}
      aria-label={label || 'Read this aloud'}
      title={label || 'Read this aloud'}
    >
      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      <span className="sr-only">{isSpeaking ? 'Stop reading' : 'Read aloud'}</span>
    </button>
  )
}

export function ReadPageButton({ className = '' }) {
  const { speakPageContent, speakPageTitle, enabled } = useVoice()

  if (!enabled) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={speakPageTitle}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
        aria-label="Read page title"
      >
        <Volume2 className="w-3 h-3" /> Read Title
      </button>
      <button
        onClick={speakPageContent}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
        aria-label="Read entire page content"
      >
        <Volume2 className="w-3 h-3" /> Read Page
      </button>
    </div>
  )
}
