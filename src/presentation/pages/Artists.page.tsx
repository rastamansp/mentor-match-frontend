import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useArtists } from '../hooks/useArtists'
import { ArtistFilters } from '../../domain/repositories/IArtistRepository'
import { Search, Music, Plus, User } from 'lucide-react'

export const ArtistsPage: React.FC = () => {
  const [filters, setFilters] = useState<ArtistFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const { artists, loading, error, refetch } = useArtists(filters)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, search: searchTerm || undefined })
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
          <Link
            to="/artists/create"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Cadastrar Artista
          </Link>
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
          <Link
            to="/artists/create"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
          >
            Cadastrar primeiro artista
          </Link>
        </div>
      )}
    </div>
  )
}

