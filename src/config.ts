import { z } from 'zod'

const secrets = {
  TO_TOKEN: z.string(),
  BISTRO_TO_REF: z.string(),
  KULMA_TO_REF: z.string(),
} as const

export const requireSecret = (key: keyof typeof secrets): string => {
  return secrets[key].parse(process.env[key])
}
