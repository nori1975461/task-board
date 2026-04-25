import { useState } from 'react'

interface Props {
  onAdd: (text: string) => void
}

export default function TaskInput({ onAdd }: Props) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
  }

  return (
    <form className="task-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="タスクを入力..."
      />
      <button type="submit">追加</button>
    </form>
  )
}
