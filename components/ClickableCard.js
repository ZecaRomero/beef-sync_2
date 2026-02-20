import { useRouter } from 'next/router'

export default function ClickableCard({
  children,
  className = '',
  href,
  onClick,
  title = ''
}) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    if (href) {
      router.push(href)
    }
  }

  const isInteractive = Boolean(onClick || href)

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={title || undefined}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } } : undefined}
      className={`transition-shadow ${isInteractive ? 'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : ''} ${className}`}
    >
      {children}
    </div>
  )
}


