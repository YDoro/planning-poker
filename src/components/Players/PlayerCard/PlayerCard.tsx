import React from 'react';
import { Game } from '../../../core/domain/entities/Game';
import { Player, PlayerStatus } from '../../../core/domain/entities/Player';
import { Task } from '../../../core/domain/entities/Task';
import { checkIsModerator } from '../../../core/use-cases/CheckIsModerator';
import { getCards } from '../CardPicker/CardConfigs';
import { Card } from '../../ui/card';
import { Text, MarqueeText } from '../../Typography';
import { X } from 'lucide-react';
import { Button } from '../../ui/button';
import { useGameStore } from '../../../presentation/stores/useGameStore';

interface PlayerCardProps {
  game: Game;
  player: Player;
  currentPlayerId: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ game, player, currentPlayerId }) => {
  const storeGame = useGameStore((state) => state.game);
  const activeGame = game || storeGame;
  const currentTask = activeGame?.tasks?.find((t) => t.id === activeGame?.currentTaskId);
  const removePlayerAction = useGameStore((state) => state.removePlayer);

  const removeUser = (gameId: string, playerId: string) => {
    removePlayerAction(gameId, playerId);
  };

  return (
    <div className='w-25 flex flex-col items-center justify-around relative group'>
      <div className='flex w-full'>
        <MarqueeText className='text-left w-full font-semibold text-sm py-2' title={player.name}>
          {player.name}
        </MarqueeText>
      </div>

      <div className="relative w-full">
        {checkIsModerator.execute({
          moderatorId: game.createdById,
          currentPlayerId,
          isAllowMembersToManageSession: game.isAllowMembersToManageSession,
        }) &&
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
          className='w-full aspect-3/4 shadow-md mb-1'
          style={{
            backgroundColor: getCardColor(game, player.value),
          }}
        >
          <div className='flex items-center justify-center m-auto'>
            <Text className='text-5xl font-semibold'>
              {getCardValue(player, game, currentTask)}
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

const getCardColor = (game: Game, value: number | undefined): string => {
  if (game.isFinished) {
    const card = getCards(game.gameType).find((card) => card.value === value);
    return card ? card.color : '';
  }
  return '';
};

const getCardValue = (player: Player, game: Game, currentTask: Task | undefined) => {
  const isRevealed = !!currentTask?.revealed || game.isFinished;

  if (isRevealed) {
    if (player.status === PlayerStatus.Finished) {
      if (player.value && player.value === -1) {
        return player.emoji || '☕'; // coffee emoji
      }
      return getCardDisplayValue(game, player.value);
    }
    return '🤔';
  }

  if (player.status === PlayerStatus.Finished || player.isNonVoter) {
    return '👍';
  }

  return '🤔';
};

const getCardDisplayValue = (game: Game, cardValue: number | undefined): string => {
  const cards = game.cards?.length > 0 ? game.cards : getCards(game.gameType);
  return (
    cards.find((card) => card.value === cardValue)?.displayValue || cardValue?.toString() || ''
  );
};

