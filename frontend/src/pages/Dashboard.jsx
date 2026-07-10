import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import TaskList from '../components/TaskList'
import TaskForm from '../components/TaskForm'
import FilterBar from '../components/FilterBar'
import { 
  FiLogOut, 
  FiMoon, 
  FiSun, 
  FiPlus, 
  FiX, 
  FiSearch, 
  FiBell, 
  FiChevronLeft, 
  FiChevronRight, 
  FiLayout, 
  FiCheckSquare, 
  FiActivity, 
  FiSettings, 
  FiGrid, 
  FiArrowRight, 
  FiTrendingUp,
  FiPieChart,
  FiShield,
  FiUser,
  FiLock,
  FiDatabase,
  FiZap
} from 'react-icons/fi'
import { useDarkMode } from '../context/DarkModeContext'

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filters, setFilters] = useState({ status: '', priority: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard') // Tab state: 'dashboard', 'tasks', 'analytics', 'settings'
  const [notifications, setNotifications] = useState([
    { id: 1, text: "System migration completed successfully.", time: "10m ago", read: false },
    { id: 2, text: "AI agent suggested a description for your task.", time: "1h ago", read: false },
    { id: 3, text: "Welcome to the new TaskFlow Workspace!", time: "1d ago", read: true }
  ])

  const notificationRef = useRef(null)
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const userId = user?.id || 1

  useEffect(() => {
    fetchTasks()
  }, [filters, searchQuery])

  // Close notifications dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchTasks = async () => {
    try {
      let url = '/api/tasks?'
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`
      if (filters.status) url += `status=${filters.status}&`
      if (filters.priority) url += `priority=${filters.priority}`

      const response = await fetch(url, {
        headers: { 'X-User-Id': userId }
      })
      const data = await response.json()
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleCreateTask = async (task) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify(task)
      })
      const newTask = await response.json()
      setTasks([newTask, ...tasks])
      setShowForm(false)
      
      setNotifications(prev => [
        { id: Date.now(), text: `Task "${task.title}" created successfully.`, time: "Just now", read: false },
        ...prev
      ])
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleUpdateTask = async (task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify(task)
      })
      const updatedTask = await response.json()
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
      setEditingTask(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleUpdateTaskDirect = async (task) => {
    // 1. Optimistic Update: Change frontend state immediately so cards don't snap back!
    const originalTasks = [...tasks]
    setTasks(tasks.map(t => t.id === task.id ? task : t))

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify(task)
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const updatedTask = await response.json()
      // Update with exact values from server
      setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t))
    } catch (error) {
      console.error('Error updating task directly:', error)
      // Rollback frontend state if API call fails
      setTasks(originalTasks)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': userId }
      })
      const deletedTask = tasks.find(t => t.id === taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
      
      if (deletedTask) {
        setNotifications(prev => [
          { id: Date.now(), text: `Task "${deletedTask.title}" was deleted.`, time: "Just now", read: false },
          ...prev
        ])
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleLogoutClick = () => {
    onLogout()
    navigate('/login')
  }

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length

  // Fetch tasks filtered by search query directly from backend
  const filteredTasks = tasks

  // Calculations for KPIs
  const totalTasks = tasks.length
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const completedTasks = tasks.filter(t => t.status === 'DONE').length
  const highPriorityTasks = tasks.filter(t => t.priority === 'HIGH').length
  
  // Rate calculation
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Animated subtle background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/2 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-500/5 dark:bg-purple-500/2 blur-[100px] pointer-events-none" />

      {/* SIDEBAR: Collapsible Navigation */}
      <aside 
        className={`hidden md:flex flex-col justify-between border-r border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 relative
          ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Sidebar Header & Brand Logo */}
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-200/60 dark:border-slate-800/80 justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/10">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {!sidebarCollapsed && (
                <span className="font-semibold text-base text-slate-800 dark:text-slate-200 tracking-tight transition-opacity duration-200">
                  TaskFlow
                </span>
              )}
            </div>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <FiChevronRight className="w-4.5 h-4.5" /> : <FiChevronLeft className="w-4.5 h-4.5" />}
            </button>
          </div>

          {/* Navigation Links with Tabs Logic */}
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group cursor-pointer
                ${activeTab === 'dashboard' 
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'}`}
            >
              <FiLayout className="w-4.5 h-4.5 shrink-0" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </button>

            <button 
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group cursor-pointer
                ${activeTab === 'tasks' 
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'}`}
            >
              <FiCheckSquare className="w-4.5 h-4.5 shrink-0 group-hover:text-indigo-500 transition-colors" />
              {!sidebarCollapsed && <span>My Tasks</span>}
              {!sidebarCollapsed && tasks.length > 0 && (
                <span className="ml-auto bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">
                  {tasks.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group cursor-pointer
                ${activeTab === 'analytics' 
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'}`}
            >
              <FiActivity className="w-4.5 h-4.5 shrink-0 group-hover:text-purple-500 transition-colors" />
              {!sidebarCollapsed && <span>Analytics</span>}
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group cursor-pointer
                ${activeTab === 'settings' 
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'}`}
            >
              <FiSettings className="w-4.5 h-4.5 shrink-0 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              {!sidebarCollapsed && <span>Settings</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center font-semibold text-xs text-slate-700 dark:text-slate-300 shrink-0">
              {user?.username?.substring(0, 2).toUpperCase() || "US"}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                  {user?.username || "Workspace User"}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-none">
                  Free tier Account
                </p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button 
                onClick={handleLogoutClick}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer animate-fade-left"
                title="Log out"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto z-10">
        
        {/* TOP NAVIGATION HEADER */}
        <header className="h-16 border-b border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          {/* Header Left: Search Bar */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200"
            />
          </div>

          {/* Mobile brand header representation */}
          <div className="flex sm:hidden items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              TaskFlow
            </span>
          </div>

          {/* Mobile Navigation Pills */}
          <div className="flex md:hidden items-center gap-1">
            {[
              { id: 'dashboard', icon: <FiLayout className="w-4 h-4" /> },
              { id: 'tasks', icon: <FiCheckSquare className="w-4 h-4" /> },
              { id: 'analytics', icon: <FiActivity className="w-4 h-4" /> },
              { id: 'settings', icon: <FiSettings className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-2 rounded-xl transition-all ${activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600' : 'text-slate-400'}`}
              >
                {tab.icon}
              </button>
            ))}
          </div>

          {/* Header Right: Actions Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add Task Button for Top Bar */}
            <button
              onClick={() => setShowForm(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>

            {/* Dark Mode toggle button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 cursor-pointer active:scale-95"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FiSun className="w-4.5 h-4.5 text-yellow-500" /> : <FiMoon className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 relative cursor-pointer active:scale-95"
                aria-label="Notifications"
              >
                <FiBell className="w-4.5 h-4.5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse" />
                )}
              </button>

              {/* Notification Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 shadow-2xl dark:shadow-black/40 z-50 p-4 animate-slide-up">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Notifications ({unreadNotificationsCount})
                    </span>
                    {unreadNotificationsCount > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-2.5 rounded-xl text-xs transition-colors ${notif.read ? 'bg-slate-50/50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400' : 'bg-indigo-50/40 dark:bg-indigo-950/10 text-slate-800 dark:text-slate-200 border-l-2 border-indigo-500'}`}
                      >
                        <p className="leading-normal font-medium">{notif.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-normal">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Logout (Alternative menu button) */}
            <button 
              onClick={handleLogoutClick}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
              title="Logout"
            >
              <FiLogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* TAB 1: MAIN DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-slide-up">
              {/* HERO GREETING BANNER */}
              <section className="relative overflow-hidden bg-slate-900 dark:bg-[#090D1A] rounded-2xl p-6 md:p-8 text-white border border-slate-850 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                <div className="absolute top-0 right-0 w-[400px] h-[100%] bg-gradient-to-br from-indigo-500/15 via-purple-600/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-[20%] w-[300px] h-[50%] bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider mb-4">
                    Workspace Health Status: Active
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Good afternoon, {user?.username || 'Workspace User'}! 👋
                  </h2>
                  <p className="text-slate-400 text-sm md:text-base mt-2 leading-relaxed">
                    Welcome back to your workspace. You have completed <strong className="text-white">{completedTasks}</strong> tasks so far. Here's a brief look at your sprints and priority metrics.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-md shadow-indigo-600/10"
                    >
                      Create New Task
                    </button>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
                    >
                      View Workspace Board
                    </button>
                  </div>
                </div>
              </section>

              {/* KPI CARDS GRID */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* CARD 1: Total Tasks */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500 opacity-80" />
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                      Total Tasks
                    </span>
                    <span className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-800/30">
                      <FiCheckSquare className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                      {totalTasks}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1.5 flex items-center gap-1">
                      <FiTrendingUp className="text-emerald-500 w-3.5 h-3.5" />
                      <span>Tasks currently in database</span>
                    </p>
                  </div>
                </div>

                {/* CARD 2: In Progress */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500 opacity-80" />
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                      In Progress
                    </span>
                    <span className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-blue-400 border border-slate-100 dark:border-slate-800/30">
                      <FiActivity className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                      {inProgressTasks}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1.5 flex items-center gap-1">
                      <span>Current sprint active tasks</span>
                    </p>
                  </div>
                </div>

                {/* CARD 3: Completed */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-teal-500 opacity-80" />
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                      Completed
                    </span>
                    <span className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-teal-400 border border-slate-100 dark:border-slate-800/30">
                      <FiGrid className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                      {completedTasks}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      <span>Completion Rate: {completionRate}%</span>
                    </p>
                  </div>
                </div>

                {/* CARD 4: High Priority */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500 opacity-80" />
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                      High Priority
                    </span>
                    <span className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-rose-400 border border-slate-100 dark:border-slate-800/30">
                      <FiShield className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                      {highPriorityTasks}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1.5 flex items-center gap-1">
                      <span>Urgent follow-ups required</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* TWO COLUMN ANALYTICS & WIDGETS SECTION */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Widget 1: Completion Circular Gauge Chart */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FiPieChart className="text-indigo-500" />
                      <span>Sprint Progress Chart</span>
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Ratio of completed tasks in current workspace.</p>
                  </div>

                  <div className="my-6 flex justify-center relative">
                    <svg className="w-36 h-36" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#indigoGrad)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * completionRate) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out -rotate-90 origin-center" />
                      <defs>
                        <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <span className="text-2xl font-black text-slate-800 dark:text-white">{completionRate}%</span>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Done</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 block">Pending</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-330">{totalTasks - completedTasks}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 block">Completed</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-330">{completedTasks}</span>
                    </div>
                  </div>
                </div>

                {/* Widget 2: Priority Distribution Progression */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FiLayout className="text-purple-500" />
                      <span>Priority Density</span>
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Workload volume distributed across priority tags.</p>
                  </div>

                  <div className="space-y-4 my-6">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                        <span>High Priority</span>
                        <span>{tasks.filter(t => t.priority === 'HIGH').length} tasks</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${totalTasks > 0 ? (tasks.filter(t => t.priority === 'HIGH').length / totalTasks) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                        <span>Medium Priority</span>
                        <span>{tasks.filter(t => t.priority === 'MEDIUM').length} tasks</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${totalTasks > 0 ? (tasks.filter(t => t.priority === 'MEDIUM').length / totalTasks) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                        <span>Low Priority</span>
                        <span>{tasks.filter(t => t.priority === 'LOW').length} tasks</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${totalTasks > 0 ? (tasks.filter(t => t.priority === 'LOW').length / totalTasks) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-normal pt-2">
                    Keep high priority tickets under control to maintain sprint velocity.
                  </div>
                </div>

                {/* Widget 3: Live Quick Activity Timeline */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FiActivity className="text-teal-500" />
                      <span>Workspace Activity</span>
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Real-time status changes and additions.</p>
                  </div>

                  <div className="my-5 space-y-3.5 flex-1 overflow-y-auto max-h-[160px] pr-1">
                    {tasks.slice(0, 3).length > 0 ? (
                      tasks.slice(0, 3).map((task, idx) => (
                        <div key={task.id || idx} className="flex gap-3 text-xs leading-normal">
                          <div className="flex flex-col items-center">
                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${task.status === 'DONE' ? 'bg-teal-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                            {idx < 2 && <span className="w-[1px] bg-slate-200 dark:bg-slate-850 grow mt-1 mb-0.5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
                            <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">Status: {task.status.replace('_', ' ')} • Priority: {task.priority}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                        No active tasks currently to show timeline activity.
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    <button 
                      onClick={() => setActiveTab('tasks')}
                      className="font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <span>Go to Project Board</span>
                      <FiArrowRight />
                    </button>
                  </div>
                </div>
              </section>

              {/* TASKS BOARD PREVIEW IN MAIN DASHBOARD */}
              <section id="workspace-board" className="space-y-6 pt-2">
                <div className="flex justify-between items-center pb-5 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-850 dark:text-white tracking-tight">
                      Workspace Board
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                      Drag and drop task cards to reassign status states or filter priorities below.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <FilterBar filters={filters} setFilters={setFilters} />
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Create Task</span>
                    </button>
                  </div>
                </div>

                <div className="min-h-[300px]">
                  <TaskList
                    tasks={filteredTasks}
                    onEdit={(task) => {
                      setEditingTask(task)
                      setShowForm(true)
                    }}
                    onUpdateTask={handleUpdateTaskDirect}
                    onDelete={handleDeleteTask}
                    onReorder={fetchTasks}
                    userId={userId}
                  />
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: MY TASKS (DEDICATED KANBAN SPRINT VIEW) */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-850 dark:text-white tracking-tight">
                    Workspace Sprints
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Manage active user stories, drag tasks to change lifecycle states, or apply search filters.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <FilterBar filters={filters} setFilters={setFilters} />
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/10 transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95 w-full sm:w-auto justify-center"
                  >
                    <FiPlus className="w-4.5 h-4.5" />
                    <span>Create Task</span>
                  </button>
                </div>
              </div>

              <div className="min-h-[400px]">
                <TaskList
                  tasks={filteredTasks}
                  onEdit={(task) => {
                    setEditingTask(task)
                    setShowForm(true)
                  }}
                  onUpdateTask={handleUpdateTaskDirect}
                  onDelete={handleDeleteTask}
                  onReorder={fetchTasks}
                  userId={userId}
                />
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS (EXPANDED CHARTS) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-slide-up">
              <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
                <h3 className="text-2xl font-extrabold text-slate-850 dark:text-white tracking-tight">
                  Workspace Analytics
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Evaluate team bandwidth, complete sprints velocity, and highlight priority densities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Analytics card 1: circular completion ring */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FiPieChart className="text-indigo-500" />
                      <span>Sprint Progress Chart</span>
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Task fulfillment ratio.</p>
                  </div>
                  <div className="my-8 flex justify-center relative">
                    <svg className="w-36 h-36" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#indigoGradAnalytic)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * completionRate) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out -rotate-90 origin-center" />
                      <defs>
                        <linearGradient id="indigoGradAnalytic" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <span className="text-2xl font-black text-slate-800 dark:text-white">{completionRate}%</span>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Done</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-between text-xs font-semibold text-slate-500">
                    <span>Completed: {completedTasks} tasks</span>
                    <span>Total Tasks: {totalTasks}</span>
                  </div>
                </div>

                {/* Analytics card 2: priority bars */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FiLayout className="text-purple-500" />
                      <span>Priority Density</span>
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Workspace priority counts.</p>
                  </div>
                  <div className="space-y-4 my-8">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-350">
                        <span>High Priority</span>
                        <span>{tasks.filter(t => t.priority === 'HIGH').length} tasks</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${totalTasks > 0 ? (tasks.filter(t => t.priority === 'HIGH').length / totalTasks) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-350">
                        <span>Medium Priority</span>
                        <span>{tasks.filter(t => t.priority === 'MEDIUM').length} tasks</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalTasks > 0 ? (tasks.filter(t => t.priority === 'MEDIUM').length / totalTasks) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-350">
                        <span>Low Priority</span>
                        <span>{tasks.filter(t => t.priority === 'LOW').length} tasks</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalTasks > 0 ? (tasks.filter(t => t.priority === 'LOW').length / totalTasks) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-normal pt-2">
                    Priority metrics calculated in real-time.
                  </div>
                </div>

                {/* Analytics card 3: velocity metrics mockup */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FiActivity className="text-teal-500" />
                      <span>Workspace Velocity</span>
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Efficiency indicators.</p>
                  </div>
                  <div className="my-6 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-850">
                      <span className="text-xs text-slate-500">Average resolution velocity</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">4.2 hrs</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-850">
                      <span className="text-xs text-slate-500">Overdue rate</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">2.5%</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs text-slate-500">Workspace database size</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">124 KB</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-indigo-500 font-semibold bg-indigo-50/50 dark:bg-indigo-950/20 text-center py-2 rounded-xl border border-indigo-100/30">
                    Velocity fits target sprint standards.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS PANEL */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-slide-up">
              <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
                <h3 className="text-2xl font-extrabold text-slate-850 dark:text-white tracking-tight">
                  Account Settings
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Manage personal dashboard preferences, generate keys, or inspect team configs.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left card: profile */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <FiUser className="text-indigo-500" />
                      <span>User Profile Details</span>
                    </h4>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Username</label>
                        <input 
                          type="text" 
                          value={user?.username || ''} 
                          disabled 
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 text-sm outline-none cursor-not-allowed" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Workspace Plan</label>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                          Workspace Free Tier
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right card: theme selection & workspace preferences */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-fit space-y-6">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FiZap className="text-amber-500" />
                      <span>Workspace Preferences</span>
                    </h4>
                    
                    {/* Theme Selector */}
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                        Appearance Mode
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button" 
                          onClick={() => isDarkMode && toggleDarkMode()}
                          className={`px-3 py-2.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]
                            ${!isDarkMode 
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-650 dark:text-indigo-400 ring-4 ring-indigo-500/5' 
                              : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                        >
                          <FiSun className="w-4 h-4" />
                          <span>Light</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => !isDarkMode && toggleDarkMode()}
                          className={`px-3 py-2.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]
                            ${isDarkMode 
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-650 dark:text-indigo-400 ring-4 ring-indigo-500/5' 
                              : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'}`}
                        >
                          <FiMoon className="w-4 h-4" />
                          <span>Dark</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Automatic Backups</span>
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase border border-emerald-100 dark:border-emerald-900/30">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="py-6 px-8 border-t border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/20 text-center text-xs text-slate-400 dark:text-slate-500 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
            <span>© 2026 TaskFlow Inc. Built for highly agile, modern teams.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">API Documentation</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Privacy & Terms</a>
            </div>
          </div>
        </footer>
      </div>

      {/* FORM DIALOG DIALOG OVERLAY */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in transition-all">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 animate-slide-up">
            
            {/* Modal Exit */}
            <button
              onClick={() => {
                setShowForm(false)
                setEditingTask(null)
              }}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
              aria-label="Close dialog"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Render Form */}
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setShowForm(false)
                setEditingTask(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}