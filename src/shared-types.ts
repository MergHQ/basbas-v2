import { CamelCase } from './utils'

export type Restaurant = 'bistro' | 'kulma'

export type Availability = {
  date: string
  hours: {
    time: string
  }[]
  total_left_seats: number
}

export type AvailabilityCC = CamelCase<Availability>
