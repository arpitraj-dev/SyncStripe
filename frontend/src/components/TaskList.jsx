import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true))
    return () => {
      cancelAnimationFrame(animation)
      setEnabled(false)
    }
  }, [])
  if (!enabled) {
    return null
  }
  return <Droppable {...props}>{children}</Droppable>
}
import { 
  FiEdit2, 
  FiTrash2, 
  FiCalendar, 
  FiCircle, 
  FiActivity, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock, 
  FiFolderPlus 
} from 'react-icons/fi'

export default function TaskList({ tasks, onEdit, onUpdateTask, onDelete, onReorder, userId }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return

    const taskId = result.draggableId
    const targetStatus = getStatusFromColumn(result.destination.droppableId)
    const targetIndex = result.destination.index

    const task = tasks.find(t => t.id.toString() === taskId)
    if (!task) return

    // Get all other tasks in the target column, sorted by positionOrder
    const columnTasks = tasks
      .filter(t => t.status === targetStatus && t.id.toString() !== taskId)
      .sort((a, b) => (a.positionOrder || 0) - (b.positionOrder || 0))

    let newPositionOrder = 1000.0

    if (columnTasks.length === 0) {
      newPositionOrder = 1000.0
    } else if (targetIndex === 0) {
      newPositionOrder = (columnTasks[0].positionOrder || 0) / 2.0
    } else if (targetIndex >= columnTasks.length) {
      newPositionOrder = (columnTasks[columnTasks.length - 1].positionOrder || 0) + 1000.0
    } else {
      const prevOrder = columnTasks[targetIndex - 1].positionOrder || 0
      const nextOrder = columnTasks[targetIndex].positionOrder || 0
      newPositionOrder = (prevOrder + nextOrder) / 2.0
    }

    // Call update if status changed or position order changed
    if (task.status !== targetStatus || task.positionOrder !== newPositionOrder) {
      if (onUpdateTask) {
        onUpdateTask({ 
          ...task, 
          status: targetStatus, 
          positionOrder: newPositionOrder 
        })
      } else {
        onEdit({ 
          ...task, 
          status: targetStatus, 
          positionOrder: newPositionOrder 
        })
      }
    }
  }

  const getStatusFromColumn = (droppableId) => {
    switch (droppableId) {
      case 'todo': return 'TO_DO'
      case 'inprogress': return 'IN_PROGRESS'
      case 'done': return 'DONE'
      default: return 'TO_DO'
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH': 
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            HIGH
          </span>
        )
      case 'MEDIUM': 
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            MEDIUM
          </span>
        )
      case 'LOW': 
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            LOW
          </span>
        )
      default: 
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
            NONE
          </span>
        )
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DONE': return <FiCheckCircle className="text-teal-500 w-4.5 h-4.5" />
      case 'IN_PROGRESS': return <FiActivity className="text-blue-500 w-4.5 h-4.5 animate-pulse" />
      case 'TO_DO': return <FiCircle className="text-slate-400 dark:text-slate-500 w-4.5 h-4.5" />
      default: return <FiCircle className="text-slate-400 w-4.5 h-4.5" />
    }
  }

  const formatStatus = (status) => {
    return status.replace('_', ' ').toLowerCase().replace(/(^|\s)\S/g, t => t.toUpperCase())
  }

  const getColumnHeaderColor = (status) => {
    switch (status) {
      case 'TO_DO': return 'bg-slate-400 dark:bg-slate-500'
      case 'IN_PROGRESS': return 'bg-blue-500'
      case 'DONE': return 'bg-teal-500'
      default: return 'bg-slate-400'
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800 rounded-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-4">
          <FiFolderPlus className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">No tasks in this view</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-sm leading-relaxed">
          Create a new task to get started, or change your filter queries to query alternative statuses and priorities.
        </p>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['TO_DO', 'IN_PROGRESS', 'DONE'].map((status) => (
          <div 
            key={status} 
            className="flex flex-col bg-white/40 dark:bg-slate-900/30 border border-slate-200/55 dark:border-slate-800/40 p-4 rounded-2xl backdrop-blur-md"
          >
            {/* Column Header */}
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 capitalize px-1 pb-3 flex items-center justify-between border-b border-slate-200/45 dark:border-slate-850 mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getColumnHeaderColor(status)}`} />
                <span>{formatStatus(status)}</span>
              </div>
              <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-0.5 px-2 rounded-full">
                {tasks.filter(t => t.status === status).length}
              </span>
            </h3>

            {/* Droppable Board Column Container */}
            <StrictModeDroppable droppableId={status.toLowerCase().replace('_', '')}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-[280px] transition-all rounded-xl p-1 ${snapshot.isDraggingOver ? 'bg-indigo-50/15 dark:bg-indigo-950/5' : ''}`}
                >
                  {tasks
                    .filter(task => task.status === status)
                    .sort((a, b) => (a.positionOrder || 0) - (b.positionOrder || 0))
                    .map((task, index) => (
                      <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                        {(provided, snapshot) => {
                          const cardContent = (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                              className={`group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-4 transition-all duration-300 relative overflow-hidden select-none cursor-grab active:cursor-grabbing
                                ${snapshot.isDragging ? 'shadow-2xl border-indigo-500/50 dark:border-indigo-500/50 bg-slate-50 dark:bg-slate-850 rotate-1 z-[1000]' : 'hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700/80'}`}
                            >
                              {/* Decorative Top Accent Tag based on priority */}
                              {task.priority === 'HIGH' && (
                                <div className="absolute top-0 left-0 w-full h-[2.5px] bg-rose-500" />
                              )}
                              {task.priority === 'MEDIUM' && (
                                <div className="absolute top-0 left-0 w-full h-[2.5px] bg-amber-500" />
                              )}
                              {task.priority === 'LOW' && (
                                <div className="absolute top-0 left-0 w-full h-[2.5px] bg-emerald-500" />
                              )}

                              {/* Title & Action Buttons */}
                              <div className="flex justify-between items-start gap-2 mb-1.5">
                                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                  {task.title}
                                </h4>
                                
                                {/* Action Buttons: Fade-in on group hover */}
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                  <button
                                    onClick={() => onEdit(task)}
                                    className="p-1 rounded text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="Edit Task"
                                  >
                                    <FiEdit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onDelete(task.id)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="Delete Task"
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Description text */}
                              {task.description && (
                                <p className="text-xs text-slate-555 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                                  {task.description}
                                </p>
                              )}

                              {/* Card Footer badges */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-850 pt-3 mt-3">
                                {/* Priority Badge */}
                                <div className="flex items-center gap-1.5">
                                  {getPriorityBadge(task.priority)}
                                </div>

                                {/* Due Date Indicator */}
                                {task.dueDate ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/20 px-2 py-0.5 rounded-md">
                                    <FiCalendar className="w-3 h-3" />
                                    <span>{new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                                    <FiClock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                                    <span>No deadline</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );

                          if (snapshot.isDragging) {
                            return createPortal(cardContent, document.body);
                          }
                          return cardContent;
                        }}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}