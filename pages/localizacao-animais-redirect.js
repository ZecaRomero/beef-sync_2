import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function LocalizacaoAnimaisRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/movimentacao/localizacao')
  }, [])

  return null
}

