import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDarkMode } from '../context/DarkModeContext'
import { 
  FiMoon, 
  FiSun, 
  FiEye, 
  FiEyeOff, 
  FiCheck, 
  FiArrowRight, 
  FiLayout, 
  FiActivity, 
  FiShield,
  FiLock,
  FiUser
} from 'react-icons/fi'

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ username: false, password: false })
  
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/auth/login', formData)
      onLogin(response.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const isUsernameValid = formData.username.trim().length >= 3
  const isPasswordValid = formData.password.length >= 4

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* CSS Stylesheet Injector for Premium Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-glow-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.25; }
          33% { transform: translate(30px, -50px) scale(1.15); opacity: 0.35; }
          66% { transform: translate(-20px, 20px) scale(0.9); opacity: 0.2; }
        }
        @keyframes pulse-glow-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.2; }
          50% { transform: translate(-40px, 40px) scale(1.2); opacity: 0.35; }
        }
        @keyframes slide-up-fade {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in-left {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-glow-1 {
          animation: pulse-glow-1 12s infinite alternate ease-in-out;
        }
        .animate-glow-2 {
          animation: pulse-glow-2 16s infinite alternate ease-in-out;
        }
        .animate-slide-up {
          animation: slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-left {
          animation: fade-in-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Global Background Grid Subtle Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.03),transparent_40%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.015),transparent_40%)] pointer-events-none" />

      {/* LEFT SIDE: Brand & Value Prop Experience */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] xl:w-[42%] relative overflow-hidden bg-slate-950 text-slate-100 flex-col justify-between p-12 lg:p-16 border-r border-slate-900">
        {/* Animated Mesh Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-15%] w-[90%] h-[90%] rounded-full bg-indigo-500/20 blur-[120px] mix-blend-screen animate-glow-1" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[90%] h-[90%] rounded-full bg-purple-600/15 blur-[130px] mix-blend-screen animate-glow-2" />
          <div className="absolute inset-0 bg-slate-950/20" />
        </div>

        {/* Elegant Tech Grid Mask */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Logo/Brand Header */}
        <div className="relative z-10 flex items-center gap-3 animate-fade-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>

        {/* Value Prop Content */}
        <div className="relative z-10 my-auto py-12 animate-fade-left" style={{ animationDelay: '150ms' }}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            V2.0 Workspace Release
          </span>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight mb-6">
            Where focus meets <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              seamless execution.
            </span>
          </h1>
          <p className="text-slate-400 text-sm lg:text-base leading-relaxed mb-10 max-w-md">
            The clean, intelligent task organizer configured to help teams align, ship features, and maintain uninterrupted momentum.
          </p>

          {/* Core Highlights */}
          <div className="space-y-6 max-w-sm">
            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-indigo-500/40 transition-all duration-300">
                <FiLayout className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-200">Unified Kanban & List Views</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Transition seamlessly between project stages and customizable sprints.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-purple-500/40 transition-all duration-300">
                <FiActivity className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-200">Velocity & Focus Insights</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Track metrics dynamically with customized reporting analytics.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-pink-500/40 transition-all duration-300">
                <FiShield className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-200">Enterprise Grade Isolation</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Protected workspaces built on highly resilient modern standards.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 flex justify-between items-center animate-fade-left" style={{ animationDelay: '300ms' }}>
          <span>© 2026 TaskFlow Inc.</span>
          <a href="#" className="hover:text-slate-300 transition-colors">Security & Trust</a>
        </div>
      </div>

      {/* RIGHT SIDE: Elevated Glassmorphic Card Login Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative">
        {/* Floating Theme Switch */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-6 right-6 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm z-50 cursor-pointer active:scale-95"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <FiSun className="w-4 h-4 text-yellow-500" /> : <FiMoon className="w-4 h-4" />}
        </button>

        {/* Outer subtle glow behind the login form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/5 dark:bg-indigo-500/2 rounded-full blur-[100px] pointer-events-none" />

        {/* Login Container Wrapper */}
        <div className="w-full max-w-md relative z-10 animate-slide-up">
          {/* Logo representation on Mobile/Tablet */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-slate-100">
              TaskFlow
            </span>
          </div>

          {/* Elevated Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] rounded-2xl p-8 sm:p-10">
            {/* Header Text */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Enter your details below to log in to your account.
              </p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex gap-2.5 items-start animate-fade-in-up">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input with Floating Label */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors duration-200">
                  <FiUser className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  onBlur={() => handleBlur('username')}
                  className={`peer w-full pl-11 pr-10 pt-6 pb-2 border rounded-xl bg-slate-50/30 dark:bg-slate-950/20 text-slate-900 dark:text-slate-100 placeholder-transparent outline-none transition-all duration-200 text-sm
                    ${touched.username && !isUsernameValid && formData.username.length > 0 
                      ? 'border-rose-400 dark:border-rose-900/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                      : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                  placeholder="Username"
                  required
                />
                <label 
                  htmlFor="username"
                  className="absolute left-11 top-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-all duration-200
                    peer-placeholder-shown:text-sm peer-placeholder-shown:top-[18px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal
                    peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-indigo-500 dark:peer-focus:text-indigo-400"
                >
                  Username
                </label>
                {touched.username && isUsernameValid && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-fade-left">
                    <FiCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Password Input with Floating Label */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors duration-200">
                  <FiLock className="w-4.5 h-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onBlur={() => handleBlur('password')}
                  className={`peer w-full pl-11 pr-12 pt-6 pb-2 border rounded-xl bg-slate-50/30 dark:bg-slate-950/20 text-slate-900 dark:text-slate-100 placeholder-transparent outline-none transition-all duration-200 text-sm
                    ${touched.password && !isPasswordValid && formData.password.length > 0
                      ? 'border-rose-400 dark:border-rose-900/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                      : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                  placeholder="Password"
                  required
                />
                <label 
                  htmlFor="password"
                  className="absolute left-11 top-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-all duration-200
                    peer-placeholder-shown:text-sm peer-placeholder-shown:top-[18px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal
                    peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-indigo-500 dark:peer-focus:text-indigo-400"
                >
                  Password
                </label>
                
                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none p-1 cursor-pointer rounded"
                  tabIndex="-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>

              {/* Form Options (Remember Me & Forgot Password) */}
              <div className="flex items-center justify-between text-sm py-1">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 dark:bg-slate-950 transition duration-150 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <a 
                  href="#" 
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>

              {/* Bold Gradient CTA Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden py-3.5 px-5 text-white font-medium bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] transition-all rounded-xl shadow-lg shadow-indigo-600/10 dark:shadow-indigo-600/5 focus:ring-2 focus:ring-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
              >
                {/* Loader State */}
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign in to Account</span>
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* Navigation Redirect Link */}
            <div className="text-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-sm text-slate-500 dark:text-slate-400">
              New to TaskFlow?{' '}
              <Link 
                to="/signup" 
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
              >
                Create a free account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}