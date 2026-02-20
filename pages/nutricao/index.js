import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function NutricaoIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/nutricao/dietas')
  }, [router])

  return null
}
