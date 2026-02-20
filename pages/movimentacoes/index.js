
import React, { useEffect } from 'react'

import { useRouter } from 'next/router'

export default function Movimentacoes() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirecionar para Notas Fiscais
    router.replace('/notas-fiscais')
  }, [router])

  return null
}