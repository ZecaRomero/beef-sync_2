import React from 'react'
import { ServerIcon } from '@heroicons/react/24/outline'
import SystemDashboard from '../components/system/SystemDashboard'
import ModernLayout from '../components/ui/ModernLayout'

export default function SystemDashboardPage() {
  return (
    <ModernLayout
      title="Dashboard do Sistema"
      subtitle="Monitoramento e status geral do Beef Sync"
      icon={<ServerIcon className="w-8 h-8 text-white" />}
    >
      <SystemDashboard />
    </ModernLayout>
  )
}