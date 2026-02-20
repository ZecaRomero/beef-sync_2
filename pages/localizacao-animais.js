import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function LocalizacaoAnimais() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/movimentacao/localizacao')
  }, [router])

  return null
}
