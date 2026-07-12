import { useEffect, useMemo, useState } from 'react'
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'
import FilterTabs from './components/FilterTabs'
import { loadTasks, saveTasks } from './storage'
import type { Filter, Priority, Task } from './types'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = (title: string, dueDate: string | null, priority: Priority) => {
    setTasks(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate,
        priority,
      },
    ])
  }

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  const updateTask = (id: string, patch: Partial<Omit<Task, 'id'>>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const clearCompleted = () => {
    const count = tasks.filter(t => t.completed).length
    if (count === 0) return
    if (!confirm(`完了済みのタスク ${count} 件を削除しますか？`)) return
    setTasks(prev => prev.filter(t => !t.completed))
  }

  const filtered = useMemo(() => {
    if (filter === 'active') return tasks.filter(t => !t.completed)
    if (filter === 'completed') return tasks.filter(t => t.completed)
    return tasks
  }, [tasks, filter])

  const remaining = tasks.filter(t => !t.completed).length
  const completedCount = tasks.length - remaining

  return (
    <div className="container">
      <h1>タスクボード</h1>
      <TaskInput onAdd={addTask} />
      <div className="toolbar">
        <FilterTabs filter={filter} onChange={setFilter} />
        <span className="remaining">残り {remaining} 件</span>
      </div>
      <TaskList
        tasks={filtered}
        onToggle={toggleTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
      {completedCount > 0 && (
        <button className="clear-completed" onClick={clearCompleted}>
          完了済みを削除（{completedCount}）
        </button>
      )}
    </div>
  )
}
