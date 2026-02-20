import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Movimentacao() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/movimentacao/historico')
  }, [router])

  return null
}
