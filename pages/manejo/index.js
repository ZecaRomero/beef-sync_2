import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ManejoIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/manejo/pesagem')
  }, [])

  return null
}
