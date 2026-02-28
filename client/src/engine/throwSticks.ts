import type { ThrowResult } from './types'

export function getFourStickThrow(random: () => number = Math.random): ThrowResult {
  let lightCount = 0

  for (let index = 0; index < 4; index += 1) {
    if (random() > 0.5) {
      lightCount += 1
    }
  }

  return {
    lightSidesUp: lightCount,
    value: lightCount === 0 ? 5 : lightCount,
  }
}
