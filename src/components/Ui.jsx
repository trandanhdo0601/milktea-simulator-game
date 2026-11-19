import { Link } from 'react-router-dom'
import Cup from './Cup.jsx'
import { IconAlert } from './Icons.jsx'

const BLANK = { teaType: null, milkType: null, sugarLevel: null, iceLevel: null, topping: null }

export function ErrorNote({ children, className = '' }) {
  return (
    <p className={`error ${className}`} role="alert">
      <IconAlert size={18} />
      <span>{children}</span>
    </p>
  )
}

export function PageHead({ title, children }) {
  return (
    <header className="page-head">
      <h2>{title}</h2>
      {children && <p className="muted">{children}</p>}
    </header>
  )
}

/** Trạng thái trống: ly rỗng + lời mời hành động. */
export function EmptyState({ title, children }) {
  return (
    <div className="panel empty">
      <Cup recipe={BLANK} size="sm" badge={false} />
      <div>
        <h2>{title}</h2>
        <p className="muted">{children}</p>
        <Link className="btn" to="/">Pha ly đầu tiên</Link>
      </div>
    </div>
  )
}
