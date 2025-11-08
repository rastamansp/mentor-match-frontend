import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useCreateProduct } from '../hooks/useCreateProduct'
import { useEventDetail } from '../hooks/useEventDetail'
import { useAuth } from '../../contexts/AuthContext'
import { CreateProductDto } from '../../application/dto/CreateProductDto'
import { ArrowLeft, Image, DollarSign, Tag, FileText, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export const CreateProductPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { event, loading: loadingEvent } = useEventDetail(eventId || '')
  const { createProduct, loading } = useCreateProduct()
  
  const [formData, setFormData] = useState<CreateProductDto>({
    eventId: eventId || '',
    name: '',
    description: '',
    price: 0,
    category: 'BEBIDA',
    image: '',
    isActive: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Verificar se o usuário é organizador do evento
  const isOrganizer = event && user && event.organizerId === user.id

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }))
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.length > 255) {
      newErrors.name = 'Nome deve ter no máximo 255 caracteres'
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Descrição deve ter no máximo 1000 caracteres'
    }

    if (!formData.price || formData.price < 0.01) {
      newErrors.price = 'Preço deve ser no mínimo R$ 0,01'
    } else {
      // Verificar se tem no máximo 2 casas decimais
      const decimalPlaces = (formData.price.toString().split('.')[1] || '').length
      if (decimalPlaces > 2) {
        newErrors.price = 'Preço deve ter no máximo 2 casas decimais'
      }
    }

    if (!formData.category || (formData.category !== 'BEBIDA' && formData.category !== 'ALIMENTO')) {
      newErrors.category = 'Categoria deve ser BEBIDA ou ALIMENTO'
    }

    if (formData.image && formData.image.length > 0) {
      try {
        new URL(formData.image)
      } catch {
        newErrors.image = 'URL da imagem inválida'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    if (!isOrganizer) {
      toast.error('Você não tem permissão para criar produtos neste evento')
      return
    }

    try {
      const dataToSend: CreateProductDto = {
        eventId: eventId || '',
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        price: formData.price,
        category: formData.category,
        image: formData.image?.trim() || undefined,
        isActive: formData.isActive ?? true,
      }

      await createProduct(dataToSend)
      toast.success('Produto cadastrado com sucesso!')
      navigate(`/events/${eventId}/products`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar produto'
      if (errorMessage.includes('403')) {
        toast.error('Você não tem permissão para criar produtos neste evento')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  if (loadingEvent) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isOrganizer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para criar produtos neste evento.</p>
          <Link
            to={`/events/${eventId}/products`}
            className="btn-primary"
          >
            Voltar para Produtos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link
          to={`/events/${eventId}/products`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Produtos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastrar Produto</h1>
        {event && (
          <p className="text-gray-600">Evento: {event.title}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="w-4 h-4 inline mr-1" />
            Nome *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Cerveja Artesanal"
            maxLength={255}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.name ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Descrição do produto (opcional)"
            rows={4}
            maxLength={1000}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.description ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          <p className="text-xs text-gray-500 mt-1">
            {(formData.description || '').length}/1000 caracteres
          </p>
        </div>

        {/* Preço e Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Preço * (R$)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price || ''}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.price ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            <p className="text-xs text-gray-500 mt-1">Mínimo: R$ 0,01</p>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="w-4 h-4 inline mr-1" />
              Categoria *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.category ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="BEBIDA">Bebida</option>
              <option value="ALIMENTO">Alimento</option>
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>
        </div>

        {/* URL da Imagem */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            <Image className="w-4 h-4 inline mr-1" />
            URL da Imagem
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image || ''}
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem.jpg"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.image ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          <p className="text-xs text-gray-500 mt-1">URL da imagem do produto (opcional)</p>
        </div>

        {/* Status Ativo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            Produto ativo
          </label>
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/events/${eventId}/products`)}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

