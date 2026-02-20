import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function MonitoringIndex() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página de performance por padrão
    router.replace('/monitoramento/performance')
  }, [router])

  return null
}
