import { getDailyAvailabilitiesCached } from '@/clients/tableonline'
import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

const RequestSchema = z.object({
  restaurant: z.union([z.literal('bistro'), z.literal('kulma')]),
  persons: z.preprocess(Number, z.number().min(1).max(8)),
})

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { restaurant, persons } = RequestSchema.parse(req.query)

  getDailyAvailabilitiesCached(restaurant, persons).then(res.status(200).json)
}
