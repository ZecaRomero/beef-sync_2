import databaseService from '../../../../services/databaseService';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const { quantidadeUsada = 1 } = req.body;
      const updatedSemen = await databaseService.usarDoseSemen(id, quantidadeUsada);
      
      if (updatedSemen) {
        res.status(200).json(updatedSemen);
      } else {
        res.status(404).json({ message: 'Sêmen não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao usar dose de sêmen:', error);
      res.status(500).json({ message: 'Erro ao usar dose de sêmen', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
