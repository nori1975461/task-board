import type { Filter } from '../types'

interface Props {
  filter: Filter
  onChange: (f: Filter) => void
}

const TABS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'active', label: '未完了' },
  { value: 'completed', label: '完了' },
]

export default function FilterTabs({ filter, onChange }: Props) {
  return (
    <div className="filter-tabs" role="tablist">
      {TABS.map(tab => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={filter === tab.value}
          className={`filter-tab${filter === tab.value ? ' active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
