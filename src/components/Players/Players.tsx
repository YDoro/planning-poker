import React from 'react';
import { Game } from '../../types/game';
import { Player } from '../../types/player';
import { PlayerCard } from './PlayerCard/PlayerCard';
import { HorizontalScroll } from '../ui/horizontal-scroll';

interface PlayersProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
}
export const Players: React.FC<PlayersProps> = ({ game, players, currentPlayerId }) => {
  return (
    <div className='flex flex-col items-center justify-center w-full'>
      <HorizontalScroll className='justify-center items-center gap-2 pt-8'>
        {players.map((player: Player) => (
          <PlayerCard
            key={player.id}
            game={game}
            player={player}
            currentPlayerId={currentPlayerId}
          />
        ))}
      </HorizontalScroll>
    </div>
  );
};
