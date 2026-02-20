
import React, { useEffect, useState } from 'react'

import { XMarkIcon } from '../ui/Icons'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import AnimalImporter from '../AnimalImporter'

const SERIES_OPTIONS = [
  { value: 'RPT', label: 'RPT - Receptora', raca: 'Receptora' },
  { value: 'BENT', label: 'BENT - Brahman', raca: 'Brahman' },
  { value: 'CJCJ', label: 'CJCJ - Nelore', raca: 'Nelore' },
  { value: 'CJCG', label: 'CJCG - Gir', raca: 'Gir' },
  { value: 'PA', label: 'PA - Nelore PA', raca: 'Nelore PA' }
]

const SITUACOES = ['Ativo', 'Vendido', 'Morto', 'Doado']

export default function ModernAnimalForm({ 
  isOpen, 
  onClose, 
  animal = null, 
  onSave,
  onImportAnimals 
}) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showImportModal, setShowImportModal] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: '',
    serie: '',
    rg: '',
    sexo: '',
    raca: '',
    dataNascimento: '',
    meses: 0,
    situacao: 'Ativo',
    pai: '',
    paiSerie: '',
    paiRg: '',
    mae: '',
    maeSerie: '',
    maeRg: '',
    receptoraRg: '',
    isFiv: false,
    valorVenda: '',
    abczg: '',
    deca: '',
    observacoes: '',
    boletim: '',
    localNascimento: '',
    pastoAtual: ''
  })
  
  const [availableLocations, setAvailableLocations] = useState([])

  // Carregar locais
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const piquetesUsados = new Set()
        const piquetesList = []

        // 1. Buscar piquetes já usados nas localizações da API
        try {
          const localizacoesResponse = await fetch('/api/localizacoes')
          if (localizacoesResponse.ok) {
            const localizacoesData = await localizacoesResponse.json()
            const localizacoesApi = localizacoesData.data || []
            
            localizacoesApi.forEach(loc => {
              if (loc.piquete && !piquetesUsados.has(loc.piquete)) {
                piquetesUsados.add(loc.piquete)
                piquetesList.push(loc.piquete)
              }
            })
          }
        } catch (error) {
          console.warn('Erro ao buscar localizações da API:', error)
        }

        // 2. Buscar piquetes cadastrados em "Gestão de Piquetes"
        try {
          const piquetesResponse = await fetch('/api/piquetes')
          if (piquetesResponse.ok) {
            const piquetesData = await piquetesResponse.json()
            const piquetesArray = piquetesData.piquetes || piquetesData.data?.piquetes || piquetesData.data || []
            
            if (Array.isArray(piquetesArray) && piquetesArray.length > 0) {
              piquetesArray.forEach(piquete => {
                const nome = typeof piquete === 'object' ? piquete.nome : piquete
                if (nome && !piquetesUsados.has(nome)) {
                  piquetesUsados.add(nome)
                  piquetesList.push(nome)
                }
              })
            }
          }
        } catch (error) {
          console.warn('Erro ao buscar piquetes cadastrados:', error)
        }

        // 3. Fallback: buscar da API de locais
        try {
          const response = await fetch('/api/locais')
          if (response.ok) {
            const data = await response.json()
            if (data.data && data.data.length > 0) {
              data.data.forEach(local => {
                if (!piquetesUsados.has(local.nome)) {
                  piquetesUsados.add(local.nome)
                  piquetesList.push(local.nome)
                }
              })
            }
          }
        } catch (error) {
          console.warn('Erro ao carregar locais da API:', error)
        }

        piquetesList.sort((a, b) => a.localeCompare(b))
        setAvailableLocations(piquetesList)
      } catch (error) {
        console.error('Erro ao carregar locais:', error)
      }
    }

    fetchLocations()
  }, [])

  useEffect(() => {
    if (animal) {
      setFormData({
        ...animal,
        nome: animal.nome || '',
        dataNascimento: animal.dataNascimento || animal.data_nascimento || '',
        observacoes: animal.observacoes || '',
        abczg: animal.abczg || '',
        deca: animal.deca || '',
        boletim: animal.boletim || '',
        localNascimento: animal.localNascimento || animal.local_nascimento || '',
        pastoAtual: animal.pastoAtual || animal.pasto_atual || ''
      })
    } else {
      setFormData({
        nome: '',
        serie: '',
        rg: '',
        sexo: '',
        raca: '',
        dataNascimento: '',
        meses: 0,
        situacao: 'Ativo',
        pai: '',
        paiSerie: '',
        paiRg: '',
        mae: '',
        maeSerie: '',
        maeRg: '',
        receptoraRg: '',
        isFiv: false,
        abczg: '',
        deca: '',
        observacoes: '',
        boletim: '',
        localNascimento: '',
        pastoAtual: ''
      })
    }
    setErrors({})
  }, [animal, isOpen])

  const handleSerieChange = (serie) => {
    const serieOption = SERIES_OPTIONS.find(s => s.value === serie)
    const newFormData = { ...formData, serie }

    if (serieOption) {
      newFormData.raca = serieOption.raca
    }

    // Regras específicas para RPT
    if (serie === 'RPT') {
      newFormData.sexo = 'Fêmea'
      newFormData.raca = 'Receptora'
      newFormData.meses = 30
      newFormData.dataNascimento = ''
    }

    // Regras específicas para PA
    if (serie === 'PA') {
      newFormData.sexo = 'Fêmea'
      newFormData.raca = 'Nelore PA'
    }

    setFormData(newFormData)
  }

  const calculateMeses = (dataNascimento) => {
    if (!dataNascimento) return 0
    const nascimento = new Date(dataNascimento)
    const hoje = new Date()
    const diffTime = Math.abs(hoje - nascimento)
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
    return diffMonths
  }

  const handleDateChange = (date) => {
    const meses = calculateMeses(date)
    setFormData({ ...formData, dataNascimento: date, meses })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.serie) newErrors.serie = 'Série é obrigatória'
    if (!formData.rg) newErrors.rg = 'RG é obrigatório'
    if (!formData.boletim) newErrors.boletim = 'Selecione o Boletim'
    if (!formData.pastoAtual) newErrors.pastoAtual = 'Selecione a Localização Atual'
    if (formData.rg.length > 6) newErrors.rg = 'RG deve ter no máximo 6 dígitos'
    
    // Validação específica para PA (2 letras + 4 números)
    if (formData.serie === 'PA') {
      if (!/^[A-Za-z]{2}\d{4}$/.test(formData.rg)) {
        newErrors.rg = 'RG PA deve ter 2 letras e 4 números (ex: AA1234)'
      }
    }

    if (!formData.sexo) newErrors.sexo = 'Sexo é obrigatório'
    if (!formData.raca) newErrors.raca = 'Raça é obrigatória'
    if (!formData.situacao) newErrors.situacao = 'Situação é obrigatória'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      alert('❌ Erro de validação: Verifique os campos obrigatórios')
      return
    }

    try {
      setLoading(true)
      await onSave(formData)
      alert(`✅ Sucesso! ${animal ? 'Animal atualizado com sucesso!' : 'Novo animal adicionado ao rebanho!'}`)
      onClose()
    } catch (error) {
      alert(`❌ Erro: ${error.message || 'Erro ao salvar animal'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (animals) => {
    if (onImportAnimals) {
      await onImportAnimals(animals)
      setShowImportModal(false)
    }
  }

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={animal ? 'Editar Animal' : 'Novo Animal'}
      size="xl"
    >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Botão de Importação - só aparece no modo de criação */}
          {!animal && onImportAnimals && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    📊 Importação em Massa
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Importe vários animais de uma vez usando Excel ou CSV
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setShowImportModal(true)}
                  className="text-sm"
                >
                  📥 Importar Excel
                </Button>
              </div>
            </div>
          )}

        {/* Identificação */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Identificação
          </h4>

          {/* Localização e Origem */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {/* Boletim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Boletim (Local de Entrada) *
              </label>
              <select
                value={formData.boletim}
                onChange={(e) => setFormData({ ...formData, boletim: e.target.value })}
                className={`input-field w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.boletim ? 'border-red-500' : ''}`}
              >
                <option value="">Selecione...</option>
                <option value="AGROPECUARIA PARDINHO">AGROPECUARIA PARDINHO</option>
                <option value="FAZENDA SANT ANNA RANCHARIA">FAZENDA SANT ANNA RANCHARIA</option>
              </select>
              {errors.boletim && (
                <p className="text-red-500 text-xs mt-1">{errors.boletim}</p>
              )}
            </div>

            {/* Local de Nascimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Local de Nascimento
              </label>
              <select
                value={formData.localNascimento}
                onChange={(e) => setFormData({ ...formData, localNascimento: e.target.value })}
                className="input-field w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione (Opcional)...</option>
                {availableLocations.map(loc => (
                  <option key={`nasc-${loc}`} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Localização Atual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Localização Atual (Piquete) *
              </label>
              <select
                value={formData.pastoAtual}
                onChange={(e) => setFormData({ ...formData, pastoAtual: e.target.value })}
                className={`input-field w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.pastoAtual ? 'border-red-500' : ''}`}
              >
                <option value="">Selecione...</option>
                {availableLocations.map(loc => (
                  <option key={`atual-${loc}`} value={loc}>{loc}</option>
                ))}
              </select>
              {errors.pastoAtual && (
                <p className="text-red-500 text-xs mt-1">{errors.pastoAtual}</p>
              )}
            </div>
          </div>
          
            <Input
              label="Nome do Animal"
              value={formData.nome || ''}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome do animal (opcional)"
            />
          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Série *
              </label>
              <select
                value={formData.serie}
                onChange={(e) => handleSerieChange(e.target.value)}
                className={`input-field ${errors.serie ? 'input-error' : ''}`}
              >
                <option value="">Selecione...</option>
                {SERIES_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.serie && (
                <p className="text-red-500 text-xs mt-1">{errors.serie}</p>
              )}
            </div>

            <Input
              label="RG *"
              type={formData.serie === 'PA' ? "text" : "number"}
              value={formData.rg}
              onChange={(e) => {
                 let value = e.target.value;
                 if (formData.serie === 'PA') {
                   value = value.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
                 }
                 setFormData({ ...formData, rg: value })
               }}
              error={errors.rg}
              placeholder={formData.serie === 'PA' ? "Ex: AA1234" : "Até 6 dígitos"}
              maxLength={20}
            />

              <Input
                label="Raça *"
                value={formData.raca}
                onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
                error={errors.raca}
                readOnly={formData.serie === 'RPT' || formData.serie === 'PA'}
              />
            </div>
        </div>

          {/* Características Compactas */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Características
          </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Data de Nascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => handleDateChange(e.target.value)}
                disabled={formData.serie === 'RPT'}
              />

              <Input
                label="Meses"
                type="number"
                value={formData.meses}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  meses: parseInt(e.target.value) || 0 
                })}
                readOnly={formData.serie === 'RPT'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sexo - Compacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sexo *
                </label>
                <div className="inline-flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sexo: 'Macho' })}
                    disabled={formData.serie === 'RPT' || formData.serie === 'PA'}
                    className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.sexo === 'Macho'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    } ${
                      formData.serie === 'RPT' || formData.serie === 'PA' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    🐂 Macho
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sexo: 'Fêmea' })}
                    className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.sexo === 'Fêmea'
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-pink-300'
                    }`}
                  >
                    🐄 Fêmea
                  </button>
                </div>
                {errors.sexo && (
                  <p className="text-red-500 text-xs mt-1">{errors.sexo}</p>
                )}
              </div>

              {/* FIV - Compacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Este animal é FIV? 🧬
                </label>
                <div className="inline-flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isFiv: true })}
                    className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.isFiv === true
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                    }`}
                  >
                    ✅ Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isFiv: false })}
                    className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.isFiv === false
                        ? 'border-gray-500 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    ❌ Não
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Situação *
              </label>
              <select
                value={formData.situacao}
                onChange={(e) => setFormData({ ...formData, situacao: e.target.value })}
                className={`input-field ${errors.situacao ? 'input-error' : ''}`}
              >
                {SITUACOES.map(situacao => (
                  <option key={situacao} value={situacao}>
                    {situacao}
                  </option>
                ))}
              </select>
              {errors.situacao && (
                <p className="text-red-500 text-xs mt-1">{errors.situacao}</p>
                )}
              </div>

              {/* Receptora - só aparece se for FIV */}
              {formData.isFiv && (
                <Input
                  label="RG da Receptora (RPT)"
                  value={formData.receptoraRg}
                  onChange={(e) => setFormData({ ...formData, receptoraRg: e.target.value })}
                  placeholder="Ex: 789012"
                />
              )}
          </div>
        </div>


          {/* Genealogia - Compacta */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Genealogia
          </h4>

            {/* Pai */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🐂 Pai
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-1">
                  <Input
                    label="Série"
                    value={formData.paiSerie}
                    onChange={(e) => setFormData({ ...formData, paiSerie: e.target.value })}
                    placeholder="Série"
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label="RG"
                    value={formData.paiRg}
                    onChange={(e) => setFormData({ ...formData, paiRg: e.target.value })}
                    placeholder="RG"
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    label="Nome"
                    value={formData.pai}
                    onChange={(e) => setFormData({ ...formData, pai: e.target.value })}
                    placeholder="Nome do pai"
                  />
                </div>
              </div>
            </div>

            {/* Mãe */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🐄 Mãe
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-1">
                  <Input
                    label="Série"
                    value={formData.maeSerie}
                    onChange={(e) => setFormData({ ...formData, maeSerie: e.target.value })}
                    placeholder="Série"
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label="RG"
                    value={formData.maeRg}
                    onChange={(e) => setFormData({ ...formData, maeRg: e.target.value })}
                    placeholder="RG"
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    label="Nome"
                    value={formData.mae}
                    onChange={(e) => setFormData({ ...formData, mae: e.target.value })}
                    placeholder="Nome da mãe"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Campos ABCZg e DECA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="¡ABCZg"
              value={formData.abczg || ''}
              onChange={(e) => setFormData({ ...formData, abczg: e.target.value })}
              placeholder="ABCZg"
            />
            <Input
              label="DECA"
              value={formData.deca || ''}
              onChange={(e) => setFormData({ ...formData, deca: e.target.value })}
              placeholder="DECA"
            />
          </div>

          {/* Observações - Compacta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              {animal ? 'Atualizar' : 'Criar'} Animal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Importação */}
      {showImportModal && (
        <AnimalImporter
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
    </>
  )
}