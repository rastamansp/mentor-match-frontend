import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useArtists } from '../hooks/useArtists'
import { useAuth } from '../../contexts/AuthContext'
import { useImportSpotifyArtist } from '../hooks/useImportSpotifyArtist'
import { ArtistFilters } from '../../domain/repositories/IArtistRepository'
import { Search, Music, Plus, User, Import, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

export const ArtistsPage: React.FC = () => {
  const { user } = useAuth()
  const [filters, setFilters] = useState<ArtistFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const { artists, loading, error, refetch } = useArtists(filters)
  const { importArtist, loading: loadingImport } = useImportSpotifyArtist()
  const [showImportModal, setShowImportModal] = useState(false)
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  
  const isAdmin = user?.role === 'ADMIN'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, search: searchTerm || undefined })
  }

  const validateSpotifyUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError('URL do Spotify é obrigatória')
      return false
    }
    
    const spotifyUrlPattern = /^https?:\/\/(open\.)?spotify\.com\/.*artist\/[A-Za-z0-9]+/i
    if (!spotifyUrlPattern.test(url)) {
      setUrlError('URL inválida. Deve ser uma URL do Spotify do artista (ex: https://open.spotify.com/artist/...)')
      return false
    }
    
    setUrlError('')
    return true
  }

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateSpotifyUrl(spotifyUrl)) {
      return
    }

    try {
      await importArtist(spotifyUrl)
      toast.success('Artista importado do Spotify com sucesso!')
      setShowImportModal(false)
      setSpotifyUrl('')
      setUrlError('')
      // Recarregar lista de artistas
      await refetch()
      // Forçar atualização da página
      window.location.href = '/artists'
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao importar artista do Spotify'
      toast.error(errorMessage)
    }
  }

  const filteredArtists = useMemo(() => {
    if (!artists || !Array.isArray(artists)) {
      return []
    }
    return artists
  }, [artists])

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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error.message}</span>
          <button
            onClick={refetch}
            className="ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Artistas</h1>
            <p className="text-gray-600">Explore nossa galeria de artistas</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Import className="w-5 h-5" />
                Importar do Spotify
              </button>
              <Link
                to="/artists/create"
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Cadastrar Artista
              </Link>
            </div>
          )}
        </div>

        {/* Barra de Busca */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar artista por nome..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
            {filters.search && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setFilters({ ...filters, search: undefined })
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Grid de Artistas */}
      {filteredArtists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtists.map((artist) => (
            <div
              key={artist.id}
              className="card hover:shadow-lg transition-shadow"
            >
              {artist.image ? (
                <img
                  src={artist.image}
                  alt={artist.artisticName}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg mb-4 flex items-center justify-center">
                  <User className="w-24 h-24 text-white opacity-50" />
                </div>
              )}
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">{artist.artisticName}</h3>
                
                {artist.biography && (
                  <p className="text-gray-600 line-clamp-3 text-sm">{artist.biography}</p>
                )}

                <div className="flex items-center justify-between pt-4">
                  <Link
                    to={`/artists/${artist.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Ver Detalhes →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum artista encontrado.</p>
          {isAdmin && (
            <Link
              to="/artists/create"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              Cadastrar primeiro artista
            </Link>
          )}
        </div>
      )}

      {/* Modal de Importação do Spotify */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Import className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Importar do Spotify</h3>
                  <p className="text-sm text-gray-600">Insira a URL do artista no Spotify</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setSpotifyUrl('')
                  setUrlError('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loadingImport}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <form onSubmit={handleImportSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="spotifyUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL do Artista no Spotify
                </label>
                <input
                  type="text"
                  id="spotifyUrl"
                  value={spotifyUrl}
                  onChange={(e) => {
                    setSpotifyUrl(e.target.value)
                    if (urlError) setUrlError('')
                  }}
                  placeholder="https://open.spotify.com/artist/..."
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    urlError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loadingImport}
                />
                {urlError && (
                  <p className="mt-1 text-sm text-red-600">{urlError}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Exemplo: https://open.spotify.com/artist/0GWNKI3VPEcJsOIEhUjmxd
                </p>
              </div>

              {/* Botões do Modal */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false)
                    setSpotifyUrl('')
                    setUrlError('')
                  }}
                  disabled={loadingImport}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingImport}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingImport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Import className="w-4 h-4" />
                      Importar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

