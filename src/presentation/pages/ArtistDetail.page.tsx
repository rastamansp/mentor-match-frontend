import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useArtistDetail } from '../hooks/useArtistDetail'
import { useAuth } from '../../contexts/AuthContext'
import { Globe, Instagram, Youtube, Twitter, Music, User, ArrowLeft, Edit, Calendar, Disc, Play, ExternalLink } from 'lucide-react'

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

  // Obter dados do Spotify (pode vir de metadata.spotify ou spotify no nível raiz)
  const spotifyData = (artist as any)?.spotify || (artist as any)?.metadata?.spotify || null

  // Formatar duração da música
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Obter imagem do álbum (melhor qualidade disponível)
  const getAlbumImage = (images: any[]): string => {
    if (!images || images.length === 0) return ''
    // Priorizar 300x300, depois 640x640, depois qualquer outra
    const image300 = images.find(img => img.width === 300 || img.height === 300)
    const image640 = images.find(img => img.width === 640 || img.height === 640)
    return image300?.url || image640?.url || images[0]?.url || ''
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
        {user && user.role === 'ADMIN' && (
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

      {/* Seção Spotify */}
      {spotifyData && (
        <div className="mt-12 space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">No Spotify</h2>
                {spotifyData.external_urls?.spotify && (
                  <a
                    href={spotifyData.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 mt-1"
                  >
                    Ouvir no Spotify
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Informações Gerais do Spotify */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {spotifyData.followers?.total !== undefined && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Seguidores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {spotifyData.followers.total.toLocaleString('pt-BR')}
                </p>
              </div>
            )}
            {spotifyData.popularity !== undefined && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Popularidade</p>
                <p className="text-2xl font-bold text-gray-900">{spotifyData.popularity}/100</p>
              </div>
            )}
            {spotifyData.genres && spotifyData.genres.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Gêneros</p>
                <div className="flex flex-wrap gap-2">
                  {spotifyData.genres.slice(0, 3).map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Tracks */}
          {spotifyData.topTracks && spotifyData.topTracks.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Músicas Populares</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spotifyData.topTracks.slice(0, 6).map((track: any) => {
                  const trackUrl = track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`
                  return (
                    <a
                      key={track.id}
                      href={trackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer block"
                    >
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          {getAlbumImage(track.album?.images || []) ? (
                            <img
                              src={getAlbumImage(track.album?.images || [])}
                              alt={track.album?.name || track.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                              <Music className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity rounded">
                            <Play className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{track.name}</p>
                          <p className="text-sm text-gray-600 truncate">{track.album?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{formatDuration(track.duration_ms)}</span>
                            {track.popularity && (
                              <span className="text-xs text-gray-500">• Popularidade: {track.popularity}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Álbuns */}
          {spotifyData.albums && spotifyData.albums.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Discografia</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {spotifyData.albums.map((album: any) => {
                  const albumImage = getAlbumImage(album.images || [])
                  const albumUrl = album.external_urls?.spotify || `https://open.spotify.com/album/${album.id}`
                  return (
                    <a
                      key={album.id}
                      href={albumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block"
                    >
                      {albumImage ? (
                        <img
                          src={albumImage}
                          alt={album.name}
                          className="w-full aspect-square object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gray-200 flex items-center justify-center">
                          <Disc className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                          {album.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="capitalize">{album.album_type}</span>
                          <span>•</span>
                          <span>{new Date(album.release_date).getFullYear()}</span>
                          {album.total_tracks && (
                            <>
                              <span>•</span>
                              <span>{album.total_tracks} faixas</span>
                            </>
                          )}
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
