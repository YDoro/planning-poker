import { Game, TimerProps } from '@/src/types/game'
import { Timer } from './Timer/TimerInput/Timer'
import { finishGame, removeGame, resetGame, updateGame } from '@/src/service/games'
import { useCallback } from 'react'
import { ControllerButton } from './ControllerButton'
import { Eye, RefreshCcw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../ui/alert-dialog'
import { AutoReveal } from './AutoReveal'

export type ControlDockProps = {
  game: Game
  isModerator: boolean
}

export const ControlDock = ({ game, isModerator = false }: ControlDockProps) => {
  const { t } = useTranslation()

  const handleAutoReveal = (value: boolean) => {
    updateGame(game.id, { autoReveal: value })
  }

  const onUpdatedTimerProps = useCallback(
    (timer: TimerProps) => {
      updateGame(game.id, { timerProps: timer })
    },
    [game.id],
  )

  const handleRemoveGame = async (id: string) => {
    await removeGame(id)
    window.location.href = '/'
  }

  return (
    <div className='fixed items-baseline justify-center bottom-56 left-1/2 -translate-x-1/2 p-4 w-[90dvw] bg-card rounded-md z-40 flex gap-2 shadow-lg border md:max-h-min md:items-center md:left-auto md:translate-x-0 md:max-w-20 md:flex-col md:right-4 md:top-1/2 md:-translate-y-1/2'>
      <Timer
        variant='dock'
        timerProps={{
          ...(game.timerProps || {}),
          isMod: isModerator,
        }}
        onTimerUpdate={onUpdatedTimerProps}
      />
      <AutoReveal
        autoReveal={game.autoReveal || false}
        onAutoReveal={(value) => handleAutoReveal(value)}
      />
      <ControllerButton
        onClick={() => finishGame(game.id)}
        icon={<Eye />}
        label={t('GameController.reveal')}
        className='text-green-700'
        testId='reveal-button'
      />
      <ControllerButton
        onClick={() => resetGame(game.id)}
        icon={<RefreshCcw />}
        label={t('GameController.restart')}
        className='text-primary'
        testId='restart-button'
      />
      <AlertDialog data-testid='delete-button-dialog'>
        <AlertDialogTrigger asChild>
          <ControllerButton
            icon={<Trash2 />}
            label={t('GameController.delete')}
            className='text-destructive'
            testId='delete-button'
          />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('GameController.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('GameController.deleteDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('GameController.deleteDialog.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction variant='destructive' onClick={() => handleRemoveGame(game.id)}>
              {t('GameController.deleteDialog.continueButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
