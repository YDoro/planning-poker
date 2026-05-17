import { useEffect } from 'react'
import { finishGame } from '@/src/service/games'
import { Game } from '@/src/types/game'
import { Player } from '@/src/types/player'
import { Status } from '@/src/types/status'

type UseAutoRevealFinishGameArgs = {
  game: Game
  players: Player[]
}

export const useAutoRevealFinishGame = ({ game, players }: UseAutoRevealFinishGameArgs) => {
  useEffect(() => {
    if (
      game.autoReveal &&
      game.gameStatus === Status.InProgress &&
      Array.isArray(players) &&
      players.length > 0 &&
      players.every((p: Player) => p.status === Status.Finished)
    ) {
      finishGame(game.id)
    }
  }, [
    game.autoReveal,
    game,
    JSON.stringify(players.map((p) => ({ id: p.id, value: p.value, status: p.status }))),
  ])
}
