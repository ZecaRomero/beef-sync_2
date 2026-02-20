import React, { useEffect, useState } from 'react'

export default function OcorrenciasSimples() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    animalId: '',
    nome: '',
    serie: '',
    rg: '',
    sexo: '',
    nascimento: '',
    peso: '',
    observacoes: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const response = await fetch('/api/animals');
      if (response.ok) {
        const result = await response.json();
        const animalsData = result.data || result;
        setAnimals(Array.isArray(animalsData) ? animalsData : []);
      }
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalSelect = (animalId) => {
    const animal = animals.find(a => a.id === parseInt(animalId));
    if (animal) {
      setFormData(prev => ({
        ...prev,
        animalId: animal.id,
        nome: animal.serie || '',
        serie: animal.serie || '',
        rg: animal.rg || '',
        sexo: animal.sexo || '',
        nascimento: animal.data_nascimento ? animal.data_nascimento.split('T')[0] : '',
        peso: animal.peso || ''
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Salvando...');

    try {
      const response = await fetch('/api/animals/ocorrencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Ocorrência registrada com sucesso!');
        // Limpar observações
        setFormData(prev => ({ ...prev, observacoes: '' }));
      } else {
        const error = await response.json();
        setMessage(`Erro: ${error.message}`);
      }
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      minHeight: '100vh'
    },
    header: {
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '20px',
      marginBottom: '30px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '16px'
    },
    section: {
      backgroundColor: '#f9fafb',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #e5e7eb'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#374151'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '5px'
    },
    input: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    textarea: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white',
      minHeight: '100px',
      resize: 'vertical'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '20px',
      borderTop: '1px solid #e5e7eb'
    },
    button: {
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none'
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#6b7280',
      color: 'white'
    },
    message: {
      padding: '12px',
      borderRadius: '6px',
      marginTop: '15px',
      fontSize: '14px'
    },
    successMessage: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #a7f3d0'
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fca5a5'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Lançamento de Ocorrências</h1>
        <p style={styles.subtitle}>Registre ocorrências e eventos dos animais</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Seleção do Animal */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Dados do Animal</h3>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Selecionar Animal</label>
              <select
                value={formData.animalId}
                onChange={(e) => handleAnimalSelect(e.target.value)}
                style={styles.select}
                required
              >
                <option value="">Selecione um animal</option>
                {animals.map(animal => (
                  <option key={animal.id} value={animal.id}>
                    {animal.serie} - RG: {animal.rg}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nome/Série</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>RG</label>
              <input
                type="text"
                name="rg"
                value={formData.rg}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Sexo</label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="">Selecione</option>
                <option value="M">Macho</option>
                <option value="F">Fêmea</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nascimento</label>
              <input
                type="date"
                name="nascimento"
                value={formData.nascimento}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                name="peso"
                value={formData.peso}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Observações</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Descreva a ocorrência</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              style={styles.textarea}
              placeholder="Descreva aqui as observações sobre a ocorrência..."
              required
            />
          </div>
        </div>

        {/* Botões */}
        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={() => window.location.href = '/relatorios-ocorrencias'}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Ver Relatórios
          </button>
          
          <button
            type="submit"
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            Registrar Ocorrência
          </button>
        </div>

        {message && (
          <div 
            style={{
              ...styles.message,
              ...(message.includes('Erro') ? styles.errorMessage : styles.successMessage)
            }}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}