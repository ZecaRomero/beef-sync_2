import React, { useState, useEffect } from 'react'
import { 
  DocumentArrowDownIcon, 
  ShareIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'

export default function ResumoAnimaisNF({ numeroNF, localidade, onClose }) {
  const [resumo, setResumo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (numeroNF) {
      carregarResumo()
    }
  }, [numeroNF, localidade])

  const carregarResumo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({ numeroNF })
      if (localidade) {
        params.append('localidade', localidade)
      }
      
      const response = await fetch(`/api/notas-fiscais/resumo-animais?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setResumo(data.data)
      } else {
        setError(data.message || 'Erro ao carregar resumo')
      }
    } catch (err) {
      setError('Erro ao carregar resumo: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const exportarParaExcel = () => {
    if (!resumo) return

    const wb = XLSX.utils.book_new()
    
    // Criar dados da tabela
    const dados = [
      ['AGROPECUÁRIA PARDINHO LTDA', '', '', '', '', '', '', '', 'CNPJ 18.978.214/0004-45'],
      [],
      ['0 A 3', '3 A 8', '8 A 12', '12 A 24', '25 A 36', 'ACIMA 36', 'SUBTOTAL', 'TOTAL'],
      ['M', 'F', 'M', 'F', 'M', 'F', 'M', 'F', 'M', 'F', 'M', 'F', 'M', 'F', ''],
      [
        resumo.resumo['0 A 3'].M || 0,
        resumo.resumo['0 A 3'].F || 0,
        resumo.resumo['3 A 8'].M || 0,
        resumo.resumo['3 A 8'].F || 0,
        resumo.resumo['8 A 12'].M || 0,
        resumo.resumo['8 A 12'].F || 0,
        resumo.resumo['12 A 24'].M || 0,
        resumo.resumo['12 A 24'].F || 0,
        resumo.resumo['25 A 36'].M || 0,
        resumo.resumo['25 A 36'].F || 0,
        resumo.resumo['ACIMA 36'].M || 0,
        resumo.resumo['ACIMA 36'].F || 0,
        resumo.subtotais.M || 0,
        resumo.subtotais.F || 0,
        resumo.total || 0
      ]
    ]

    const ws = XLSX.utils.aoa_to_sheet(dados)
    
    // Estilizar cabeçalho (linha 3)
    ws['!rows'] = [
      { hpt: 20 }, // Linha 1
      { hpt: 5 },  // Linha 2 (vazia)
      { hpt: 30 }  // Linha 3 (cabeçalho)
    ]

    // Mesclar células do título
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Título
      { s: { r: 0, c: 8 }, e: { r: 0, c: 8 } }  // CNPJ
    ]

    // Definir larguras das colunas
    ws['!cols'] = [
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Resumo Animais')
    
    // Salvar arquivo
    const nomeArquivo = `Resumo_Animais_NF_${numeroNF}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, nomeArquivo)
  }

  const gerarGraficoWhatsApp = async () => {
    if (!resumo) return

    try {
      // Criar canvas para gráfico
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 600
      const ctx = canvas.getContext('2d')

      // Fundo branco
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Título
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('AGROPECUÁRIA PARDINHO LTDA', canvas.width / 2, 40)
      
      ctx.font = '16px Arial'
      ctx.fillText('CNPJ 18.978.214/0004-45', canvas.width / 2, 65)
      ctx.fillText(`NF: ${numeroNF}`, canvas.width / 2, 90)

      // Desenhar gráfico de barras
      const eras = ['0 A 3', '3 A 8', '8 A 12', '12 A 24', '25 A 36', 'ACIMA 36']
      const maxValor = Math.max(
        ...eras.map(era => Math.max(resumo.resumo[era].M || 0, resumo.resumo[era].F || 0)),
        resumo.total || 0
      )

      const larguraBarra = 50
      const espacamento = 20
      const inicioX = 100
      const inicioY = 150
      const alturaMaxima = 350

      eras.forEach((era, index) => {
        const x = inicioX + index * (larguraBarra * 2 + espacamento)
        const valorM = resumo.resumo[era].M || 0
        const valorF = resumo.resumo[era].F || 0
        
        // Barra Machos (azul)
        const alturaM = (valorM / maxValor) * alturaMaxima
        ctx.fillStyle = '#3B82F6'
        ctx.fillRect(x, inicioY + alturaMaxima - alturaM, larguraBarra, alturaM)
        
        // Barra Fêmeas (vermelho)
        const alturaF = (valorF / maxValor) * alturaMaxima
        ctx.fillStyle = '#EF4444'
        ctx.fillRect(x + larguraBarra, inicioY + alturaMaxima - alturaF, larguraBarra, alturaF)

        // Labels
        ctx.fillStyle = '#000000'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(era, x + larguraBarra, inicioY + alturaMaxima + 20)
        ctx.fillText(`M:${valorM}`, x + larguraBarra / 2, inicioY + alturaMaxima - alturaM - 5)
        ctx.fillText(`F:${valorF}`, x + larguraBarra * 1.5, inicioY + alturaMaxima - alturaF - 5)
      })

      // Legenda
      ctx.fillStyle = '#3B82F6'
      ctx.fillRect(50, 550, 20, 20)
      ctx.fillStyle = '#000000'
      ctx.font = '14px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('Machos', 80, 565)

      ctx.fillStyle = '#EF4444'
      ctx.fillRect(200, 550, 20, 20)
      ctx.fillStyle = '#000000'
      ctx.fillText('Fêmeas', 230, 565)

      // Total
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Total: ${resumo.total} animais`, canvas.width / 2, 580)

      // Converter para imagem e abrir em nova aba para compartilhar
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Grafico_Animais_NF_${numeroNF}.png`
        link.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (err) {
      console.error('Erro ao gerar gráfico:', err)
      alert('Erro ao gerar gráfico: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando resumo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-red-600">Erro</h3>
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={carregarResumo}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!resumo) {
    return null
  }

  const eras = ['0 A 3', '3 A 8', '8 A 12', '12 A 24', '25 A 36', 'ACIMA 36']

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full m-4">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold underline">AGROPECUÁRIA PARDINHO LTDA</h2>
              <p className="text-sm mt-1">CNPJ 18.978.214/0004-45</p>
              {resumo.nfInfo && (
                <p className="text-sm mt-1">NF: {resumo.nfInfo.numeroNF} - {resumo.nfInfo.dataNF}</p>
              )}
            </div>
            {onClose && (
              <button onClick={onClose} className="text-white hover:text-gray-200">
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {/* Tabela de Resumo */}
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="border border-gray-300 px-4 py-3"></th>
                  {eras.map(era => (
                    <th key={era} colSpan="2" className="border border-gray-300 px-4 py-3 text-center">
                      {era}
                    </th>
                  ))}
                  <th colSpan="2" className="border border-gray-300 px-4 py-3 text-center">
                    SUBTOTAL
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center">
                    TOTAL
                  </th>
                </tr>
                <tr className="bg-white">
                  <th className="border border-gray-300 px-4 py-2"></th>
                  {eras.map(era => (
                    <React.Fragment key={era}>
                      <th className="border border-gray-300 px-4 py-2 text-center text-red-600 font-semibold">M</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-red-600 font-semibold">F</th>
                    </React.Fragment>
                  ))}
                  <th className="border border-gray-300 px-4 py-2 text-center text-red-600 font-semibold">M</th>
                  <th className="border border-gray-300 px-4 py-2 text-center text-red-600 font-semibold">F</th>
                  <th className="border border-gray-300 px-4 py-2 text-center text-red-600 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Quantidade</td>
                  {eras.map(era => (
                    <React.Fragment key={era}>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {resumo.resumo[era].M || 0}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {resumo.resumo[era].F || 0}
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    {resumo.subtotais.M || 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    {resumo.subtotais.F || 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-red-600">
                    {resumo.total || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={exportarParaExcel}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Exportar Excel
            </button>
            <button
              onClick={gerarGraficoWhatsApp}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <ShareIcon className="h-5 w-5 mr-2" />
              Gerar Gráfico WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

