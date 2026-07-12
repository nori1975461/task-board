import { useEffect, useMemo, useRef, useState } from 'react'
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'
import FilterTabs from './components/FilterTabs'
import {
  loadTasks,
  saveTasks,
  loadTheme,
  saveTheme,
  parseImportedTasks,
} from './storage'
import { moveItem, sortByDueDate } from './reorder'
import type { Filter, Priority, Task, Theme } from './types'

const THEME_ORDER: Theme[] = ['auto', 'light', 'dark']
const THEME_META: Record<Theme, { icon: string; label: string }> = {
  auto: { icon: '🌗', label: '自動' },
  light: { icon: '☀️', label: 'ライト' },
  dark: { icon: '🌙', label: 'ダーク' },
}

function dateStamp(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}${m}${day}`
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    saveTheme(theme)
  }, [theme])

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

  const reorderTasks = (from: number, to: number) => {
    setTasks(prev => moveItem(prev, from, to))
  }

  const sortByDue = () => {
    setTasks(prev => sortByDueDate(prev))
  }

  const cycleTheme = () => {
    setTheme(prev => THEME_ORDER[(THEME_ORDER.indexOf(prev) + 1) % THEME_ORDER.length])
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `task-board-${dateStamp()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      const parsed = parseImportedTasks(text)
      if (parsed === null) {
        alert('読み込めませんでした')
        return
      }
      if (confirm(`現在の ${tasks.length} 件を、ファイルの ${parsed.length} 件で置き換えますか？`)) {
        setTasks(parsed)
      }
    }
    reader.onerror = () => alert('読み込めませんでした')
    reader.readAsText(file)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter(t => {
      if (filter === 'active' && t.completed) return false
      if (filter === 'completed' && !t.completed) return false
      if (q && !t.title.toLowerCase().includes(q)) return false
      return true
    })
  }, [tasks, filter, search])

  const remaining = tasks.filter(t => !t.completed).length
  const completedCount = tasks.length - remaining
  const reorderable = filter === 'all' && search.trim() === ''

  return (
    <div className="container">
      <header className="app-header">
        <h1>タスクボード</h1>
        <button
          className="theme-toggle"
          onClick={cycleTheme}
          title={`テーマ: ${THEME_META[theme].label}（クリックで切替）`}
          aria-label={`テーマを切り替え（現在: ${THEME_META[theme].label}）`}
        >
          <span className="theme-icon" aria-hidden="true">
            {THEME_META[theme].icon}
          </span>
          {THEME_META[theme].label}
        </button>
      </header>

      <TaskInput onAdd={addTask} />

      <div className="search-box">
        <input
          type="text"
          className="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="タスクを検索..."
          aria-label="タスクを検索"
        />
        {search && (
          <button
            className="search-clear"
            onClick={() => setSearch('')}
            aria-label="検索をクリア"
            title="検索をクリア"
          >
            ×
          </button>
        )}
      </div>

      <div className="toolbar">
        <FilterTabs filter={filter} onChange={setFilter} />
        <div className="toolbar-right">
          <button
            className="sort-due-btn"
            onClick={sortByDue}
            title="期限が近い順に並べ替えます（元に戻せません）"
          >
            期限順に整列
          </button>
          <span className="remaining">残り {remaining} 件</span>
        </div>
      </div>

      <TaskList
        tasks={filtered}
        reorderable={reorderable}
        onToggle={toggleTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onReorder={reorderTasks}
      />

      {completedCount > 0 && (
        <button className="clear-completed" onClick={clearCompleted}>
          完了済みを削除（{completedCount}）
        </button>
      )}

      <footer className="data-actions">
        <button className="data-btn" onClick={exportJSON}>
          エクスポート
        </button>
        <button className="data-btn" onClick={() => fileRef.current?.click()}>
          インポート
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={importJSON}
          hidden
        />
      </footer>
    </div>
  )
}
