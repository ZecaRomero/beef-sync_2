
import React, { useState } from 'react'

import BirthManager from '../components/BirthManager'
import BirthForm from '../components/BirthForm'

export default function Nascimentos() {
  const [showForm, setShowForm] = useState(false)
  const [selectedBirth, setSelectedBirth] = useState(null)
  const [births, setBirths] = useState([])

  const handleSaveBirth = (birthData) => {
    const savedBirths = JSON.parse(localStorage.getItem('birthData') || '[]')
    
    if (selectedBirth) {
      // Editar nascimento existente
      const updatedBirths = savedBirths.map(b => 
        b.id === selectedBirth.id ? birthData : b
      )
      localStorage.setItem('birthData', JSON.stringify(updatedBirths))
      setBirths(updatedBirths)
    } else {
      // Adicionar novo nascimento
      const newBirths = [...savedBirths, birthData]
      localStorage.setItem('birthData', JSON.stringify(newBirths))
      setBirths(newBirths)
    }
    
    setSelectedBirth(null)
    setShowForm(false)
    
    // Recarregar a página para atualizar os dados
    window.location.reload()
  }

  return (
    <div>
      <BirthManager 
        onNewBirth={() => {
          setSelectedBirth(null)
          setShowForm(true)
        }}
        onEditBirth={(birth) => {
          setSelectedBirth(birth)
          setShowForm(true)
        }}
      />
      
      {showForm && (
        <BirthForm
          birth={selectedBirth}
          onSave={handleSaveBirth}
          onClose={() => {
            setShowForm(false)
            setSelectedBirth(null)
          }}
        />
      )}
    </div>
  )
}