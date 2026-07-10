import React, { useState } from 'react'
import { FiSend, FiLoader, FiCheck, FiCalendar, FiCpu } from 'react-icons/fi'

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? task.dueDate.substring(0, 10) : '', // formatted for input type="date"
    priority: task?.priority || 'MEDIUM',
    status: task?.status || 'TO_DO'
  })
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [loadingAi, setLoadingAi] = useState(false)
  const [aiError, setAiError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      ...(task ? { id: task.id, userId: task.userId } : {}),
      dueDate: formData.dueDate ? formData.dueDate : null
    })
    setAiSuggestion(null)
  }

  const handleAiSuggest = async () => {
    if (!formData.title.trim()) return
    setLoadingAi(true)
    setAiError(null)
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title })
      })

      if (!response.ok) {
        let errMsg = 'Failed to get AI suggestion'
        try {
          const errData = await response.json()
          errMsg = errData.error || errMsg
        } catch (e) {}
        throw new Error(errMsg)
      }

      const suggestion = await response.json()
      setAiSuggestion(suggestion)
    } catch (error) {
      console.error('AI suggestion error:', error)
      setAiError(error.message || 'AI suggestion failed')
      setAiSuggestion({
        description: `Auto-generated description for: ${formData.title}`,
        priority: 'MEDIUM'
      })
    } finally {
      setLoadingAi(false)
    }
  }

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setFormData({
        ...formData,
        description: aiSuggestion.description,
        priority: aiSuggestion.priority
      })
      setAiSuggestion(null)
    }
  }

  return (
    <div>
      {/* Title Header */}
      <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
        <span className="w-1.5 h-6 rounded bg-indigo-500" />
        <span>{task ? 'Update Workspace Task' : 'Create Workspace Task'}</span>
      </h2>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title input field & AI button */}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Task Title *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200"
              placeholder="e.g. Implement layout design"
              required
            />
            
            {/* AI Suggest Button */}
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={loadingAi || !formData.title.trim()}
              className="px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-xl shadow-md text-xs font-semibold transition-all duration-200 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer select-none"
              title="AI Assist"
            >
              {loadingAi ? <FiLoader className="animate-spin" /> : <FiCpu />}
              <span>AI Assist</span>
            </button>
          </div>
        </div>

        {/* AI Suggestion Box */}
        {aiError && (
          <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-950/30 p-4 rounded-xl mb-4 leading-relaxed animate-slide-up">
            ⚠️ AI Suggestion failed: {aiError}
          </div>
        )}

        {aiSuggestion && (
          <div className="bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-950/20 dark:to-pink-950/5 p-4 rounded-xl border border-indigo-500/25 dark:border-indigo-500/15 relative overflow-hidden group animate-slide-up">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full blur-3xl opacity-20 -mr-8 -mt-8 pointer-events-none" />
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              ✨ AI Workspace Suggestion
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-355 mb-3 leading-relaxed">
              {aiSuggestion.description}
            </p>
            <div className="flex items-center justify-between gap-4 mt-4">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Suggested Priority: <span className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-2 py-0.5 rounded ml-1 text-indigo-600 dark:text-indigo-400">{aiSuggestion.priority}</span>
              </span>
              <button
                type="button"
                onClick={applyAiSuggestion}
                className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
              >
                Apply Suggestion
              </button>
            </div>
          </div>
        )}

        {/* Description textarea */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200 min-h-[100px] resize-none"
            placeholder="Add detailed task notes or outlines..."
            rows={4}
          />
        </div>

        {/* Due Date field */}
        <div>
          <label htmlFor="dueDate" className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Due Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200"
            />
          </div>
        </div>

        {/* Grid settings for Priority and Status with Premium Segmented Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Priority level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'LOW', label: 'Low', activeClass: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-800/60' },
                { value: 'MEDIUM', label: 'Medium', activeClass: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-250 dark:border-amber-800/60' },
                { value: 'HIGH', label: 'High', activeClass: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-250 dark:border-rose-800/60' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: opt.value })}
                  className={`px-3 py-2.5 text-xs font-semibold border rounded-xl transition-all duration-200 text-center cursor-pointer select-none active:scale-[0.97]
                    ${formData.priority === opt.value 
                      ? opt.activeClass + ' ring-4 ring-indigo-500/5' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Initial status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'TO_DO', label: 'To Do', activeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border-slate-300 dark:border-slate-700' },
                { value: 'IN_PROGRESS', label: 'In Progress', activeClass: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60' },
                { value: 'DONE', label: 'Done', activeClass: 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: opt.value })}
                  className={`px-3 py-2.5 text-xs font-semibold border rounded-xl transition-all duration-200 text-center cursor-pointer select-none active:scale-[0.97]
                    ${formData.status === opt.value 
                      ? opt.activeClass + ' ring-4 ring-indigo-500/5' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 pt-5 border-t border-slate-100 dark:border-slate-850 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-850 dark:hover:text-slate-200 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow shadow-indigo-600/10 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  )
}