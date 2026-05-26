import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mic2 } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.login({ email, password })
      login(res.data.access_token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Mic2 size={30} className="text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Aria</h1>
        </div>
        <h2 className="text-lg text-gray-300 text-center mb-6">Welcome back</h2>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm rounded-lg px-4 py-2 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 text-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 text-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
