/**
 * Utility function to merge class names
 * Similar to clsx but simpler
 */
export function cn(...classes) {
  return classes
    .filter(Boolean)
    .map(cls => {
      if (typeof cls === 'string') return cls
      if (Array.isArray(cls)) return cn(...cls)
      if (typeof cls === 'object') {
        return Object.entries(cls)
          .filter(([_, condition]) => Boolean(condition))
          .map(([className]) => className)
          .join(' ')
      }
      return ''
    })
    .filter(Boolean)
    .join(' ')
}

export default cn
