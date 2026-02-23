/**
 * Mostra o IP local para acesso na rede (celular, tablet, etc.)
 * Execute: node scripts/mostrar-ip.js
 */
const os = require('os')
const nets = os.networkInterfaces()
let found = false
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.')) {
      console.log('')
      console.log('  Acesse no celular (mesma Wi-Fi):')
      console.log(`  http://${net.address}:3020/a`)
      console.log('')
      found = true
      break
    }
  }
  if (found) break
}
if (!found) {
  console.log('  IP local não encontrado. Use "ipconfig" para verificar.')
}
