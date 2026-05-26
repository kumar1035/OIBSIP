import { Mic2, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <Mic2 size={22} className="text-indigo-400" />
        <span className="text-white font-bold text-lg tracking-wide">Aria</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <User size={14} />
          <span>{user?.username}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  )
}
