import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useUpdateArtist } from '../hooks/useUpdateArtist'
import { useArtistDetail } from '../hooks/useArtistDetail'
import { CreateArtistDto } from '../../application/dto/CreateArtistDto'
import { Globe, Instagram, Youtube, Twitter, Music, Calendar, ArrowLeft, Image } from 'lucide-react'
import { Link } from 'react-router-dom'

export const EditArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { artist, loading: loadingArtist, error: errorArtist } = useArtistDetail(id || '')
  const { updateArtist, loading: loadingUpdate } = useUpdateArtist()
  
  const [formData, setFormData] = useState<CreateArtistDto>({
    artisticName: '',
    name: '',
    birthDate: '',
    biography: '',
    instagramUsername: '',
    youtubeUsername: '',
    xUsername: '',
    spotifyUsername: '',
    tiktokUsername: '',
    siteUrl: '',
    image: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preencher formulário quando o artista for carregado
  useEffect(() => {
    if (artist) {
      setFormData({
        artisticName: artist.artisticName || '',
        name: artist.name || '',
        birthDate: artist.birthDate || '',
        biography: artist.biography || '',
        instagramUsername: artist.instagramUsername || '',
        youtubeUsername: artist.youtubeUsername || '',
        xUsername: artist.xUsername || '',
        spotifyUsername: artist.spotifyUsername || '',
        tiktokUsername: artist.tiktokUsername || '',
        siteUrl: artist.siteUrl || '',
        image: artist.image || '',
      })
    }
  }, [artist])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    if (!formData.artisticName.trim()) {
      newErrors.artisticName = 'Nome artístico é obrigatório'
    } else if (formData.artisticName.length > 255) {
      newErrors.artisticName = 'Nome artístico deve ter no máximo 255 caracteres'
    }

    if (formData.siteUrl && formData.siteUrl.length > 0) {
      try {
        new URL(formData.siteUrl)
      } catch {
        newErrors.siteUrl = 'URL do site inválida'
      }
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

    try {
      // Limpar campos vazios antes de enviar
      const dataToSend: Partial<CreateArtistDto> = {
        artisticName: formData.artisticName.trim(),
        name: formData.name?.trim() || undefined,
        birthDate: formData.birthDate?.trim() || undefined,
        biography: formData.biography?.trim() || undefined,
        instagramUsername: formData.instagramUsername?.trim() || undefined,
        youtubeUsername: formData.youtubeUsername?.trim() || undefined,
        xUsername: formData.xUsername?.trim() || undefined,
        spotifyUsername: formData.spotifyUsername?.trim() || undefined,
        tiktokUsername: formData.tiktokUsername?.trim() || undefined,
        siteUrl: formData.siteUrl?.trim() || undefined,
        image: formData.image?.trim() || undefined,
      }

      await updateArtist(id || '', dataToSend)
      toast.success('Artista atualizado com sucesso!')
      navigate(`/artists/${id}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar artista'
      toast.error(errorMessage)
    }
  }

  if (loadingArtist) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (errorArtist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar artista</h2>
        <p className="text-gray-600 mb-6">{errorArtist.message}</p>
        <button
          onClick={() => navigate('/artists')}
          className="btn-primary"
        >
          Voltar para Artistas
        </button>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Artista não encontrado</h2>
        <p className="text-gray-600 mb-6">O artista que você está procurando não existe.</p>
        <button
          onClick={() => navigate('/artists')}
          className="btn-primary"
        >
          Voltar para Artistas
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link
          to={`/artists/${id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Detalhes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Artista</h1>
        <p className="text-gray-600">Atualize os dados do artista abaixo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome Artístico e Nome Completo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="artisticName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Artístico *
            </label>
            <input
              type="text"
              id="artisticName"
              name="artisticName"
              value={formData.artisticName}
              onChange={handleChange}
              placeholder="Ex: João Silva"
              maxLength={255}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.artisticName ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.artisticName && <p className="text-red-500 text-xs mt-1">{errors.artisticName}</p>}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Nome completo do artista"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Data de Nascimento */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data de Nascimento
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Biografia */}
        <div>
          <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">
            Biografia
          </label>
          <textarea
            id="biography"
            name="biography"
            value={formData.biography || ''}
            onChange={handleChange}
            placeholder="Conte um pouco sobre o artista..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Imagem e Site URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <p className="text-xs text-gray-500 mt-1">URL da foto do artista</p>
          </div>

          <div>
            <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 mb-1">
              <Globe className="w-4 h-4 inline mr-1" />
              URL do Site
            </label>
            <input
              type="url"
              id="siteUrl"
              name="siteUrl"
              value={formData.siteUrl || ''}
              onChange={handleChange}
              placeholder="https://artista.com"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.siteUrl ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.siteUrl && <p className="text-red-500 text-xs mt-1">{errors.siteUrl}</p>}
          </div>
        </div>

        {/* Redes Sociais */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociais (Username)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="instagramUsername" className="block text-sm font-medium text-gray-700 mb-1">
                <Instagram className="w-4 h-4 inline mr-1" />
                Instagram Username
              </label>
              <input
                type="text"
                id="instagramUsername"
                name="instagramUsername"
                value={formData.instagramUsername || ''}
                onChange={handleChange}
                placeholder="artistname"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Apenas o username, sem @ ou URL</p>
            </div>

            <div>
              <label htmlFor="youtubeUsername" className="block text-sm font-medium text-gray-700 mb-1">
                <Youtube className="w-4 h-4 inline mr-1" />
                YouTube Username
              </label>
              <input
                type="text"
                id="youtubeUsername"
                name="youtubeUsername"
                value={formData.youtubeUsername || ''}
                onChange={handleChange}
                placeholder="artistname"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Apenas o username</p>
            </div>

            <div>
              <label htmlFor="xUsername" className="block text-sm font-medium text-gray-700 mb-1">
                <Twitter className="w-4 h-4 inline mr-1" />
                X (Twitter) Username
              </label>
              <input
                type="text"
                id="xUsername"
                name="xUsername"
                value={formData.xUsername || ''}
                onChange={handleChange}
                placeholder="artistname"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Apenas o username, sem @</p>
            </div>

            <div>
              <label htmlFor="spotifyUsername" className="block text-sm font-medium text-gray-700 mb-1">
                <Music className="w-4 h-4 inline mr-1" />
                Spotify Username
              </label>
              <input
                type="text"
                id="spotifyUsername"
                name="spotifyUsername"
                value={formData.spotifyUsername || ''}
                onChange={handleChange}
                placeholder="artistname"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Apenas o username</p>
            </div>

            <div>
              <label htmlFor="tiktokUsername" className="block text-sm font-medium text-gray-700 mb-1">
                TikTok Username
              </label>
              <input
                type="text"
                id="tiktokUsername"
                name="tiktokUsername"
                value={formData.tiktokUsername || ''}
                onChange={handleChange}
                placeholder="artistname"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Apenas o username, sem @</p>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loadingUpdate}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingUpdate ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/artists/${id}`)}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

