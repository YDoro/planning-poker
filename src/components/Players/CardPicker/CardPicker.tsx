import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updatePlayerValue } from '../../../service/players';
import { Game } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { CardConfig, getCards, getRandomEmoji } from './CardConfigs';
import { HorizontalScroll } from '../../ui/horizontal-scroll';
import { PokerCard } from './PokerCard';

interface CardPickerProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
}

export const CardPicker: React.FC<CardPickerProps> = ({ game, players, currentPlayerId }) => {
  const { t } = useTranslation();
  const [randomEmoji, setRandomEmoji] = useState(getRandomEmoji);
  const playPlayer = (gameId: string, playerId: string, card: CardConfig) => {
    if (game.gameStatus !== Status.Finished) {
      updatePlayerValue(gameId, playerId, card.value, randomEmoji);
    }
  };

  useEffect(() => {
    if (game.gameStatus === Status.Started) {
      setRandomEmoji(getRandomEmoji);
    }
  }, [game.gameStatus]);

  const cards = game.cards?.length ? game.cards : getCards(game.gameType);

  return (
    <div className='w-full max-w-full animate-fade-in-down'>
      <div className='text-center text-lg font-semibold my-4'>
        {game.gameStatus !== Status.Finished
          ? t('CardPicker.ClickOnTheCardToVote')
          : t('CardPicker.SessionNotReadyForVotingWaitForModeratorToStart')}
      </div>
      <HorizontalScroll className='justify-start p-4 gap-4 w-full md:justify-center'>
        {cards.map((card: CardConfig) => {
          const isSelected = players.find((p) => p.id === currentPlayerId)?.value === card.value;
          return (
            <PokerCard
              key={card.value}
              card={card}
              isSelected={isSelected}
              isFinished={game.gameStatus === Status.Finished}
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
