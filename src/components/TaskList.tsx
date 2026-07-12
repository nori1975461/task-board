import { useState } from 'react'
import type { Task } from '../types'
import TaskItem from './TaskItem'

interface Props {
  tasks: Task[]
  reorderable: boolean
  onToggle: (id: string) => void
  onUpdate: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
  onDelete: (id: string) => void
  onReorder: (from: number, to: number) => void
}

export default function TaskList({
  tasks,
  reorderable,
  onToggle,
  onUpdate,
  onDelete,
  onReorder,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  if (tasks.length === 0) {
    return <p className="empty">タスクはまだありません</p>
  }

  const handleDrop = (to: number) => {
    if (dragIndex !== null && dragIndex !== to) onReorder(dragIndex, to)
    setDragIndex(null)
    setOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <ul className="task-list">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          total={tasks.length}
          reorderable={reorderable}
          dragging={dragIndex === index}
          dragOver={overIndex === index && dragIndex !== null && dragIndex !== index}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onMove={onReorder}
          onDragStart={setDragIndex}
          onDragOver={setOverIndex}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
      ))}
    </ul>
  )
}
