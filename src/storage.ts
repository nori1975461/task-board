import type { Priority, Task, Theme } from './types'

const KEY = 'task-board:v2'
const LEGACY_KEY = 'tasks'
const THEME_KEY = 'task-board:theme'

const THEMES: readonly Theme[] = ['auto', 'light', 'dark']

const PRIORITIES: readonly Priority[] = ['high', 'normal', 'low']

function isPriority(v: unknown): v is Priority {
  return typeof v === 'string' && (PRIORITIES as readonly string[]).includes(v)
}

function coerceId(v: unknown): string {
  return typeof v === 'string' && v.length > 0 ? v : crypto.randomUUID()
}

// v2要素の型検証。titleが無い/文字列でない要素だけは救えないので除外、
// それ以外の欠損・不正フィールドはデフォルトへ補正する。
function coerceV2Task(raw: unknown): Task | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>
  if (typeof o.title !== 'string') return null
  return {
    id: coerceId(o.id),
    title: o.title,
    completed: typeof o.completed === 'boolean' ? o.completed : false,
    createdAt: typeof o.createdAt === 'string' ? o.createdAt : new Date().toISOString(),
    dueDate: typeof o.dueDate === 'string' ? o.dueDate : null,
    priority: isPriority(o.priority) ? o.priority : 'normal',
  }
}

// 旧モデル {id, text, completed} を新モデルへ移行する。
function migrateLegacyTask(raw: unknown): Task | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>
  const text =
    typeof o.text === 'string' ? o.text : typeof o.title === 'string' ? o.title : null
  if (text === null) return null
  return {
    id: coerceId(o.id),
    title: text,
    completed: typeof o.completed === 'boolean' ? o.completed : false,
    createdAt: new Date().toISOString(),
    dueDate: null,
    priority: 'normal',
  }
}

// 純関数。localStorageの生文字列を受け取り、必ずTask[]を返す（例外を外へ投げない）。
export function parseTasks(rawV2: string | null, rawLegacy: string | null): Task[] {
  if (rawV2 !== null) {
    try {
      const parsed: unknown = JSON.parse(rawV2)
      if (Array.isArray(parsed)) {
        return parsed.map(coerceV2Task).filter((t): t is Task => t !== null)
      }
    } catch {
      // 壊れたJSONはフォールバック
    }
    return []
  }

  if (rawLegacy !== null) {
    try {
      const parsed: unknown = JSON.parse(rawLegacy)
      if (Array.isArray(parsed)) {
        return parsed.map(migrateLegacyTask).filter((t): t is Task => t !== null)
      }
    } catch {
      // 壊れたJSONはフォールバック
    }
    return []
  }

  return []
}

export function loadTasks(): Task[] {
  let rawV2: string | null = null
  let rawLegacy: string | null = null
  try {
    rawV2 = localStorage.getItem(KEY)
    rawLegacy = localStorage.getItem(LEGACY_KEY)
  } catch {
    return []
  }
  return parseTasks(rawV2, rawLegacy)
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('タスクの保存に失敗しました', e)
  }
}

// JSONインポート用。文字列を検証しTask[]を返す。JSONとして壊れている/配列でない
// 場合のみ null（＝読み込み不可）を返す。要素単位の不正は既存のcoerceで補正/除外する。
export function parseImportedTasks(raw: string): Task[] | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!Array.isArray(parsed)) return null
  return parsed.map(coerceV2Task).filter((t): t is Task => t !== null)
}

export function loadTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v !== null && (THEMES as readonly string[]).includes(v)) return v as Theme
  } catch {
    // 読めない場合は自動
  }
  return 'auto'
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch (e) {
    console.error('テーマの保存に失敗しました', e)
  }
}
