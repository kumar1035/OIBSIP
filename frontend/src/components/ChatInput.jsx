import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import VoiceButton from './VoiceButton'

export default function ChatInput({ onSend, isLoading, isListening, transcript, onVoiceToggle, voiceSupported }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [text])

  const handleSubmit = (e) => {
    e?.preventDefault()
    const msg = text.trim()
    if (!msg || isLoading) return
    onSend(msg)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const displayValue = isListening ? transcript : text

  return (
    <div className="border-t border-gray-800 p-4 flex-shrink-0">
      {isListening && (
        <p className="text-xs text-indigo-400 mb-2 animate-pulse">Listening — speak now...</p>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={displayValue}
          onChange={(e) => { if (!isListening) setText(e.target.value) }}
          onKeyDown={handleKeyDown}
          readOnly={isListening}
          placeholder="Type a message or click the mic..."
          rows={1}
          className="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          style={{ minHeight: '48px' }}
        />
        {voiceSupported && (
          <VoiceButton
            isListening={isListening}
            onClick={onVoiceToggle}
            disabled={isLoading}
          />
        )}
        <button
          type="submit"
          disabled={!text.trim() || isLoading || isListening}
          className="w-11 h-11 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          <Send size={17} className="text-white" />
        </button>
      </form>
    </div>
  )
}
