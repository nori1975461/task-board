export type Priority = 'high' | 'normal' | 'low'

export type Task = {
  id: string
  title: string
  completed: boolean
  createdAt: string
  dueDate: string | null
  priority: Priority
}

export type Filter = 'all' | 'active' | 'completed'

export type Theme = 'auto' | 'light' | 'dark'
