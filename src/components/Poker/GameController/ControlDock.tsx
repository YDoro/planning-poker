import { Game, TimerProps } from '@/src/types/game'
import { Timer } from './Timer/TimerInput/Timer'
import { finishGame, removeGame, updateGame } from '@/src/service/games'
import { useCallback, useState } from 'react'
import { ControllerButton } from './ControllerButton'
import { Eye, Trash2, SkipForward, CheckCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { nextTask } from '@/src/service/games'
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
import { toast } from 'sonner'

export type ControlDockProps = {
  game: Game
  isModerator: boolean
}

export const ControlDock = ({ game, isModerator = false }: ControlDockProps) => {
  const { t } = useTranslation()
  const [showSkipPrompt, setShowSkipPrompt] = useState(false)
  const [showFinishPrompt, setShowFinishPrompt] = useState(false)

  const tasks = game.tasks || []
  const currentTaskIndex = tasks.findIndex(t => t.id === game.currentTaskId)
  const currentTask = tasks[currentTaskIndex]
  const hasNextTask = tasks.slice(currentTaskIndex + 1).some(
    t => t.status === 'pending' || t.status === 'skipped' || t.status === 'voting'
  )
  const isLastTask = tasks.length > 0 && !hasNextTask

  const handleNextTask = () => {
    if (isLastTask) {
      if (currentTask && !currentTask.score) {
        setShowSkipPrompt(true)
      } else {
        setShowFinishPrompt(true)
      }
      return
    }
    if (currentTask && !currentTask.score) {
      setShowSkipPrompt(true)
    } else {
      nextTask(game.id)
    }
  }

  const handleSkipTask = () => {
    if (isLastTask) {
      nextTask(game.id, undefined, true).then(() => {
        toast.success(t('GameController.planningFinished'))
      })
    } else {
      nextTask(game.id, undefined, true)
    }
    setShowSkipPrompt(false)
  }

  const handleFinishPlanning = async () => {
    await nextTask(game.id, currentTask?.score)
    setShowFinishPrompt(false)
    toast.success(t('GameController.planningFinished'))
  }

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

      {tasks.length > 0 && (
        <ControllerButton
          onClick={handleNextTask}
          icon={isLastTask ? <CheckCheck /> : <SkipForward />}
          label={isLastTask ? t('GameController.finishPlanning') : t('GameController.nextTask')}
          className={isLastTask ? 'text-green-600' : 'text-blue-500'}
          testId='next-task-button'
        />
      )}

      {/* Skip prompt (when current task has no score) */}
      <AlertDialog open={showSkipPrompt} onOpenChange={setShowSkipPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('GameController.skipDialog.title', 'Skip Task?')}</AlertDialogTitle>
            <AlertDialogDescription>{t('GameController.skipDialog.description', 'The final score was not defined. Do you want to skip this task?')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('GameController.deleteDialog.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSkipTask}>
              {t('common.confirm', 'Confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finish planning confirmation */}
      <AlertDialog open={showFinishPrompt} onOpenChange={setShowFinishPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('GameController.finishDialog.title', 'Finish Planning?')}</AlertDialogTitle>
            <AlertDialogDescription>{t('GameController.finishDialog.description', 'This is the last task. Do you want to finish the planning session?')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('GameController.deleteDialog.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction className='bg-green-600 hover:bg-green-700' onClick={handleFinishPlanning}>
              {t('GameController.finishPlanning', 'Finish')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete session */}
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
