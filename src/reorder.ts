import type { Priority, Task } from './types'

// 配列の from 番目の要素を to 番目へ移動した新しい配列を返す（元配列は変更しない）。
// 範囲外の index は安全にクランプし、実質移動がなければ複製をそのまま返す。
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const len = arr.length
  const next = arr.slice()
  if (from < 0 || from >= len) return next
  const target = Math.max(0, Math.min(to, len - 1))
  if (from === target) return next
  const [moved] = next.splice(from, 1)
  next.splice(target, 0, moved)
  return next
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, normal: 1, low: 2 }

// 期限あり（昇順）→ 期限なし の順に並べ、同じ期限内は優先度（高→普通→低）で並べる。
// 'YYYY-MM-DD' は辞書順比較で日付順と一致する。sort は安定なので同点は元の順序を保つ。
export function sortByDueDate(tasks: Task[]): Task[] {
  return tasks.slice().sort((a, b) => {
    if (a.dueDate !== b.dueDate) {
      if (a.dueDate === null) return 1
      if (b.dueDate === null) return -1
      return a.dueDate < b.dueDate ? -1 : 1
    }
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  })
}
