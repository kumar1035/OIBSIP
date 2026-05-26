import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, MessageSquare, Bot, Volume2, VolumeX } from 'lucide-react'
import Navbar from '../components/Navbar'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { chatAPI } from '../services/api'

export default function Assistant() {
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const messagesEndRef = useRef(null)

  const { isListening, transcript, supported: voiceSupported, startListening, stopListening } =
    useSpeechRecognition()
  const { isSpeaking, speak, stopSpeaking } = useSpeechSynthesis()

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const loadSessions = async () => {
    try {
      const res = await chatAPI.getSessions()
      setSessions(res.data)
    } catch {
      // silently ignore
    }
  }

  const loadSession = async (sessionId) => {
    try {
      const res = await chatAPI.getSession(sessionId)
      setCurrentSessionId(sessionId)
      setMessages(res.data.messages)
    } catch {
      // silently ignore
    }
  }

  const startNewChat = () => {
    setCurrentSessionId(null)
    setMessages([])
    stopSpeaking()
  }

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation()
    try {
      await chatAPI.deleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      if (currentSessionId === sessionId) startNewChat()
    } catch {
      // silently ignore
    }
  }

  const handleSendMessage = async (content) => {
    if (!content.trim() || isLoading) return

    const tempId = `temp-${Date.now()}`
    setMessages(prev => [
      ...prev,
      { id: tempId, role: 'user', content, created_at: new Date().toISOString() },
    ])
    setIsLoading(true)

    try {
      const res = await chatAPI.sendMessage({ content, session_id: currentSessionId })
      const { session_id, user_message, assistant_message } = res.data

      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        user_message,
        assistant_message,
      ])

      if (!currentSessionId) {
        setCurrentSessionId(session_id)
        loadSessions()
      } else {
        setSessions(prev =>
          prev.map(s => s.id === session_id ? { ...s, updated_at: new Date().toISOString() } : s)
        )
      }

      if (ttsEnabled) speak(assistant_message.content)
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          created_at: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      stopSpeaking()
      startListening((finalText) => {
        if (finalText.trim()) handleSendMessage(finalText.trim())
      })
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
          <div className="p-3">
            <button
              onClick={startNewChat}
              className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <Plus size={15} />
              New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sessions.length === 0 ? (
              <p className="text-gray-600 text-xs text-center mt-6 px-4">No conversations yet</p>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                    currentSessionId === session.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                  }`}
                >
                  <MessageSquare size={13} className="text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300 truncate flex-1">{session.title}</span>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                    aria-label="Delete session"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4">
                  <Bot size={30} className="text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-200 mb-2">Hi, I&apos;m Aria</h2>
                <p className="text-gray-500 text-sm max-w-xs">
                  Your AI voice assistant. Type a message or click the microphone to start talking.
                </p>
              </div>
            )}

            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <Bot size={15} className="text-gray-300" />
                </div>
                <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* TTS controls */}
          <div className="flex items-center gap-3 px-6 pt-1">
            <button
              onClick={() => { setTtsEnabled(p => !p); if (ttsEnabled) stopSpeaking() }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {ttsEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              {ttsEnabled ? 'Voice on' : 'Voice off'}
            </button>
            {isSpeaking && (
              <button onClick={stopSpeaking} className="text-xs text-indigo-400 hover:text-indigo-300">
                Stop speaking
              </button>
            )}
          </div>

          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            isListening={isListening}
            transcript={transcript}
            onVoiceToggle={handleVoiceToggle}
            voiceSupported={voiceSupported}
          />
        </main>
      </div>
    </div>
  )
}
