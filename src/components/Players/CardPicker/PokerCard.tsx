import React from 'react';
import { CardConfig } from './CardConfigs';
import { Button } from '../../ui/button';
import { H3, H4 } from '../../Typography';

interface PokerCardProps {
  card: CardConfig;
  isSelected: boolean;
  isFinished: boolean;
  onClick: () => void;
  randomEmoji: string;
}

export const PokerCard: React.FC<PokerCardProps> = ({
  card,
  isSelected,
  isFinished,
  onClick,
  randomEmoji,
}) => {
  return (
    <Button
      variant='ghost'
      size='sm'
      className='h-full p-0'
      onClick={onClick}
    >
      <div
        id={`card-${card.displayValue}`}
        className={`
        cursor-pointer select-none transition-all duration-300
        rounded shadow-md border
        flex flex-col items-center justify-center
        text-background
        hover:scale-115
        shrink-0
        w-15 h-23
        md:w-20 md:h-30
        sm:w-15 sm:h-23
        ${isSelected
            ? 'border-dashed border-2 border-border z-10 shadow-lg scale-110'
            : 'shadow-md scale-100'
          }
        ${isFinished
            ? 'pointer-events-none opacity-50 cursor-not-allowed'
            : ''
          }
      `}
        style={{
          backgroundColor: card.color,
        }}
      >
        <div className='flex flex-col justify-between h-full w-full p-1'>
          {card.value >= 0 && (
            <>
              <span className='text-xs text-gray-800 flex justify-start'>
                {card.displayValue}
              </span>
              <H3>
                {card.displayValue}
              </H3>
              <span className='flex justify-end w-full text-xs text-gray-800'>
                {card.displayValue}
              </span>
            </>
          )}
          {card.value === -1 && (
            <span className='flex flex-col justify-center h-full text-4xl'>
              {randomEmoji}
            </span>
          )}
          {card.value === -2 && (
            <span className='flex flex-col justify-center h-full text-4xl'>❓</span>
          )}
        </div>
      </div>
    </Button>
  );
};
