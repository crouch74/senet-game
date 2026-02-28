import type { AutoPlaySpeed } from '../../engine/autoPlay'

interface PromptLike {
  (message?: string, defaultValue?: string): string | null
}

interface DevAutoplayConfig {
  speed: AutoPlaySpeed
  turnsCount: number
}

const parseSpeed = (value: string): AutoPlaySpeed =>
  value === '1'
    ? 'human'
    : value === '2'
      ? 'quick'
      : value === '3'
        ? 'fast'
        : 'immediate'

export const getDevAutoplayConfig = (
  promptFn: PromptLike = window.prompt,
): DevAutoplayConfig | null => {
  const countInput = promptFn('How many turns to play?', '10')
  if (countInput === null) return null

  const turnsCount = Number.parseInt(countInput, 10)
  if (Number.isNaN(turnsCount) || turnsCount <= 0) return null

  const speedInput = promptFn(
    'Autoplay speed? (1=Human, 2=Quick, 3=Fast, 4=Immediate)',
    '2',
  )
  if (speedInput === null) return null

  return {
    turnsCount,
    speed: parseSpeed(speedInput.trim()),
  }
}
