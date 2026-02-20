import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Piquetes() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/movimentacao/piquetes')
  }, [router])

  return null
}
