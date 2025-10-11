import React from 'react'
import { useAdminStats } from '../hooks/useAdminStats'
import { Users, Calendar, CreditCard, TrendingUp, BarChart3, PieChart } from 'lucide-react'

export const AdminDashboardPage: React.FC = () => {
  const { stats, loading, error } = useAdminStats()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar dados</h2>
        <p className="text-gray-600">{error.message}</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar dados</h2>
        <p className="text-gray-600">Não foi possível carregar as estatísticas do dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
        <p className="text-gray-600">Visão geral da plataforma e métricas importantes</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500">
                Crescimento: {stats.userGrowth > 0 ? '+' : ''}{stats.userGrowth}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              <p className="text-xs text-gray-500">
                {stats.activeEvents} ativos, {stats.soldOutEvents} esgotados
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats.totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                R$ {stats.monthlyRevenue.toFixed(2)} este mês
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Crescimento</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.eventGrowth > 0 ? '+' : ''}{stats.eventGrowth.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">vs mês anterior</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tickets Stats */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Estatísticas de Ingressos
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Ingressos</span>
              <span className="font-semibold">{stats.totalTickets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ingressos Ativos</span>
              <span className="font-semibold text-green-600">{stats.totalTickets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ingressos Usados</span>
              <span className="font-semibold text-blue-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ingressos Cancelados</span>
              <span className="font-semibold text-red-600">0</span>
            </div>
          </div>
        </div>

        {/* Payments Stats */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Estatísticas de Pagamentos
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Pagamentos</span>
              <span className="font-semibold">{stats.totalRevenue > 0 ? '1' : '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pagamentos Aprovados</span>
              <span className="font-semibold text-green-600">{stats.totalRevenue > 0 ? '1' : '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pagamentos Pendentes</span>
              <span className="font-semibold text-yellow-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pagamentos Rejeitados</span>
              <span className="font-semibold text-red-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Reembolsos</span>
              <span className="font-semibold text-purple-600">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Administrativas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn-primary">
            Gerenciar Usuários
          </button>
          <button className="btn-secondary">
            Gerenciar Eventos
          </button>
          <button className="btn-secondary">
            Relatórios
          </button>
          <button className="btn-secondary">
            Configurações
          </button>
        </div>
      </div>
    </div>
  )
}
