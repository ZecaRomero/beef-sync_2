import { useState } from 'react'

export default function ImportarObservacoesAnimais() {
  const [textoColado, setTextoColado] = useState('')
  const [processando, setProcessando] = useState(false)
  const [resultado, setResultado] = useState(null)

  const processarImportacao = async () => {
    if (!textoColado.trim()) {
      alert('⚠️ Cole os dados do Excel primeiro!')
      return
    }

    setProcessando(true)
    setResultado(null)

    try {
      const response = await fetch('/api/import/observacoes-animais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: textoColado })
      })

      const data = await response.json()

      if (response.ok) {
        setResultado(data)
        alert(`✅ ${data.sucessos} observação(ões) atualizada(s) com sucesso!`)
      } else {
        alert(`❌ Erro: ${data.error || 'Erro ao processar importação'}`)
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('❌ Erro ao processar importação')
    } finally {
      setProcessando(false)
    }
  }

  const limpar = () => {
    setTextoColado('')
    setResultado(null)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-3 rounded-xl">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            📋 Importar Observações do Excel
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cole os dados copiados do Excel (Série, RG, Observação)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Instruções */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
          <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">📝 Como usar:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>No Excel, selecione as colunas: <strong>Série</strong>, <strong>RG</strong> e <strong>Observação</strong></li>
            <li>Copie os dados (Ctrl+C)</li>
            <li>Cole aqui na caixa abaixo (Ctrl+V)</li>
            <li>Clique em "Processar Importação"</li>
          </ol>
        </div>

        {/* Exemplo */}
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-300 dark:border-gray-600">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Exemplo de formato:</p>
          <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono">
M	1815	Animal com problema no casco{'\n'}
G	2947	Receptora prenha - parto previsto 07/10/2026{'\n'}
N	3456	Observação importante sobre este animal
          </pre>
        </div>

        {/* Área de texto */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Cole os dados do Excel aqui:
          </label>
          <textarea
            value={textoColado}
            onChange={(e) => setTextoColado(e.target.value)}
            placeholder="Cole aqui os dados copiados do Excel (Série, RG, Observação)..."
            rows={10}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {textoColado.split('\n').filter(l => l.trim()).length} linha(s)
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={processarImportacao}
            disabled={processando || !textoColado.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {processando ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Processando...
              </>
            ) : (
              <>
                ✓ Processar Importação
              </>
            )}
          </button>
          <button
            onClick={limpar}
            disabled={processando}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
          >
            🔄 Limpar
          </button>
        </div>

        {/* Resultado */}
        {resultado && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
            <h4 className="font-bold text-green-900 dark:text-green-300 mb-2">✅ Importação Concluída!</h4>
            <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
              <p>✅ Sucessos: <strong>{resultado.sucessos}</strong></p>
              <p>❌ Erros: <strong>{resultado.erros}</strong></p>
              <p>📊 Total processado: <strong>{resultado.total}</strong></p>
            </div>
            {resultado.detalhes && resultado.detalhes.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-bold text-green-900 dark:text-green-300">
                  Ver detalhes
                </summary>
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {resultado.detalhes.map((d, i) => (
                    <div key={i} className="text-xs">
                      {d.sucesso ? '✅' : '❌'} {d.serie} {d.rg} - {d.mensagem || d.erro}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
