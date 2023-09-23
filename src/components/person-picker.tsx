'use client'

const range = (from: number, to: number) =>
  new Array(to - from).fill(0).map((_, i) => from + i)

const PersonPicker = ({
  onChange,
  selected,
}: {
  onChange?: (n: number) => void
  selected: number
}) => {
  return (
    <div className="flex-col justify-items-center items-center text-center">
      <h3 className="text-red-700 font-mono text-xl">Persons</h3>
      <div className="inline-flex gap-3">
        {range(1, 8).map(n => (
          <button
            onClick={() => onChange?.(n)}
            className={`border-spacing-2 border-slate-700 border-2 p-2 ${
              n === selected ? 'bg-slate-700' : ''
            }`.trim()}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export default PersonPicker
