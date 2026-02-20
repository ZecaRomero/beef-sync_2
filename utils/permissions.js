/**
 * Utilitário de permissões para validação no servidor
 */

/**
 * Verifica se o IP é de um desenvolvedor (localhost)
 * Também verifica o origin/referer para casos onde o IP pode não estar disponível
 */
function isDeveloper(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
             req.headers['x-real-ip'] || 
             req.connection?.remoteAddress ||
             req.socket?.remoteAddress ||
             req.ip
  
  const hostname = req.headers.host?.split(':')[0] || ''
  const origin = req.headers.origin || ''
  const referer = req.headers.referer || ''
  
  // Verificar hostname
  const isLocalhostHost = hostname === 'localhost' || hostname === '127.0.0.1'
  
  // Verificar IP
  const isLocalhostIP = ip === '127.0.0.1' || 
                        ip === '::1' ||
                        ip === '::ffff:127.0.0.1' ||
                        !ip || // Se não houver IP, assumir localhost
                        ip === 'undefined'
  
  // Verificar origin/referer
  const isLocalhostOrigin = origin.includes('localhost') || 
                            origin.includes('127.0.0.1') ||
                            referer.includes('localhost') ||
                            referer.includes('127.0.0.1')
  
  return isLocalhostHost || isLocalhostIP || isLocalhostOrigin
}

/**
 * Verifica se o IP é de um usuário da rede
 */
function isNetworkUser(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
             req.headers['x-real-ip'] || 
             req.connection?.remoteAddress ||
             req.socket?.remoteAddress ||
             req.ip
  
  const hostname = req.headers.host?.split(':')[0] || ''
  
  return (hostname.startsWith('192.168.') || 
          hostname.startsWith('10.') || 
          hostname.startsWith('172.')) &&
         !isDeveloper(req)
}

/**
 * Verifica permissão de exclusão
 */
function canDelete(req) {
  return isDeveloper(req)
}

/**
 * Verifica permissão de backup
 */
function canBackup(req) {
  return isDeveloper(req)
}

/**
 * Verifica permissão de restauração
 */
function canRestore(req) {
  return isDeveloper(req)
}

/**
 * Verifica permissão de importação
 */
function canImport(req) {
  return isDeveloper(req)
}

/**
 * Retorna objeto com todas as permissões
 */
function getPermissions(req) {
  const dev = isDeveloper(req)
  const network = isNetworkUser(req)
  
  return {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: dev,
    canBackup: dev,
    canRestore: dev,
    canImport: dev,
    canExport: true,
    isDeveloper: dev,
    isNetworkUser: network,
    userType: dev ? 'developer' : (network ? 'network' : 'external')
  }
}

/**
 * Middleware para verificar permissões
 */
function requirePermission(permissionCheck) {
  return (req, res, next) => {
    if (!permissionCheck(req)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Esta ação é permitida apenas para o desenvolvedor (acesso local).',
        permissionRequired: true
      })
    }
    next()
  }
}

// Exportar para CommonJS e ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isDeveloper,
    isNetworkUser,
    canDelete,
    canBackup,
    canRestore,
    canImport,
    getPermissions,
    requirePermission
  }
}

// Exportar para ES modules
export {
  isDeveloper,
  isNetworkUser,
  canDelete,
  canBackup,
  canRestore,
  canImport,
  getPermissions,
  requirePermission
}

