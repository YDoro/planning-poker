import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Game } from '../../../core/domain/entities/Game'
import { checkIsModerator } from '../../../core/use-cases/CheckIsModerator'
import { Lightbulb, LightbulbOff, LogOut, Share2, StopCircle } from 'lucide-react'
import { H1 } from '../../Typography'
import { ControlDock } from './ControlDock'
import { ControllerButton } from './ControllerButton'
import { sessionStatusEmoji, sessionStatusTranslationKey } from '@/src/domain/game/sessionStatusPresentation'
import { useGameStore } from '@/src/presentation/stores/useGameStore'
import { toast } from 'sonner'

export type GameTopBarProps = {
  game: Game
  currentPlayerId: string
}

export const GameTopBar: React.FC<GameTopBarProps> = ({
  game,
  currentPlayerId,
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)
  const setDontVote = useGameStore((state) => state.setDontVote);
  const currentPlayer = useGameStore((state) => state.getCurrentPlayer(currentPlayerId))

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${game.id}`)
    setShowCopiedMessage(true)
    setTimeout(() => setShowCopiedMessage(false), 5000)
  }

  const handleLeaveGame = () => navigate(`/`)

  const isMod = checkIsModerator.execute({
    moderatorId: game.createdById,
    currentPlayerId,
    isAllowMembersToManageSession: game.isAllowMembersToManageSession,
  })

  const handleDontVote = () => {
    setDontVote(game.id, currentPlayerId)
    if (currentPlayer?.isNonVoter) {
      toast.info(t('GameController.voteOnMessage'))
    } else {
      toast.info(t('GameController.voteOffMessage'))
    }
  }

  const statusLabel = t(sessionStatusTranslationKey(game.gameStatus as any))

  return (
    <div className='flex w-full bg-secondary relative top-0'>
      <div className='flex flex-row justify-between px-4 pt-1 w-full mx-auto max-w-7xl'>
        <div className='flex items-center gap-2'>
          <H1 className='text-lg font-semibold truncate'>{game.name}</H1>
          <span className='text-sm font-medium text-muted-foreground'>
            {statusLabel} {sessionStatusEmoji(game.gameStatus as any)}
          </span>
        </div>
        <div className='flex items-center gap-1'>
          {isMod && <ControlDock isModerator={isMod} game={game} />}
          <ControllerButton
            onClick={handleCopyInviteLink}
            icon={<Share2 />}
            label=''
            className='text-primary'
            testId='invite-button'
            title={t('GameController.invite')}
          />
          {
            currentPlayer?.isNonVoter ?
              <ControllerButton
                onClick={handleDontVote}
                icon={<Lightbulb />}
                label=''
                className='text-green-800'
                testId='vote-button'
                title={t('GameController.vote')}
              />
              :
              <ControllerButton
                onClick={handleDontVote}
                icon={<LightbulbOff />}
                label=''
                className='text-destructive'
                testId='dont-vote-button'
                title={t('GameController.dontVote')}
              />
          }
          <ControllerButton
            onClick={handleLeaveGame}
            icon={<LogOut />}
            title={t('GameController.exit')}
            label=''
            className='text-destructive'
            testId='exit-button'
          />
        </div>
      </div>
      {showCopiedMessage && (
        <div className='fixed top-6 right-6 z-50'>
          <div
            className='bg-muted border text-foreground px-4 py-3 text-xs rounded-md shadow-sm border-border'
            role='alert'
          >
            <span className='block font-medium'>{t('GameController.inviteLinkCopied')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
