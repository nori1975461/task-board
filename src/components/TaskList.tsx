import type { Task } from '../types'
import TaskItem from './TaskItem'

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
  onUpdate: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
  onDelete: (id: string) => void
}

export default function TaskList({ tasks, onToggle, onUpdate, onDelete }: Props) {
  if (tasks.length === 0) {
    return <p className="empty">タスクはまだありません</p>
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
