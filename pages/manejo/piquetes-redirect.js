import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ManejoPiquetesRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/movimentacao/piquetes')
  }, [])

  return null
}

