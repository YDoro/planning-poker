import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@ui/alert-dialog';
import {
  finishGame,
  removeGame,
  resetGame,
  updateGame,
  updateStoryName,
} from '../../../service/games';
import { Game, GameType, TimerProps } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { isModerator } from '../../../utils/isModerator';
import { ExitSVG } from '../../SVGs/Exit';
import { EyeSVG } from '../../SVGs/Eye';
import { LinkSVG } from '../../SVGs/Link';
import { RefreshSVG } from '../../SVGs/Refresh';
import { TrashSVG } from '../../SVGs/Trash';
import { Timer } from './Timer/TimerInput/Timer';
import { DoorOpen, Info, LogOut, Share, Share2 } from 'lucide-react';
import { H1, Text } from '../../Typography';
import { GameControlls } from './GameControlls';
import { ControllerButton } from './ControllerButton';

interface GameControllerProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
}

export const GameController: React.FC<GameControllerProps> = ({
  game,
  players,
  currentPlayerId,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    if (
      game.autoReveal &&
      game.gameStatus === 'In Progress' &&
      Array.isArray(players) &&
      players.length > 0 &&
      players.every((p: Player) => p.status === Status.Finished)
    ) {
      finishGame(game.id);
    }
  }, [
    game.autoReveal,
    game,
    JSON.stringify(players.map((p) => ({ id: p.id, value: p.value, status: p.status }))),
  ]);


  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${game.id}`);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 5000);
  };

  const leaveGame = () => navigate(`/`);


  const isMod = isModerator(game.createdById, currentPlayerId, game.isAllowMembersToManageSession);
  const timerProps: {
    isMod?: boolean;
    timerVisible?: boolean;
    timerPaused?: boolean;
    currentSeconds?: number;
    totalSeconds?: number;
    soundOn?: boolean;
  } = { isMod: isMod, timerVisible: game.timerProps?.timerVisible };

  return (
    <div className='flex w-full bg-secondary relative top-0'>
      <div className='flex flex-row justify-between px-4 w-full max-w-7xl'>
        <div className='flex items-center gap-2'>
          <H1 className='text-lg font-semibold truncate'>{game.name}</H1>
          <span className='text-sm font-medium text-muted-foreground'>
            {game.gameStatus} {getGameStatusIcon(game.gameStatus)}
          </span>
        </div>
        {/** Game Controllers */}
        <div className='flex items-center'>
          {isMod && <GameControlls isModerator={isMod} game={game} />}
          <ControllerButton
            onClick={copyInviteLink}
            icon={<Share2 />}
            label=''
            className='text-primary'
            testId='invite-button'
            title={t('GameController.invite')}
          />
          <ControllerButton
            onClick={leaveGame}
            icon={<LogOut />}
            title={t('GameController.exit')}
            label=''
            className='text-destructive'
            testId='exit-button'
          />
        </div>
      </div>
      {/* Snackbar/Alert */}
      {showCopiedMessage && (
        <div className='fixed top-6 right-6 z-50'>
          <div
            className='bg-green-100 border border-green-200  text-gray-800 opacity-85 px-4 py-3 text-xs rounded shadow'
            role='alert'
          >
            <span className='block font-bold'>{t('GameController.inviteLinkCopied')}!</span>
          </div>
        </div>
      )}
    </div>



    //       <div className='w-full text-xs mt-2'>
    //         <label className='font-semibold'>{t('GameController.storyName')}:</label>
    //         <input
    //           placeholder={t('GameController.enterStoryName')}
    //           className='w-full italic p-2 mt-2 border bg-white dark:bg-gray-900 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400'
    //           type='text'
    //           data-testid='story-name-input'
    //           value={game.storyName || ''}
    //           onChange={(e) => updateStoryName(game.id, e.target.value || '')}
    //         />
    //       </div>
    //     </div>
    //   </div>
    // {/* Snackbar/Alert */}
    // {showCopiedMessage && (
    //   <div className='fixed top-6 right-6 z-50'>
    //     <div
    //       className='bg-green-100 border border-green-200  text-gray-800 opacity-85 px-4 py-3 text-xs rounded shadow'
    //       role='alert'
    //     >
    //       <span className='block font-bold'>{t('GameController.inviteLinkCopied')}!</span>
    //     </div>
    //   </div>
    // )}
    // </div>
  );
};




const getGameStatusIcon = (gameStatus: string) => {
  switch (gameStatus) {
    case 'In Progress':
      return '⏱️';
    case 'Finished':
      return '🎉';
    default:
      return '🚀';
  }
};

const AverageComponent: React.FC<{ game: Game; players: Player[] }> = ({ game, players }) => {
  const gameType = game.gameType;
  const NOT_APPLICABLE = 'N/A';
  const EMPTY = '-';
  const canShowAverage = gameType !== GameType.TShirt && gameType !== GameType.TShirtAndNumber;

  if (!canShowAverage) {
    return null;
  }

  const { t } = useTranslation();
  const gameAverage = getAverage(game, players);
  let average = game.gameStatus === Status.Finished && gameAverage ? gameAverage.toFixed(2) : EMPTY;

  // if (!areAllFinishedPlayersDisplayValuesNumeric(game, players)) {
  //   average = NOT_APPLICABLE;
  // }

  return (
    <>
      <div className='mx-2 h-6 border-l border-gray-400 dark:border-gray-600' />
      <span className='text-sm font-medium'>{t('GameController.average')}:</span>
      <span className='px-2 py-1 ml-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 font-bold shadow-sm border border-gray-200 inline-flex items-center relative'>
        {average}
        {average !== EMPTY && average !== NOT_APPLICABLE && (
          <>
            <span className='relative group ml-1'>
              <span className='cursor-pointer group ml-1 flex'>
                <Info className='h-4 w-4 text-gray-600 dark:text-gray-300' />
              </span>
              <span className='absolute left-1/2 top-full mt-2 z-10 -translate-x-1/2 w-max min-w-[80px] rounded bg-white dark:bg-gray-900 bg-opacity-90 px-2 py-1 text-xs font-semibold border border-gray-200 dark:border-gray-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
                {`Rounded Average : ${Math.round(gameAverage) || 0}`}
              </span>
            </span>
          </>
        )}
      </span>
    </>
  );
};

export function areAllFinishedPlayersDisplayValuesNumeric(game: Game, players: Player[]): boolean {
  return players
    .filter((player) => player.status === Status.Finished)
    .every((player) => {
      const value =
        game.gameType === GameType.Custom
          ? Number(game.cards.find((card) => card.value === player.value)?.displayValue)
          : player.value;

      if (!value) return false;
      const num = typeof value === 'number' ? value : Number(value);
      return !isNaN(num);
    });
}

export const getAverage = (game: Game, players: Player[]): number => {
  let values = 0;
  let numberOfPlayersPlayed = 0;
  const cards = game.cards;
  players.forEach((player) => {
    const value =
      game.gameType === GameType.Custom
        ? Number(cards.find((card) => card.value === player.value)?.displayValue)
        : player.value;

    if (
      player.status === Status.Finished &&
      value !== undefined &&
      !isNaN(value) &&
      value &&
      value >= 0
    ) {
      values = values + value;
      numberOfPlayersPlayed++;
    }
  });
  return Math.round((values / numberOfPlayersPlayed) * 100) / 100;
};
