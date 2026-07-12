import { useState } from 'react'
import type { Priority } from '../types'

interface Props {
  onAdd: (title: string, dueDate: string | null, priority: Priority) => void
}

export default function TaskInput({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, dueDate || null, priority)
    setTitle('')
    setDueDate('')
    setPriority('normal')
  }

  return (
    <form className="task-input" onSubmit={handleSubmit}>
      <input
        type="text"
        className="title-input"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="タスクを入力..."
      />
      <div className="task-input-options">
        <input
          type="date"
          className="date-input"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          aria-label="期限"
        />
        <select
          className="priority-select"
          value={priority}
          onChange={e => setPriority(e.target.value as Priority)}
          aria-label="優先度"
        >
          <option value="high">優先度: 高</option>
          <option value="normal">優先度: 普通</option>
          <option value="low">優先度: 低</option>
        </select>
        <button type="submit">追加</button>
      </div>
    </form>
  )
}
