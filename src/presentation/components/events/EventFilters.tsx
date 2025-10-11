import React from 'react'
import { EventFilters as EventFiltersType } from '../../../domain/repositories/IEventRepository'
import { Search, Filter } from 'lucide-react'

interface EventFiltersProps {
  filters: EventFiltersType
  onChange: (filters: EventFiltersType) => void
}

export const EventFilters: React.FC<EventFiltersProps> = ({ filters, onChange }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, category: e.target.value || undefined })
  }


  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, status: e.target.value || undefined })
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Categoria */}
        <select
          value={filters.category || ''}
          onChange={handleCategoryChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas as categorias</option>
          <option value="MUSIC">Música</option>
          <option value="SPORTS">Esportes</option>
          <option value="CULTURE">Cultura</option>
          <option value="BUSINESS">Negócios</option>
          <option value="TECH">Tecnologia</option>
          <option value="OTHER">Outros</option>
        </select>

        {/* Cidade */}
        <input
          type="text"
          placeholder="Cidade"
          value={filters.city || ''}
          onChange={(e) => onChange({ ...filters, city: e.target.value || undefined })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Status */}
        <select
          value={filters.status || ''}
          onChange={handleStatusChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
          <option value="CANCELLED">Cancelado</option>
          <option value="SOLD_OUT">Esgotado</option>
        </select>
      </div>
    </div>
  )
}
