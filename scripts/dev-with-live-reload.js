/**
 * Inicia o Next.js dev junto com o watcher de live reload para mobile
 * Uso: node scripts/dev-with-live-reload.js
 * Ou: npm run dev:mobile
 */
const { spawn } = require('child_process')
const path = require('path')

const watcher = spawn('node', [path.join(__dirname, 'dev-live-reload-watcher.js')], {
  stdio: 'inherit',
  shell: true
})

const next = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
})

watcher.on('error', (err) => console.error('Watcher error:', err))
next.on('error', (err) => console.error('Next error:', err))

process.on('SIGINT', () => {
  watcher.kill()
  next.kill()
  process.exit()
})
