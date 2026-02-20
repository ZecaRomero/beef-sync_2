import React, { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { CurrencyDollarIcon, PlusIcon } from '../../components/ui/Icons'

export default function Purchases() {
  const [mounted, setMounted] = useState(false)
  const [purchases, setPurchases] = useState([])
  const [showNewPurchase, setShowNewPurchase] = useState(false)
  const [newPurchase, setNewPurchase] = useState({
    item: '',
    supplier: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    category: 'insumo'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadPurchases()
  }, [mounted])

  const loadPurchases = async () => {
    try {
      if (typeof window === 'undefined') return
      
      const saved = localStorage.getItem('purchases')
      if (saved) {
        setPurchases(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleAddPurchase = () => {
    if (!newPurchase.item.trim()) return
    const purchase = {
      id: Date.now(),
      ...newPurchase,
      value: parseFloat(newPurchase.value) || 0
    }
    const updated = [...purchases, purchase]
    setPurchases(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('purchases', JSON.stringify(updated))
    }
    setNewPurchase({ item: '', supplier: '', value: '', date: new Date().toISOString().split('T')[0], category: 'insumo' })
    setShowNewPurchase(false)
  }

  const total = purchases.reduce((sum, p) => sum + p.value, 0)

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
            Registro de Compras
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Total: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Button onClick={() => setShowNewPurchase(true)} className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nova Compra
        </Button>
      </div>

      <div className="space-y-2">
        {purchases.map(purchase => (
          <Card key={purchase.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{purchase.item}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fornecedor: {purchase.supplier}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-orange-600">R$ {purchase.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-gray-500">{new Date(purchase.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showNewPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nova Compra</h2>
            <div className="space-y-4">
              <input type="text" value={newPurchase.item} onChange={(e) => setNewPurchase({ ...newPurchase, item: e.target.value })} placeholder="Item" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <input type="text" value={newPurchase.supplier} onChange={(e) => setNewPurchase({ ...newPurchase, supplier: e.target.value })} placeholder="Fornecedor" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <input type="number" value={newPurchase.value} onChange={(e) => setNewPurchase({ ...newPurchase, value: e.target.value })} placeholder="Valor (R$)" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <input type="date" value={newPurchase.date} onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={() => setShowNewPurchase(false)} variant="secondary" className="flex-1">Cancelar</Button>
              <Button onClick={handleAddPurchase} className="flex-1">Registrar</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
