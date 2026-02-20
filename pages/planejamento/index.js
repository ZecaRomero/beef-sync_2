import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function PlanningIndex() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página de agenda por padrão
    router.replace('/planejamento/agenda')
  }, [router])

  return null
}
