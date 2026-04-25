import { useState } from 'react'
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'
import type { Task } from './types'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])

  const addTask = (text: string) => {
    setTasks(prev => [
      ...prev,
      { id: crypto.randomUUID(), text, completed: false },
    ])
  }

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="container">
      <h1>タスクボード</h1>
      <TaskInput onAdd={addTask} />
      <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
    </div>
  )
}
