import { cn } from '../../utils/cn'

export function Table({ className, children, ...props }) {
  return (
    <div className="table-container">
      <table className={cn('table', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead className={cn('table-header', className)} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn('table-body', className)} {...props}>
      {children}
    </tbody>
  )
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr className={cn(className)} {...props}>
      {children}
    </tr>
  )
}

export function TableHeaderCell({ className, children, ...props }) {
  return (
    <th className={cn('table-header-cell', className)} {...props}>
      {children}
    </th>
  )
}

export function TableCell({ className, children, ...props }) {
  return (
    <td className={cn('table-cell', className)} {...props}>
      {children}
    </td>
  )
}