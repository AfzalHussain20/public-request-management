import type { Metadata } from 'next'
import AdminDashboard from '@/components/admin-dashboard'

export const metadata: Metadata = { title: 'Requests Dashboard' }

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return <AdminDashboard />
}
