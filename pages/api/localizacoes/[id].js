// API para gerenciar localização específica por ID
export default function handler(req, res) {
  const { method, query } = req
  const { id } = query

  switch (method) {
    case 'GET':
      // Buscar localização por ID
      res.status(200).json({
        success: true,
        data: {
          id: parseInt(id),
          serie: 'TESA-001',
          rg: '001',
          sexo: 'Femea',
          raca: 'Nelore',
          piquete: 'Piquete 02',
          data_entrada: '2025-10-10',
          data_saida: null,
          observacoes: 'Animal em observação'
        },
        message: 'Localização encontrada'
      })
      break

    case 'PUT':
      // Atualizar localização
      const updatedLocation = {
        id: parseInt(id),
        ...req.body,
        updated_at: new Date().toISOString()
      }
      
      res.status(200).json({
        success: true,
        data: updatedLocation,
        message: 'Localização atualizada com sucesso'
      })
      break

    case 'DELETE':
      // Excluir localização
      res.status(200).json({
        success: true,
        message: `Localização ${id} excluída com sucesso`
      })
      break

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}