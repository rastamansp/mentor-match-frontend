import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useCreateEvent } from '../hooks/useCreateEvent'
import { CreateEventDto } from '../../application/dto/CreateEventDto'
import { Calendar, MapPin, Image, Tag, Users } from 'lucide-react'

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate()
  const { createEvent, loading } = useCreateEvent()
  
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

  const categories = [
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

    try {
      // Converter data local para ISO
      const dateISO = new Date(formData.date).toISOString()
      
      const event = await createEvent({
        ...formData,
        date: dateISO
      })

      toast.success('Evento criado com sucesso!')
      navigate(`/events/${event.id}`)
    } catch (err) {
      console.error('Erro ao criar evento:', err)
      toast.error('Erro ao criar evento. Verifique os dados e tente novamente.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Criar Novo Evento</h1>

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
                {categories.map(cat => (
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
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

