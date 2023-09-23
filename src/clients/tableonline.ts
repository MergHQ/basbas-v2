import { requireSecret } from '@/config'
import { Availability, Restaurant } from '@/shared-types'
import { CamelCase, unSnake } from '@/utils'
import { kv } from '@vercel/kv'
import axios from 'axios'
import { format, startOfMonth } from 'date-fns'

type DailyAvailability = {
  date: string
  status: 'out_of_bookable_range' | 'available' | 'closed'
}

const BASE_URL = 'https://api.tableonline.fi/v3/'

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Token': requireSecret('TO_TOKEN'),
  },
})

const getReferral = (restaurant: Restaurant) => {
  switch (restaurant) {
    case 'kulma':
      return requireSecret('KULMA_TO_REF')
    default:
    case 'bistro':
      return requireSecret('BISTRO_TO_REF')
  }
}

const createRedisKey = (restaurant: Restaurant, persons: number, startDate: string) =>
  `${restaurant}_${persons}_${startDate}`

const getDailyAvailabilities = async (
  restaurant: Restaurant,
  persons: number,
  startDate: string = format(startOfMonth(new Date()), 'yyyy-MM-dd')
) => {
  const maybeCached = await kv.get<Availability[]>(
    createRedisKey(restaurant, persons, startDate)
  )

  if (maybeCached) {
    return maybeCached
  }

  console.log('refreshing cache with', { restaurant, persons, startDate })
  const { dailyAvailabilities } = await client
    .get<Record<'daily_availabilities', CamelCase<DailyAvailability[]>>>(
      'daily_availabilities',
      {
        params: {
          persons,
          start_date: startDate,
        },
        headers: {
          'Referral-Key': getReferral(restaurant),
        },
      }
    )
    .then(r => unSnake(r.data))
  const relevantDates = dailyAvailabilities.filter(
    ({ status }) => status !== 'out_of_bookable_range'
  )

  const availabilities = await Promise.all(
    relevantDates.map(({ date }) =>
      client
        .get<CamelCase<Record<'periods', Availability[]>>>('/periods', {
          params: {
            persons,
            date,
            show_empty_periods: true,
            locale: 'en',
            'expands[]': 'prepayment_hours_info',
          },
          headers: { 'Referral-Key': getReferral(restaurant) },
        })
        .then(({ data }) => unSnake(data))
    )
  ).then(avbs =>
    avbs
      .flatMap(a => a.periods)
      .map(a => ({
        date: a.date,
        totalSeatsLeft: a.totalLeftSeats,
        hours: a.hours.map(h => ({ time: h.time })),
      }))
  )

  await kv.set(createRedisKey(restaurant, persons, startDate), availabilities, { ex: 60 })

  return availabilities
}

export const getDailyAvailabilitiesCached = getDailyAvailabilities
