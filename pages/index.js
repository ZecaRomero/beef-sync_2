
import React, { useEffect } from 'react'

import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const isMobileUA = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isSmallScreen = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches
    const isMobile = isMobileUA || isSmallScreen
    router.replace(isMobile ? '/a' : '/dashboard')
  }, [router])

    return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecionando...</p>
      </div>
      </div>
  )
}
