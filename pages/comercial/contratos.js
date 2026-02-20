import React, { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StarIcon, PlusIcon } from '../../components/ui/Icons'

export default function Contracts() {
  const [mounted, setMounted] = useState(false)
  const [contracts, setContracts] = useState([])
  const [showNewContract, setShowNewContract] = useState(false)
  const [newContract, setNewContract] = useState({
    party: '',
    type: 'venda',
    value: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'ativo'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (typeof window === 'undefined') return
    
    const saved = localStorage.getItem('contracts')
    if (saved) {
      setContracts(JSON.parse(saved))
    }
  }, [mounted])

  const handleAddContract = () => {
    if (!newContract.party.trim()) return
    const contract = {
      id: Date.now(),
      ...newContract,
      value: parseFloat(newContract.value) || 0
    }
    const updated = [...contracts, contract]
    setContracts(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('contracts', JSON.stringify(updated))
    }
    setNewContract({
      party: '',
      type: 'venda',
      value: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'ativo'
    })
    setShowNewContract(false)
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <StarIcon className="h-8 w-8 text-blue-600" />
          Contratos Comerciais
        </h1>
        <Button onClick={() => setShowNewContract(true)} className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Novo Contrato
        </Button>
      </div>

      <div className="space-y-2">
        {contracts.map(contract => (
          <Card key={contract.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{contract.party}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tipo: {contract.type}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Período: {new Date(contract.startDate).toLocaleDateString('pt-BR')} a {new Date(contract.endDate).toLocaleDateString('pt-BR')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valor: R$ {contract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                contract.status === 'ativo'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              }`}>
                {contract.status === 'ativo' ? 'Ativo' : 'Expirado'}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {showNewContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Novo Contrato</h2>
            <div className="space-y-4">
              <input type="text" value={newContract.party} onChange={(e) => setNewContract({ ...newContract, party: e.target.value })} placeholder="Parte Contratada" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <select value={newContract.type} onChange={(e) => setNewContract({ ...newContract, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="venda">Venda</option>
                <option value="compra">Compra</option>
                <option value="servico">Serviço</option>
              </select>
              <input type="number" value={newContract.value} onChange={(e) => setNewContract({ ...newContract, value: e.target.value })} placeholder="Valor (R$)" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300">Data Inicial</label>
                <input type="date" value={newContract.startDate} onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300">Data Final</label>
                <input type="date" value={newContract.endDate} onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={() => setShowNewContract(false)} variant="secondary" className="flex-1">Cancelar</Button>
              <Button onClick={handleAddContract} className="flex-1">Criar</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
