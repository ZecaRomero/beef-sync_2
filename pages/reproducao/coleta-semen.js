import React from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import SemenCollectionManager from '../../components/semen/SemenCollectionManager'

export default function ColetaSemenPage() {
  return (
    <>
      <Head>
        <title>Coleta de Sêmen - Beef-Sync</title>
        <meta name="description" content="Sistema de coleta de sêmen - Beef-Sync" />
      </Head>
      
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <SemenCollectionManager />
        </div>
      </Layout>
    </>
  )
}