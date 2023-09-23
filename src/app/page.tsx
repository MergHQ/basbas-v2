'use client'

import Availabilities from '@/components/availabilities'
import PersonPicker from '@/components/person-picker'
import { useState } from 'react'

export default function Home() {
  const [persons, setPersons] = useState(4)

  return (
    <main className="flex flex-col items-center justify-between">
      <PersonPicker onChange={setPersons} selected={persons} />
      <div className="flex z-10 max-w-2xl w-full justify-between font-mono text-sm lg:flex p-10">
        <Availabilities persons={persons} restaurant="bistro" />
        <Availabilities persons={persons} restaurant="kulma" />
      </div>
    </main>
  )
}
