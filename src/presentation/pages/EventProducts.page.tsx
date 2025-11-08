import React, { useState, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useDeleteProduct } from '../hooks/useDeleteProduct'
import { useUpdateProduct } from '../hooks/useUpdateProduct'
import { useEventDetail } from '../hooks/useEventDetail'
import { useAuth } from '../../contexts/AuthContext'
import { Product, ProductCategory } from '../../domain/entities/Product.entity'
import { CreateProductDto } from '../../application/dto/CreateProductDto'
import { Search, Plus, Edit, Trash2, X, AlertTriangle, Beer, Utensils, ArrowLeft, Power, PowerOff } from 'lucide-react'
import { toast } from 'react-hot-toast'

export const EventProductsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { event, loading: loadingEvent } = useEventDetail(eventId || '')
  const [activeOnly, setActiveOnly] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<'BEBIDA' | 'ALIMENTO' | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const { products, loading, error, refetch } = useProducts(eventId || '', activeOnly)
  const { deleteProduct, loading: loadingDelete } = useDeleteProduct()
  const { updateProduct, loading: loadingUpdate } = useUpdateProduct()

  // Verificar se o usuário é organizador do evento
  const isOrganizer = event && user && event.organizerId === user.id

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // A busca será feita no filteredProducts
  }

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId)
      toast.success('Produto deletado com sucesso!')
      setShowDeleteModal(null)
      await refetch()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar produto'
      if (errorMessage.includes('403')) {
        toast.error('Você não tem permissão para deletar este produto')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { isActive: !product.isActive })
      toast.success(`Produto ${product.isActive ? 'desativado' : 'ativado'} com sucesso!`)
      await refetch()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto'
      if (errorMessage.includes('403')) {
        toast.error('Você não tem permissão para atualizar este produto')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return []
    }

    let filtered = products

    // Filtro por categoria
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }

    // Filtro por busca
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search))
      )
    }

    return filtered
  }, [products, categoryFilter, searchTerm])

  const formatPrice = (price: number): string => {
    return price.toFixed(2).replace('.', ',')
  }

  if (loadingEvent) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar produtos</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 btn-primary text-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link
              to={`/events/${eventId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Evento
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Produtos do Evento</h1>
            {event && (
              <p className="text-gray-600">{event.title}</p>
            )}
          </div>
          {isOrganizer && (
            <Link
              to={`/events/${eventId}/products/new`}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Adicionar Produto
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome ou descrição..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'BEBIDA' | 'ALIMENTO' | 'ALL')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todas</option>
                <option value="BEBIDA">Bebidas</option>
                <option value="ALIMENTO">Alimentos</option>
              </select>
            </div>

            {isOrganizer && (
              <div className="min-w-[150px]">
                <label htmlFor="activeOnly" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="activeOnly"
                  value={activeOnly ? 'true' : 'false'}
                  onChange={(e) => setActiveOnly(e.target.value === 'true')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Apenas Ativos</option>
                  <option value="false">Todos</option>
                </select>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Grid de Produtos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-lg shadow-md border-2 transition-shadow ${
                product.isActive ? 'border-gray-200 hover:shadow-lg' : 'border-gray-300 opacity-75'
              }`}
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className={`w-full h-48 rounded-t-lg flex items-center justify-center ${
                  product.category === ProductCategory.BEBIDA ? 'bg-blue-100' : 'bg-orange-100'
                }`}>
                  {product.category === ProductCategory.BEBIDA ? (
                    <Beer className="w-24 h-24 text-blue-600 opacity-50" />
                  ) : (
                    <Utensils className="w-24 h-24 text-orange-600 opacity-50" />
                  )}
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.category === ProductCategory.BEBIDA
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {product.category}
                      </span>
                      {!product.isActive && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    R$ {formatPrice(product.price)}
                  </span>
                </div>

                {isOrganizer && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Link
                      to={`/events/${eventId}/products/${product.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleToggleActive(product)}
                      disabled={loadingUpdate}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                        product.isActive
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {product.isActive ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(product.id)}
                      disabled={loadingDelete}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
          {isOrganizer && (
            <Link
              to={`/events/${eventId}/products/new`}
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              Cadastrar primeiro produto
            </Link>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Confirmar Exclusão</h3>
                  <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loadingDelete}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Tem certeza que deseja apagar o produto <strong>{products.find(p => p.id === showDeleteModal)?.name || 'este produto'}</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Todos os dados relacionados serão permanentemente removidos.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(null)}
                  disabled={loadingDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={loadingDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingDelete ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Apagando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Apagar Produto
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

