
import React, { useEffect } from 'react'

import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para o dashboard aprimorado
    router.replace('/dashboard')
  }, [router])

    return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecionando para o dashboard...</p>
      </div>
      </div>
  )
}
