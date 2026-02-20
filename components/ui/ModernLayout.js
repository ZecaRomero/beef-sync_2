const ModernLayout = ({ children, title, subtitle, icon, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-cyan-600/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        {(title || subtitle || icon) && (
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-2xl">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
            
            <div className="relative p-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center space-x-6">
                  {icon && (
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-3xl shadow-xl">
                      <div className="text-4xl">
                        {icon}
                      </div>
                    </div>
                  )}
                  <div>
                    {title && (
                      <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-blue-100 text-lg font-medium">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="relative">
          <div className="max-w-7xl mx-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernLayout