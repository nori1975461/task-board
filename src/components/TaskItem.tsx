import type { Task } from '../types'

interface Props {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <li className={`task-item${task.completed ? ' completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <span className="task-text">{task.text}</span>
      <button className="delete-btn" onClick={() => onDelete(task.id)}>
        削除
      </button>
    </li>
  )
}
