import { Mic, MicOff } from 'lucide-react'

export default function VoiceButton({ isListening, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      className={`relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
        isListening
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed'
      }`}
    >
      {isListening ? (
        <MicOff size={18} className="text-white" />
      ) : (
        <Mic size={18} className="text-white" />
      )}
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
      )}
    </button>
  )
}
