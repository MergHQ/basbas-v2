type SnakeToCamelCase<S extends string | number | symbol> =
  S extends `${infer T}_${infer U}` ? `${T}${Capitalize<SnakeToCamelCase<U>>}` : S

export type CamelCase<T extends object> = {
  [K in keyof T as SnakeToCamelCase<K>]: T[K] extends (infer AT extends Object)[]
    ? Array<CamelCase<AT>>
    : T[K] extends Record<string, unknown>
    ? CamelCase<T[K]>
    : T[K]
}

const capitalize = (word: string): string => {
  const [firstLetter, ...tail] = word.split('')

  return `${firstLetter.toUpperCase()}${tail.join('')}`
}

export const unSnake = <T extends object>(obj: T): CamelCase<T> => {
  return Object.entries(obj).reduce((p, kv) => {
    const [keyWord, value] = kv
    const [head, ...tail] = keyWord.split('_')
    const newKw = `${head}${tail.map(capitalize).join('')}`
    const shouldUnSnakeArray = Array.isArray(value)
    const shouldUnSnakeValue =
      typeof value === 'object' && value !== null && value !== undefined
    return {
      ...p,
      [newKw]: shouldUnSnakeArray
        ? value.map(unSnake)
        : shouldUnSnakeValue
        ? unSnake(value)
        : value,
    }
  }, {}) as CamelCase<T>
}
