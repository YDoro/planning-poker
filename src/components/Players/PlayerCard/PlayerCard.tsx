import React, { useCallback } from 'react';
import { Game } from '../../../core/domain/entities/Game';
import { Player, PlayerStatus } from '../../../core/domain/entities/Player';
import { Task } from '../../../core/domain/entities/Task';
import { checkIsModerator } from '../../../core/use-cases/CheckIsModerator';
import { getCards } from '../CardPicker/CardConfigs';
import { Card } from '../../ui/card';
import { Text, MarqueeText } from '../../Typography';
import { Ban, Brain, Check, Minus, ThumbsUp, Vote, X } from 'lucide-react';
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

  const isRevealed = !!currentTask?.revealed || game.isFinished;

  const removeUser = (gameId: string, playerId: string) => {
    removePlayerAction(gameId, playerId);
  };

  const getCardColor = useCallback((value: number | undefined): string => {
    if (isRevealed) {
      const card = getCards(game.gameType).find((card) => card.value === value);
      return card ? card.color : '';
    }
    return '';
  }, [isRevealed, game.gameType]);

  const getCardDisplayValue = useCallback((cardValue: number | undefined): string => {
    const cards = game.cards?.length > 0 ? game.cards : getCards(game.gameType);
    return (
      cards.find((card) => card.value === cardValue)?.displayValue || cardValue?.toString() || ''
    );
  }, [game]);

  const getCardValue = useCallback(() => {
    if (isRevealed) {
      if (player.status === PlayerStatus.Finished) {
        if (player.value && player.value === -1) {
          return player.emoji || '☕'; // coffee emoji
        }
        return getCardDisplayValue(player.value);
      }
      return <Minus size={50} className='text-destructive' data-testid='minus-emoji' />;
    }

    if (player.isNonVoter) {
      return <Ban size={50} className='text-destructive' data-testid='ban-emoji' />;
    }

    if (player.status === PlayerStatus.Finished || player.isNonVoter) {
      return <Check className='text-green-800' size={50} data-testid='check-emoji' />;
    }

    return <Brain size={50} className='text-pink-300' data-testid='brain-emoji' />;
  }, [isRevealed, player, getCardDisplayValue]);

  return (
    <div id={`player-card-${player.id}-${isRevealed ? 'revealed' : 'hidden'}`} className='w-18 mb-1 2xl:w-25 flex flex-col items-center justify-around relative group'>
      <div className='flex w-full'>
        <MarqueeText className='text-left w-full font-semibold text-sm' title={player.name}>
          {player.name}
        </MarqueeText>
      </div>

      <div className="relative w-full mt-2">
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
          data-testid="player-card-ui"
          className={`w-full aspect-3/4 shadow-md rounded-md 2xl:rounded-lg ${isRevealed ? 'animate-card-flip' : ''}`}
          style={{
            backgroundColor: getCardColor(player.value),
          }}
        >
          <div className='flex items-center justify-center m-auto'>
            <Text className='text-5xl font-semibold'>
              {getCardValue()}
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

