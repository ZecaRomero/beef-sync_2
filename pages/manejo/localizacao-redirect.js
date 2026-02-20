import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ManejoLocalizacaoRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/movimentacao/localizacao')
  }, [])

  return null
}

