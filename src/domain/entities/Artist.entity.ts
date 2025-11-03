import { z } from 'zod'

// Schema para imagens do Spotify
const SpotifyImageSchema = z.object({
  url: z.string().url(),
  height: z.number().optional(),
  width: z.number().optional(),
})

// Schema para álbuns
const SpotifyAlbumSchema = z.object({
  id: z.string(),
  name: z.string(),
  release_date: z.string(),
  total_tracks: z.number(),
  album_type: z.string(),
  images: z.array(SpotifyImageSchema),
})

// Schema para top tracks
const SpotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration_ms: z.number(),
  popularity: z.number(),
  preview_url: z.string().nullable().optional(),
  album: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(SpotifyImageSchema),
  }),
})

// Schema para informações do Spotify
const SpotifyDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  genres: z.array(z.string()).optional(),
  popularity: z.number().optional(),
  followers: z.object({
    total: z.number(),
    href: z.string().nullable().optional(),
  }).optional(),
  images: z.array(SpotifyImageSchema).optional(),
  external_urls: z.object({
    spotify: z.string().url(),
  }).optional(),
  topTracks: z.array(SpotifyTrackSchema).optional(),
  albums: z.array(SpotifyAlbumSchema).optional(),
  relatedArtists: z.array(z.any()).optional(),
})

// Schema para metadata
const MetadataSchema = z.object({
  artist: z.any().optional(),
  events: z.array(z.any()).optional(),
  spotify: SpotifyDataSchema.optional(),
  textContent: z.string().optional(),
}).optional()

export const ArtistSchema = z.object({
  id: z.string().uuid(),
  artisticName: z.string().min(1).max(255),
  name: z.union([z.string(), z.null()]).optional(),
  birthDate: z.union([z.string(), z.null()]).optional(),
  biography: z.union([z.string(), z.null()]).optional(),
  instagramUsername: z.union([z.string(), z.null()]).optional(),
  youtubeUsername: z.union([z.string(), z.null()]).optional(),
  xUsername: z.union([z.string(), z.null()]).optional(),
  spotifyUsername: z.union([z.string(), z.null()]).optional(),
  tiktokUsername: z.union([z.string(), z.null()]).optional(),
  siteUrl: z.union([z.string().url(), z.string(), z.null()]).optional(),
  image: z.union([z.string().url(), z.string(), z.null()]).optional(),
  metadata: MetadataSchema,
  spotify: SpotifyDataSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Artist = z.infer<typeof ArtistSchema>

export class ArtistEntity {
  constructor(private readonly data: Artist) {}

  get id(): string { return this.data.id }
  get artisticName(): string { return this.data.artisticName }
  get name(): string | undefined { return this.data.name ?? undefined }
  get birthDate(): string | undefined { return this.data.birthDate ?? undefined }
  get biography(): string | undefined { return this.data.biography ?? undefined }
  get instagramUsername(): string | undefined { return this.data.instagramUsername ?? undefined }
  get youtubeUsername(): string | undefined { return this.data.youtubeUsername ?? undefined }
  get xUsername(): string | undefined { return this.data.xUsername ?? undefined }
  get spotifyUsername(): string | undefined { return this.data.spotifyUsername ?? undefined }
  get tiktokUsername(): string | undefined { return this.data.tiktokUsername ?? undefined }
  get siteUrl(): string | undefined { return this.data.siteUrl ?? undefined }
  get image(): string | undefined { return this.data.image ?? undefined }
  get createdAt(): string { return this.data.createdAt }
  get updatedAt(): string { return this.data.updatedAt }

  hasBiography(): boolean {
    return !!this.data.biography && this.data.biography.length > 0
  }

  hasImage(): boolean {
    return !!this.data.image
  }

  hasSocialMedia(): boolean {
    return !!(
      this.data.instagramUsername ||
      this.data.youtubeUsername ||
      this.data.xUsername ||
      this.data.spotifyUsername ||
      this.data.tiktokUsername
    )
  }

  getSocialMediaLinks(): Record<string, string> {
    const links: Record<string, string> = {}
    
    if (this.data.instagramUsername) {
      links.instagram = `https://instagram.com/${this.data.instagramUsername.replace(/^@/, '')}`
    }
    if (this.data.youtubeUsername) {
      links.youtube = `https://youtube.com/${this.data.youtubeUsername.replace(/^@/, '')}`
    }
    if (this.data.xUsername) {
      links.x = `https://x.com/${this.data.xUsername.replace(/^@/, '')}`
    }
    if (this.data.spotifyUsername) {
      links.spotify = `https://open.spotify.com/artist/${this.data.spotifyUsername}`
    }
    if (this.data.tiktokUsername) {
      links.tiktok = `https://tiktok.com/@${this.data.tiktokUsername.replace(/^@/, '')}`
    }
    
    return links
  }

  toJSON(): Artist {
    return this.data
  }
}

