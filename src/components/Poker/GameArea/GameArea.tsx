import React from 'react';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';
import { CardPicker } from '../../Players/CardPicker/CardPicker';
import { Players } from '../../Players/Players';
import { GameTopBar } from '../GameController/GameTopBar';
import { GameBoard } from '../GameController/GameBoard';
import { isModerator } from '../../../utils/isModerator';
import { updateStoryName } from '../../../service/games';

interface GameAreaProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
}
export const GameArea: React.FC<GameAreaProps> = ({ game, players, currentPlayerId }) => {
  const isMod = isModerator(game.createdById, currentPlayerId, game.isAllowMembersToManageSession);

  return (
    <>
      <GameTopBar game={game} players={players} currentPlayerId={currentPlayerId} />
      <div className='flex flex-col min-h-[60%] overflow-auto p-0.5 justify-center'>
        <Players game={game} players={players} currentPlayerId={currentPlayerId} />
        <GameBoard 
          className="mt-6" 
          stories={[{ cod: 'active', title: game.storyName || '', description: '' }]} 
          game={game}
          players={players}
          isModerator={isMod}
          onStoryNameChange={(name) => updateStoryName(game.id, name)}
          onAddStory={() => { }} 
        />
      </div>
      <div className='text-center flex justify-center absolute bottom-4 w-full'>
        <CardPicker game={game} players={players} currentPlayerId={currentPlayerId} />
      </div>
    </>
  );
};

export default GameArea;
