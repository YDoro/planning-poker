import React, { useCallback } from 'react';
import { Game } from '../../../core/domain/entities/Game';
import { Player } from '../../../core/domain/entities/Player';
import { TimerProps as GameTimerProps } from '../../../types/game';
import { CardPicker } from '../../Players/CardPicker/CardPicker';
import { Players } from '../../Players/Players';
import { GameTopBar } from '../GameController/GameTopBar';
import { GameBoard } from '../GameController/GameBoard';
import { Timer } from '../GameController/Timer/TimerInput/Timer';
import { checkIsModerator } from '../../../core/use-cases/CheckIsModerator';
import { useGameStore } from '../../../presentation/stores/useGameStore';

interface GameAreaProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
}
export const GameArea: React.FC<GameAreaProps> = ({ game, players, currentPlayerId }) => {
  const isMod = checkIsModerator.execute({
    moderatorId: game.createdById,
    currentPlayerId,
    isAllowMembersToManageSession: game.isAllowMembersToManageSession,
  });
  const updateGameAction = useGameStore((state) => state.updateGame);

  const handleTimerUpdate = useCallback(
    (timer: GameTimerProps) => {
      if (!isMod) return;
      updateGameAction(game.id, { timerProps: timer });
    },
    [isMod, game.id, updateGameAction],
  );

  return (
    <>
      <GameTopBar game={game} currentPlayerId={currentPlayerId} />
      <Timer
        variant='overlay'
        timerProps={{
          ...(game.timerProps || {}),
          isMod,
        }}
        onTimerUpdate={handleTimerUpdate}
      />
      <div className='flex flex-col md:flex-row p-2 md:p-4 overflow-hidden pb-26 md:pb-2'>
        <div className='flex-1 flex flex-col overflow-auto p-0.5 justify-start md:justify-center relative pb-32'>
          <Players game={game} players={players} currentPlayerId={currentPlayerId} />
          <GameBoard
            className='mt-2 2xl:mt-4'
            game={game}
            players={players}
            isModerator={isMod}
          />
          <div className='text-center flex justify-center absolute w-full'>
            <CardPicker game={game} players={players} currentPlayerId={currentPlayerId} />
          </div>
        </div>
      </div>
    </>
  );
};

export default GameArea;
