import React, { useCallback, useEffect, useState } from 'react';
import { Game } from '../../../core/domain/entities/Game';
import { Player } from '../../../core/domain/entities/Player';
import { TimerProps as GameTimerProps } from '../../../types/game';
import { CardPicker } from '../../Players/CardPicker/CardPicker';
import { Players } from '../../Players/Players';
import { GameTopBar } from '../GameController/GameTopBar';
import { GameBoard } from '../GameController/GameBoard';
import { Timer } from '../GameController/Timer/TimerInput/Timer';
import { useGameStore } from '../../../presentation/stores/useGameStore';
import { GoogleAd } from '../../GoogleAd/GoogleAd';
import { adsMap } from '@/src/config/ads';

interface GameAreaProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
}
export const GameArea: React.FC<GameAreaProps> = ({ game, players, currentPlayerId }) => {
  const updateGameAction = useGameStore((state) => state.updateGame);
  const isModerator = useGameStore((state) => state.isModerator);
  const isMod = isModerator(currentPlayerId);
  const [hasForcedScrollOnce, setHasForcedScrollOnce] = useState(false);

  useEffect(() => {
    if (hasForcedScrollOnce) return;
    const timeout = setTimeout(() => {
      setHasForcedScrollOnce(true);
    }, 1000);
    window.scrollTo({ behavior: "smooth", top: 60 }) // force scroll to bottom when game load
    return () => clearTimeout(timeout);
  }, [game])

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
          <Players currentPlayerId={currentPlayerId} />
          <GameBoard
            isModerator={isMod}
          />
          <div className='text-center flex justify-center absolute w-full'>
            <CardPicker game={game} players={players} currentPlayerId={currentPlayerId} />
          </div>
        </div>
        <GoogleAd slot={adsMap.gameLeft} className='relative max-h-32 mb-26 md:pb-0 md:absolute md:left-0 md:max-w-32 md:max-h-2/3' />
      </div>
    </>
  );
};

export default GameArea;
