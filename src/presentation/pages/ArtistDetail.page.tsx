import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useArtistDetail } from '../hooks/useArtistDetail'
import { useAuth } from '../../contexts/AuthContext'
import { Globe, Instagram, Youtube, Twitter, Music, User, ArrowLeft, Edit, Calendar } from 'lucide-react'

export const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { artist, loading, error } = useArtistDetail(id || '')
  const [imageError, setImageError] = useState(false)

  // Resetar erro de imagem quando o artista mudar
  useEffect(() => {
    setImageError(false)
  }, [artist?.id])

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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar artista</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <Link
          to="/artists"
          className="btn-primary inline-block"
        >
          Voltar para Artistas
        </Link>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Artista não encontrado</h2>
        <p className="text-gray-600 mb-6">O artista que você está procurando não existe.</p>
        <Link
          to="/artists"
          className="btn-primary inline-block"
        >
          Voltar para Artistas
        </Link>
      </div>
    )
  }

  // Construir links das redes sociais a partir dos usernames
  const socialLinks: Record<string, string> = {}
  if (artist.instagramUsername) {
    socialLinks.instagram = `https://instagram.com/${artist.instagramUsername.replace(/^@/, '')}`
  }
  if (artist.youtubeUsername) {
    socialLinks.youtube = `https://youtube.com/${artist.youtubeUsername.replace(/^@/, '')}`
  }
  if (artist.xUsername) {
    socialLinks.x = `https://x.com/${artist.xUsername.replace(/^@/, '')}`
  }
  if (artist.spotifyUsername) {
    socialLinks.spotify = `https://open.spotify.com/artist/${artist.spotifyUsername}`
  }
  if (artist.tiktokUsername) {
    socialLinks.tiktok = `https://tiktok.com/@${artist.tiktokUsername.replace(/^@/, '')}`
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Botões de Navegação */}
      <div className="flex justify-between items-center">
        <Link
          to="/artists"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Artistas
        </Link>
        {user && (
          <Link
            to={`/artists/${id}/edit`}
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Link>
        )}
      </div>

      {/* Header do Artista */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagem */}
        <div>
          {artist.image && !imageError ? (
            <img
              src={artist.image}
              alt={artist.artisticName}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center">
              <User className="w-32 h-32 text-white opacity-50" />
            </div>
          )}
        </div>
        
        {/* Informações */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{artist.artisticName}</h1>
            {artist.name && artist.name !== artist.artisticName && (
              <p className="text-lg text-gray-600 mb-2">Nome completo: {artist.name}</p>
            )}
            {artist.birthDate && (
              <div className="flex items-center text-gray-600 mb-4">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="text-lg">Nascido em {formatDate(artist.birthDate)}</span>
              </div>
            )}
          </div>

          {artist.biography && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Sobre</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{artist.biography}</p>
            </div>
          )}

          {/* Links e Redes Sociais */}
          <div className="space-y-4">
            {artist.siteUrl && (
              <a
                href={artist.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Globe className="w-5 h-5 mr-2" />
                <span>Website Oficial</span>
              </a>
            )}

            {(Object.keys(socialLinks).length > 0) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Redes Sociais</h3>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      <Instagram className="w-5 h-5 mr-2" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Youtube className="w-5 h-5 mr-2" />
                      <span>YouTube</span>
                    </a>
                  )}
                  {socialLinks.x && (
                    <a
                      href={socialLinks.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-900 hover:text-black transition-colors"
                    >
                      <Twitter className="w-5 h-5 mr-2" />
                      <span>X (Twitter)</span>
                    </a>
                  )}
                  {socialLinks.spotify && (
                    <a
                      href={socialLinks.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Music className="w-5 h-5 mr-2" />
                      <span>Spotify</span>
                    </a>
                  )}
                  {socialLinks.tiktok && (
                    <a
                      href={socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-900 hover:text-black transition-colors"
                    >
                      <span className="text-lg mr-2">🎵</span>
                      <span>TikTok</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Informações Adicionais */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <p>Cadastrado em {formatDate(artist.createdAt)}</p>
            {artist.updatedAt && artist.updatedAt !== artist.createdAt && (
              <p className="mt-1">Atualizado em {formatDate(artist.updatedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
