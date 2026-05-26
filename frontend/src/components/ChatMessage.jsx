import { Bot, User } from 'lucide-react'

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-600' : 'bg-gray-700'
        }`}
      >
        {isUser ? <User size={15} className="text-white" /> : <Bot size={15} className="text-gray-300" />}
      </div>

      <div className={`max-w-[72%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-gray-800 text-gray-100 rounded-tl-none'
          }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-gray-600 px-1">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  )
}
