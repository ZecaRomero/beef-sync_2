import React, { useEffect, useState } from 'react'

export default function OcorrenciasThemed() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    animalId: '',
    nome: '',
    serie: '',
    rg: '',
    sexo: '',
    nascimento: '',
    meses: '',
    dataUltimoPeso: '',
    peso: '',
    paiNomeRg: '',
    avoMaterno: '',
    maeBiologiaRg: ''
  });

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = () => {
    try {
      const storedAnimals = localStorage.getItem('animals');
      if (storedAnimals) {
        setAnimals(JSON.parse(storedAnimals));
      }
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      setMessage('Erro ao carregar dados dos animais');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Ocorrências - Versão Themed
        </h1>
        
        {message && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            {message}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Esta é uma versão themed da página de ocorrências.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Total de animais: {animals.length}
          </p>
        </div>
      </div>
    </div>
  );
}