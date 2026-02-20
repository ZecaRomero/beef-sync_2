import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function TreinamentoRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para dashboard após 2 segundos
    const timer = setTimeout(() => {
      router.replace('/dashboard')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <>
      <Head>
        <title>Página Removida - Beef Sync</title>
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Página de Treinamento Removida
              </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Esta funcionalidade foi removida para melhorar a performance do sistema.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecionando para o dashboard...
          </p>
        </div>
      </div>
    </>
  )
}
