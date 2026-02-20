import Button from '../ui/Button'

/**
 * Componente para cards de relatórios
 */
const ReportCard = ({
  title,
  description,
  icon,
  iconColor,
  onDownload,
  onEmail,
  onWhatsApp,
  onSendToAccounting,
  loading = false,
  children
}) => {
  return (
    <div className={`
      bg-gradient-to-br ${iconColor} 
      border border-opacity-20 rounded-2xl p-6 
      hover:shadow-lg transition-all duration-300
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl text-white">
              {icon}
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
          {children}
        </div>
        <div className="flex flex-col gap-3 ml-4">
          {onSendToAccounting && (
            <Button
              variant="success"
              size="sm"
              onClick={onSendToAccounting}
              loading={loading}
              modern={true}
              glow={true}
            >
              Contabilidade
            </Button>
          )}
          {onEmail && (
            <Button
              variant="primary"
              size="sm"
              onClick={onEmail}
              loading={loading}
              modern={true}
            >
              Email
            </Button>
          )}
          {onWhatsApp && (
            <Button
              variant="success"
              size="sm"
              onClick={onWhatsApp}
              loading={loading}
              modern={true}
            >
              WhatsApp
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportCard