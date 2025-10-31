import { z } from 'zod'

// Transformar strings vazias em undefined
const emptyStringToUndefined = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.string().optional()
)

const urlOrEmpty = z.union([
  z.string().url('URL inválida'),
  z.literal(''),
  z.undefined()
]).transform(val => val === '' ? undefined : val)

export const CreateArtistDtoSchema = z.object({
  artisticName: z.string().min(1, 'Nome artístico é obrigatório').max(255, 'Nome artístico deve ter no máximo 255 caracteres'),
  name: z.string().min(3, 'Nome completo deve ter no mínimo 3 caracteres').max(200, 'Nome completo deve ter no máximo 200 caracteres').optional(),
  birthDate: z.string().optional(),
  biography: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().optional()
  ),
  instagramUsername: emptyStringToUndefined,
  youtubeUsername: emptyStringToUndefined,
  xUsername: emptyStringToUndefined,
  spotifyUsername: emptyStringToUndefined,
  tiktokUsername: emptyStringToUndefined,
  siteUrl: urlOrEmpty,
  image: urlOrEmpty,
})

export type CreateArtistDto = z.infer<typeof CreateArtistDtoSchema>

