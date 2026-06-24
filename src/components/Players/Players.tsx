import React from 'react';
import { Game } from '../../core/domain/entities/Game';
import { Player } from '../../core/domain/entities/Player';
import { PlayerCard } from './PlayerCard/PlayerCard';
import { HorizontalScroll } from '../ui/horizontal-scroll';
import { useGameStore } from '../../presentation/stores/useGameStore';

interface PlayersProps {
  currentPlayerId: string;
}
export const Players: React.FC<PlayersProps> = ({ currentPlayerId }) => {
  const game = useGameStore(state => state.game);
  const players = useGameStore(state => state.players);

  if (!game) return null;

  return (
    <div className='flex flex-col items-center justify-center w-full'>
      <HorizontalScroll className='justify-center items-center gap-2'>
        {players.map((player: Player) => (
          <PlayerCard
            key={player.id}
            player={player}
            currentPlayerId={currentPlayerId}
          />
        ))}
      </HorizontalScroll>
    </div>
  );
};
