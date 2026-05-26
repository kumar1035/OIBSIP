import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mic2 } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.register({
        username: form.username,
        email: form.email,
        password: form.password,
      })
      login(res.data.access_token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
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
        <h2 className="text-lg text-gray-300 text-center mb-6">Create your account</h2>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm rounded-lg px-4 py-2 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={set('username')}
              required
              className="w-full bg-gray-800 text-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
              placeholder="yourname"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              className="w-full bg-gray-800 text-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              className="w-full bg-gray-800 text-gray-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
              placeholder="Min. 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
