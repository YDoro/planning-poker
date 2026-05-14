import React from 'react';
import { removePlayer } from '../../../service/players';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { isModerator } from '../../../utils/isModerator';
import { TrashSVG } from '../../SVGs/Trash';
import { getCards } from '../CardPicker/CardConfigs';
import { Card } from '../../ui/card';
import { Text, MarqueeText } from '../../Typography';
import { Cross, Trash2, X } from 'lucide-react';
import { Button } from '../../ui/button';

interface PlayerCardProps {
  game: Game;
  player: Player;
  currentPlayerId: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ game, player, currentPlayerId }) => {
  const removeUser = (gameId: string, playerId: string) => {
    removePlayer(gameId, playerId);
  };

  return (

    <div className='w-25 flex flex-col items-center justify-around relative group'>
      <div className='flex w-full'>
        <MarqueeText className='text-center w-full font-semibold text-sm py-2' title={player.name}>
          {player.name}
        </MarqueeText>
      </div>

      <div className="relative w-full">
        {isModerator(game.createdById, currentPlayerId, game.isAllowMembersToManageSession) &&
          player.id !== currentPlayerId && (
            <Button
              title='Remove'
              variant='ghost'
              size='icon'
              onClick={() => removeUser(game.id, player.id)}
              data-testid='remove-button'
              className='absolute -top-1 -right-1 text-destructive z-30'
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        <Card
          className='w-full aspect-3/4 shadow-md'
          style={{
            backgroundColor: getCardColor(game, player.value),
          }}
        >
          <div className='flex items-center justify-center m-auto'>
            <Text className='text-5xl font-semibold'>
              {getCardValue(player, game)}
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

const getCardColor = (game: Game, value: number | undefined): string => {
  if (game.gameStatus == Status.Finished) {
    const card = getCards(game.gameType).find((card) => card.value === value);
    return card ? card.color : '';
  }
  return '';
};

const getCardValue = (player: Player, game: Game) => {
  if (game.gameStatus !== Status.Finished) {
    return player.status === Status.Finished ? '👍' : '🤔';
  }

  if (game.gameStatus === Status.Finished) {
    if (player.status === Status.Finished) {
      if (player.value && player.value === -1) {
        return player.emoji || '☕'; // coffee emoji
      }
      return getCardDisplayValue(game, player.value);
    }
    return '🤔';
  }
  return '';
};

const getCardDisplayValue = (game: Game, cardValue: number | undefined): string => {
  const cards = game.cards?.length > 0 ? game.cards : getCards(game.gameType);
  return (
    cards.find((card) => card.value === cardValue)?.displayValue || cardValue?.toString() || ''
  );
};
