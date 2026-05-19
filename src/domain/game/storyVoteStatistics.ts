import { Game } from '@/src/core/domain/entities/Game'
import { Player, PlayerStatus } from '@/src/core/domain/entities/Player'

export type StoryVoteStatistics = {
  averageFormatted: string
  modeFormatted: string
  closestFormatted: string
}

export const computeStoryVoteStatistics = (
  game: Game,
  players: Player[],
): StoryVoteStatistics | null => {
  const finishedPlayers = players.filter(
    (p) => p.status === PlayerStatus.Finished && p.value !== undefined,
  )
  if (finishedPlayers.length === 0) return null

  const values = finishedPlayers
    .map((p) => (typeof p.value === 'number' ? p.value : Number(p.value)))
    .filter((v) => !isNaN(v))
  if (values.length === 0) return null

  const avg = values.reduce((a, b) => a + b, 0) / values.length

  const counts = new Map<number, number>()
  values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1))
  let maxCount = 0
  let mode: number[] = []
  counts.forEach((count, val) => {
    if (count > maxCount) {
      maxCount = count
      mode = [val]
    } else if (count === maxCount) {
      mode.push(val)
    }
  })

  const availableValues = game.cards
    .map((c) => Number(c.value))
    .filter((v) => !isNaN(v))
    .sort((a, b) => a - b)

  let closest = availableValues[0]
  let minDiff = Math.abs(avg - closest)

  for (const val of availableValues) {
    const diff = Math.abs(avg - val)
    if (diff < minDiff) {
      minDiff = diff
      closest = val
    } else if (Math.abs(diff - minDiff) < 0.0001) {
      if (val > closest) {
        closest = val
      }
    }
  }

  return {
    averageFormatted: avg.toFixed(1),
    modeFormatted: mode.join(', '),
    closestFormatted: String(closest),
  }
}
