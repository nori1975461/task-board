import { useEffect, useRef, useState } from 'react'
import type { Priority, Task } from '../types'

interface Props {
  task: Task
  onToggle: (id: string) => void
  onUpdate: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
  onDelete: (id: string) => void
}

const PRIORITY_LABEL: Record<Priority, string> = {
  high: '高',
  normal: '普通',
  low: '低',
}

function todayStr(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// 'YYYY-MM-DD' は辞書順比較で日付順と一致する。
function dueInfo(dueDate: string | null, completed: boolean) {
  if (!dueDate) return null
  const today = todayStr()
  if (dueDate === today) return { className: 'due due-today', label: '今日' }
  if (dueDate < today && !completed) return { className: 'due due-overdue', label: dueDate }
  return { className: 'due', label: dueDate }
}

export default function TaskItem({ task, onToggle, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title)
  const [draftDue, setDraftDue] = useState(task.dueDate ?? '')
  const [draftPriority, setDraftPriority] = useState<Priority>(task.priority)
  const inputRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const startEdit = () => {
    setDraftTitle(task.title)
    setDraftDue(task.dueDate ?? '')
    setDraftPriority(task.priority)
    doneRef.current = false
    setEditing(true)
  }

  // save=true でも空タイトルは取消扱い（＝変更を捨てる）。
  // Enter/Esc/blur が二重発火しても doneRef で先着のみ有効化する。
  const finish = (save: boolean) => {
    if (doneRef.current) return
    doneRef.current = true
    if (save) {
      const trimmed = draftTitle.trim()
      if (trimmed) {
        onUpdate(task.id, {
          title: trimmed,
          dueDate: draftDue || null,
          priority: draftPriority,
        })
      }
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      finish(true)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      finish(false)
    }
  }

  // 編集エリア内での移動（title→期限→優先度）では確定しない。
  // フォーカスがエリア外へ抜けたときだけ確定する。
  const handleBlur = (e: React.FocusEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    finish(true)
  }

  const handleDelete = () => {
    if (confirm(`「${task.title}」を削除しますか？`)) {
      onDelete(task.id)
    }
  }

  if (editing) {
    return (
      <li className={`task-item priority-${task.priority} editing`}>
        <div className="edit-fields" onBlur={handleBlur} onKeyDown={handleKeyDown}>
          <input
            ref={inputRef}
            type="text"
            className="edit-title"
            value={draftTitle}
            onChange={e => setDraftTitle(e.target.value)}
            aria-label="タイトル"
          />
          <div className="edit-options">
            <input
              type="date"
              className="edit-date"
              value={draftDue}
              onChange={e => setDraftDue(e.target.value)}
              aria-label="期限"
            />
            <select
              className="edit-priority"
              value={draftPriority}
              onChange={e => setDraftPriority(e.target.value as Priority)}
              aria-label="優先度"
            >
              <option value="high">高</option>
              <option value="normal">普通</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
      </li>
    )
  }

  const info = dueInfo(task.dueDate, task.completed)

  return (
    <li className={`task-item priority-${task.priority}${task.completed ? ' completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label="完了"
      />
      <div className="task-main">
        <span className="task-text">{task.title}</span>
        <div className="task-meta">
          <span className={`priority-badge priority-${task.priority}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {info && <span className={info.className}>{info.label}</span>}
        </div>
      </div>
      <button className="edit-btn" onClick={startEdit} aria-label="編集">
        ✎
      </button>
      <button className="delete-btn" onClick={handleDelete}>
        削除
      </button>
    </li>
  )
}
