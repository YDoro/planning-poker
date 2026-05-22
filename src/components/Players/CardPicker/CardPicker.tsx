import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Game } from '../../../core/domain/entities/Game';
import { Player } from '../../../core/domain/entities/Player';
import { CardConfig, getCards, getRandomEmoji } from './CardConfigs';
import { HorizontalScroll } from '../../ui/horizontal-scroll';
import { PokerCard } from './PokerCard';
import { useGameStore } from '../../../presentation/stores/useGameStore';

interface CardPickerProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
}

export const CardPicker: React.FC<CardPickerProps> = ({ game, players, currentPlayerId }) => {
  const { t } = useTranslation();
  const [randomEmoji, setRandomEmoji] = useState(getRandomEmoji);
  const voteOnTask = useGameStore((state) => state.voteOnTask);
  const storeGame = useGameStore((state) => state.game);
  const activeGame = game || storeGame;
  const currentTask = activeGame?.tasks?.find((t) => t.id === activeGame?.currentTaskId);

  const playPlayer = async (gameId: string, playerId: string, card: CardConfig) => {
    if (!game.isFinished && currentTask?.status === 'voting') {
      await voteOnTask(gameId, playerId, card.value, randomEmoji);
    }
  };

  useEffect(() => {
    if (!game.isFinished) {
      setRandomEmoji(getRandomEmoji);
    }
  }, [game.isFinished]);

  const cards = game.cards?.length ? game.cards : getCards(game.gameType);

  return (
    <div className='fixed bottom-0 w-full max-w-full animate-fade-in-down'>
      {/* <div className='hidden md:block text-center text-lg font-semibold my-4'>
        {!game.isFinished
          ? t('CardPicker.ClickOnTheCardToVote')
          : t('CardPicker.SessionNotReadyForVotingWaitForModeratorToStart')}
      </div> */}
      <HorizontalScroll className='justify-start pb-2 2xl:pb-8 gap-4 w-full md:justify-center'>
        {cards.map((card: CardConfig) => {
          const isSelected = players.find((p) => p.id === currentPlayerId)?.value === card.value;
          return (
            <PokerCard
              key={card.value}
              card={card}
              isSelected={isSelected}
              isFinished={game.isFinished}
              randomEmoji={randomEmoji}
              onClick={() => playPlayer(game.id, currentPlayerId, card)}
            />
          );
        })}
      </HorizontalScroll>
      <div className='flex justify-center'>
        {/* <GoogleAd /> */}
      </div>
    </div>
  );
};

