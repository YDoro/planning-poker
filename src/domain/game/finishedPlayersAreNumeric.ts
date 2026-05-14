import { Game, GameType } from '@/src/types/game'
import { Player } from '@/src/types/player'
import { Status } from '@/src/types/status'

export const areAllFinishedPlayersDisplayValuesNumeric = (
  game: Game,
  players: Player[],
): boolean =>
  players
    .filter((player) => player.status === Status.Finished)
    .every((player) => {
      const value =
        game.gameType === GameType.Custom
          ? Number(game.cards.find((card) => card.value === player.value)?.displayValue)
          : player.value

      if (!value) return false
      const num = typeof value === 'number' ? value : Number(value)
      return !isNaN(num)
    })
