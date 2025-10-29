import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { useUpdateEvent } from '../hooks/useUpdateEvent'
import { useEventDetail } from '../hooks/useEventDetail'
import { useTicketCategories } from '../hooks/useTicketCategories'
import { useTicketCategoryManagement } from '../hooks/useTicketCategoryManagement'
import { CreateEventDto } from '../../application/dto/CreateEventDto'
import { CreateTicketCategoryData } from '../../domain/repositories/IEventRepository'
import { Calendar, MapPin, Image, Tag, Users, Plus, Trash2, Edit as EditIcon } from 'lucide-react'

export const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { event, loading: loadingEvent, error: errorEvent } = useEventDetail(id || '')
  const { updateEvent, loading: loadingUpdate } = useUpdateEvent()
  const { categories, loading: loadingCategories, refetch: refetchCategories } = useTicketCategories(id || '')
  const { createCategory, updateCategory, deleteCategory, loading: loadingCategoryActions } = useTicketCategoryManagement()
  
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    date: '',
    location: '',
    address: '',
    city: '',
    state: '',
    category: '',
    maxCapacity: 0,
    image: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Estados para modal de categoria
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{ id: string } | null>(null)
  const [categoryFormData, setCategoryFormData] = useState<CreateTicketCategoryData>({
    name: '',
    description: '',
    price: 0,
    maxQuantity: 0,
    benefits: []
  })
  const [benefitInput, setBenefitInput] = useState('')
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string>>({})

  // Preencher formulário quando o evento for carregado
  useEffect(() => {
    if (event) {
      // Converter data ISO para datetime-local
      const dateTime = new Date(event.date).toISOString().slice(0, 16)
      
      setFormData({
        title: event.title,
        description: event.description,
        date: dateTime,
        location: event.location,
        address: event.address,
        city: event.city,
        state: event.state,
        category: event.category,
        maxCapacity: event.maxCapacity,
        image: event.image || ''
      })
    }
  }, [event])

  const eventCategories = [
    'Música',
    'Esportes',
    'Cultura',
    'Tecnologia',
    'Negócios',
    'Gastronomia',
    'Teatro',
    'Cinema'
  ]

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxCapacity' ? parseInt(value) || 0 : value
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Título deve ter no mínimo 3 caracteres'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Descrição deve ter no mínimo 10 caracteres'
    }
    
    if (!formData.date) {
      newErrors.date = 'Data é obrigatória'
    } else {
      const date = new Date(formData.date)
      if (date < new Date()) {
        newErrors.date = 'Data deve ser futura'
      }
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Local é obrigatório'
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório'
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória'
    }
    
    if (!formData.state) {
      newErrors.state = 'Estado é obrigatório'
    }
    
    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória'
    }
    
    if (formData.maxCapacity <= 0) {
      newErrors.maxCapacity = 'Capacidade deve ser maior que zero'
    }
    
    if (formData.image && !/^https?:\/\/.+/.test(formData.image)) {
      newErrors.image = 'URL da imagem inválida'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!id) return

    try {
      // Converter data local para ISO
      const dateISO = new Date(formData.date).toISOString()
      
      const updatedEvent = await updateEvent(id, {
        ...formData,
        date: dateISO
      })

      toast.success('Evento atualizado com sucesso!')
      navigate(`/events/${updatedEvent.id}`)
    } catch (err) {
      console.error('Erro ao atualizar evento:', err)
      toast.error('Erro ao atualizar evento. Verifique os dados e tente novamente.')
    }
  }

  const handleAddBenefit = () => {
    if (benefitInput.trim()) {
      setCategoryFormData(prev => ({
        ...prev,
        benefits: [...(prev.benefits || []), benefitInput.trim()]
      }))
      setBenefitInput('')
    }
  }

  const handleRemoveBenefit = (index: number) => {
    setCategoryFormData(prev => ({
      ...prev,
      benefits: prev.benefits?.filter((_, i) => i !== index) || []
    }))
  }

  const validateCategoryForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!categoryFormData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (categoryFormData.name.length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres'
    }
    
    if (!categoryFormData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    } else if (categoryFormData.description.length < 10) {
      newErrors.description = 'Descrição deve ter no mínimo 10 caracteres'
    }
    
    if (categoryFormData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero'
    }
    
    if (categoryFormData.maxQuantity <= 0) {
      newErrors.maxQuantity = 'Quantidade máxima deve ser maior que zero'
    }
    
    setCategoryErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEditCategory = (category: any) => {
    setEditingCategory({ id: category.id })
    setCategoryFormData({
      name: category.name,
      description: category.description,
      price: typeof category.price === 'string' ? parseFloat(category.price) : category.price,
      maxQuantity: category.maxQuantity,
      benefits: category.benefits || []
    })
    setShowCategoryModal(true)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCategoryForm() || !id) {
      return
    }

    try {
      if (editingCategory) {
        // Atualizar categoria existente
        await updateCategory(editingCategory.id, categoryFormData)
        toast.success('Categoria atualizada com sucesso!')
      } else {
        // Criar nova categoria
        await createCategory(id, categoryFormData)
        toast.success('Categoria de ingresso criada com sucesso!')
      }
      
      setShowCategoryModal(false)
      setEditingCategory(null)
      setCategoryFormData({
        name: '',
        description: '',
        price: 0,
        maxQuantity: 0,
        benefits: []
      })
      setBenefitInput('')
      refetchCategories()
    } catch (err) {
      console.error('Erro ao salvar categoria:', err)
      toast.error('Erro ao salvar categoria. Verifique os dados e tente novamente.')
    }
  }

  const handleCloseModal = () => {
    setShowCategoryModal(false)
    setEditingCategory(null)
    setCategoryFormData({
      name: '',
      description: '',
      price: 0,
      maxQuantity: 0,
      benefits: []
    })
    setBenefitInput('')
    setCategoryErrors({})
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return
    }

    try {
      await deleteCategory(categoryId)
      toast.success('Categoria excluída com sucesso!')
      refetchCategories()
    } catch (err) {
      console.error('Erro ao excluir categoria:', err)
      toast.error('Erro ao excluir categoria.')
    }
  }

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2)
  }

  if (loadingEvent) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (errorEvent) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar evento</h2>
        <p className="text-gray-600">{errorEvent.message}</p>
        <button
          onClick={() => navigate('/my-events')}
          className="mt-4 btn-primary"
        >
          Voltar para Meus Eventos
        </button>
      </div>
    )
  }

  if (!event) {
    return null
  }

  // Verificar se o usuário é o organizador
  if (event.organizerId !== user?.id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
        <p className="text-gray-600 mb-4">Você não tem permissão para editar este evento.</p>
        <button
          onClick={() => navigate('/my-events')}
          className="btn-primary"
        >
          Voltar para Meus Eventos
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Evento</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título do Evento *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Festival de Música Eletrônica"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.title ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
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
                <option value="">Selecione uma categoria</option>
                {eventCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Descreva o evento em detalhes..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.description ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.date ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="w-4 h-4 inline mr-1" />
                Capacidade Máxima *
              </label>
              <input
                type="number"
                id="maxCapacity"
                name="maxCapacity"
                value={formData.maxCapacity || ''}
                onChange={handleChange}
                min="1"
                placeholder="Ex: 5000"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.maxCapacity ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.maxCapacity && <p className="text-red-500 text-xs mt-1">{errors.maxCapacity}</p>}
            </div>
          </div>

          {/* Localização */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Localização
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Local *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex: Parque da Cidade"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.location ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Ex: Av. das Flores, 123"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.address ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Ex: São Paulo"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.city ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.state ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Selecione um estado</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
            </div>
          </div>

          {/* Imagem */}
          <div className="border-t pt-6">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              <Image className="w-4 h-4 inline mr-1" />
              URL da Imagem (opcional)
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.image ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            <p className="text-xs text-gray-500 mt-1">URL de uma imagem para o evento</p>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingUpdate}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingUpdate ? 'Atualizando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>

        {/* Seção de Categorias de Ingressos */}
        <div className="mt-12 pt-12 border-t">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Categorias de Ingressos</h2>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              <span>Adicionar Categoria</span>
            </button>
          </div>

          {loadingCategories ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Tag className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 mb-4">Nenhuma categoria de ingresso cadastrada</p>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Adicionar primeira categoria
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <div key={`${category.id}-${index}`} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <span className="text-xl font-bold text-blue-600">
                      R$ {formatPrice(category.price)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm">{category.description}</p>
                  
                  {category.benefits && category.benefits.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Benefícios:</p>
                      {category.benefits.map((benefit: string, index: number) => (
                        <div key={index} className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          {benefit}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <Users className="w-4 h-4 mr-1" />
                    {category.soldQuantity} / {category.maxQuantity} vendidos
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      disabled={loadingCategoryActions}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm disabled:opacity-50"
                    >
                      <EditIcon className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={loadingCategoryActions}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para Criar Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCategory ? 'Editar Categoria de Ingresso' : 'Nova Categoria de Ingresso'}
            </h3>
            
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Pista, VIP, Camarote"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    categoryErrors.name ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {categoryErrors.name && <p className="text-red-500 text-xs mt-1">{categoryErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  id="categoryDescription"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Ex: Acesso à pista principal com barracas de comida"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    categoryErrors.description ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {categoryErrors.description && <p className="text-red-500 text-xs mt-1">{categoryErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="categoryPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    id="categoryPrice"
                    step="0.01"
                    value={categoryFormData.price || ''}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="150.00"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      categoryErrors.price ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {categoryErrors.price && <p className="text-red-500 text-xs mt-1">{categoryErrors.price}</p>}
                </div>

                <div>
                  <label htmlFor="categoryMaxQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade Máxima *
                  </label>
                  <input
                    type="number"
                    id="categoryMaxQuantity"
                    value={categoryFormData.maxQuantity || ''}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, maxQuantity: parseInt(e.target.value) || 0 }))}
                    placeholder="800"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      categoryErrors.maxQuantity ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {categoryErrors.maxQuantity && <p className="text-red-500 text-xs mt-1">{categoryErrors.maxQuantity}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefícios (opcional)
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                    placeholder="Ex: Acesso à pista"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {categoryFormData.benefits && categoryFormData.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categoryFormData.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {benefit}
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingCategoryActions}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingCategoryActions ? (editingCategory ? 'Atualizando...' : 'Criando...') : (editingCategory ? 'Atualizar Categoria' : 'Criar Categoria')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

