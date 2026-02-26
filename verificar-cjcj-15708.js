require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false
})

async function verificar() {
  try {
    console.log('🔍 Verificando CJCJ 15708...\n')
    
    // Buscar animal
    const animal = await pool.query(`
      SELECT id, nome, serie, rg, sexo, resultado_dg, data_te
      FROM animais 
      WHERE serie = 'CJCJ' AND rg = '15708'
    `)
    
    if (animal.rows.length === 0) {
      console.log('❌ Animal não encontrado')
      return
    }
    
    const a = animal.rows[0]
    console.log('📋 Animal:')
    console.log(`   ID: ${a.id}`)
    console.log(`   Nome: ${a.nome}`)
    console.log(`   Série-RG: ${a.serie}-${a.rg}`)
    console.log(`   Sexo: ${a.sexo}`)
    console.log(`   Resultado DG: ${a.resultado_dg || 'NULL'}`)
    console.log(`   Data TE: ${a.data_te || 'NULL'}`)
    
    // Buscar inseminações
    console.log('\n💉 Inseminações:')
    const ias = await pool.query(`
      SELECT id, data_ia, touro_nome, status_gestacao, created_at
      FROM inseminacoes
      WHERE animal_id = $1
      ORDER BY data_ia DESC
    `, [a.id])
    
    if (ias.rows.length > 0) {
      console.log(`   Total: ${ias.rows.length}`)
      ias.rows.forEach((ia, idx) => {
        console.log(`\n   ${idx + 1}. IA #${ia.id}`)
        console.log(`      Data IA: ${ia.data_ia}`)
        console.log(`      Touro: ${ia.touro_nome}`)
        console.log(`      Status: ${ia.status_gestacao}`)
        console.log(`      Criado em: ${ia.created_at}`)
      })
    } else {
      console.log('   ❌ Nenhuma inseminação encontrada')
    }
    
    // Verificar se o problema é na API
    console.log('\n🔍 Testando API /api/animals/${id}?history=true...')
    const response = await pool.query(`
      SELECT 
        (SELECT json_agg(i.*) FROM inseminacoes i WHERE i.animal_id = $1) as inseminacoes
    `, [a.id])
    
    const apiData = response.rows[0]
    console.log(`   Inseminações na API: ${apiData.inseminacoes ? JSON.stringify(apiData.inseminacoes, null, 2) : 'NULL'}`)
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await pool.end()
  }
}

verificar()
