import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Custom404() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar /A para /a
    if (router.asPath === '/A' || router.asPath === '/a') {
      router.replace('/a')
    }
  }, [router.asPath])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl">Página não encontrada</p>
        <p className="text-sm text-gray-500 mt-4">Redirecionando...</p>
      </div>
    </div>
  )
}
