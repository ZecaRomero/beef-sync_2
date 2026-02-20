import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ManejoMovimentacaoRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/movimentacao/historico')
  }, [])

  return null
}

