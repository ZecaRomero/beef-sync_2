import Head from 'next/head'
import ConsolidatedDashboard from '../components/dashboard/ConsolidatedDashboard'

export default function DashboardPremiumPage() {
  return (
    <>
      <Head>
        <title>Dashboard Premium - Beef-Sync</title>
        <meta name="description" content="Dashboard Premium do Beef-Sync com estatísticas em tempo real" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      
      <ConsolidatedDashboard variant="premium" />
    </>
  )
}

