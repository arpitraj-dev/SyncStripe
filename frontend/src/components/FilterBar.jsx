import React from 'react'
import { FiSliders, FiXCircle } from 'react-icons/fi'

export default function FilterBar({ filters, setFilters }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Icon indicator */}
      <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-400 dark:text-slate-500 hidden xs:inline-flex">
        <FiSliders className="w-3.5 h-3.5" />
      </span>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        className="px-3.5 py-2.5 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 cursor-pointer transition-all duration-200 outline-none w-full sm:w-auto"
      >
        <option value="">All Statuses</option>
        <option value="TO_DO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      {/* Priority Filter */}
      <select
        value={filters.priority}
        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        className="px-3.5 py-2.5 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 cursor-pointer transition-all duration-200 outline-none w-full sm:w-auto"
      >
        <option value="">All Priorities</option>
        <option value="LOW">Low Priority</option>
        <option value="MEDIUM">Medium Priority</option>
        <option value="HIGH">High Priority</option>
      </select>

      {/* Clear Filters Button */}
      {(filters.status || filters.priority) && (
        <button
          onClick={() => setFilters({ status: '', priority: '' })}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 font-semibold text-xs rounded-xl bg-white dark:bg-slate-900 transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
        >
          <FiXCircle className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  )
}