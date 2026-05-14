import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  finishGame,
} from '../../../service/games';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { isModerator } from '../../../utils/isModerator';
import { LogOut, Share2 } from 'lucide-react';
import { H1 } from '../../Typography';
import { GameControlls } from './GameControlls';
import { ControllerButton } from './ControllerButton';
import { StoryCard } from './StoryCard';

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

  return (
    <div className='flex w-full bg-secondary relative top-0'>
      <div className='flex flex-row justify-between px-4 pt-1 w-full mx-auto max-w-7xl'>
        <div className='flex items-center gap-2'>
          <H1 className='text-lg font-semibold truncate'>{game.name}</H1>
          <span className='text-sm font-medium text-muted-foreground'>
            {game.gameStatus} {getGameStatusIcon(game.gameStatus)}
          </span>
        </div>
        {/** Game Controllers */}
        <div className='flex items-center gap-1'>
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
