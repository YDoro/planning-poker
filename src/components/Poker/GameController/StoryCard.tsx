import { Story } from './types/story'
import { Game } from '../../../core/domain/entities/Game'
import { Player } from '../../../core/domain/entities/Player'
import { HTMLAttributes, useState, useEffect, useMemo } from 'react'
import { Card } from '../../ui/card'
import { H2 } from '../../Typography'
import { Plus, Pencil, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { computeStoryVoteStatistics } from '@/src/domain/game/storyVoteStatistics'
import { useGameStore } from '../../../presentation/stores/useGameStore'

type StoryCardProps = HTMLAttributes<HTMLDivElement> & {
  story: Story
  isModerator?: boolean
  game?: Game
  players?: Player[]
  onStoryNameChange?: (name: string) => void
  onStoryNameConfirm?: (name: string) => void
}

export const StoryCard = ({
  story,
  isModerator,
  game,
  players,
  onStoryNameChange,
  onStoryNameConfirm,
  ...props
}: StoryCardProps) => {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const storeGame = useGameStore((state) => state.game)
  const activeGame = game || storeGame
  const currentTask = activeGame?.tasks?.find((t) => t.id === activeGame?.currentTaskId)
  const editTaskAction = useGameStore((state) => state.editTask)

  const toggleEdit = () => setIsEditing(!isEditing)

  useEffect(() => {
    if (isModerator && !story.title) {
      setIsEditing(true)
    }
  }, [story.title, isModerator])

  const isFinished = currentTask?.status === 'voted' && currentTask.revealed

  const stats = useMemo(() => {
    if (!isFinished || !game || !players) return null
    return computeStoryVoteStatistics(game, players)
  }, [isFinished, game, players])

  return (
    <Card
      className={`flex flex-col w-full h-full shadow-md p-4 relative group ${isFinished ? 'justify-between' : 'justify-center'}`}
      {...props}
    >
      <div className='flex flex-col items-center justify-center w-full h-full max-w-full p-4'>
        {isModerator && !isEditing && (
          <button
            type='button'
            onClick={toggleEdit}
            className='absolute top-2 right-2 p-1 rounded-full hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity'
            title={t('common.edit')}
          >
            <Pencil size={16} className='text-muted-foreground' />
          </button>
        )}

        {isEditing ? (
          <div className='w-full text-xs'>
            <div className='flex justify-between items-center mb-1'>
              <label className='font-semibold' htmlFor='story-name-input'>
                {t('GameController.storyName')}:
              </label>
              <button
                type='button'
                onClick={() => {
                  onStoryNameConfirm?.(story.title || '');
                  toggleEdit();
                }}
                className='p-1 rounded-full hover:bg-secondary text-primary'
                title={t('common.confirm')}
              >
                <Check size={16} />
              </button>
            </div>
            <input
              id='story-name-input'
              autoFocus
              placeholder={t('GameController.enterStoryName')}
              className='w-full italic p-2 border bg-background border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring'
              type='text'
              data-testid='story-name-input'
              value={story.title || ''}
              onChange={(e) => onStoryNameChange?.(e.target.value || '')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onStoryNameConfirm?.(story.title || '');
                  toggleEdit();
                }
              }}
            />
          </div>
        ) : (
          <H2 className='text-center truncate w-full px-2'>{story.title}</H2>
        )}
      </div>

      {isFinished && stats && (
        <div className='w-full mt-4 pt-4 border-t border-border flex flex-col gap-4'>
          <div className='grid grid-cols-3 gap-2 text-[10px]'>
            <div className='flex flex-col items-center'>
              <span className='text-muted-foreground font-medium uppercase tracking-wider'>
                {t('GameController.average')}
              </span>
              <span className='text-sm font-bold text-primary'>{stats.averageFormatted}</span>
            </div>
            <div className='flex flex-col items-center'>
              <span className='text-muted-foreground font-medium uppercase tracking-wider'>
                {t('GameController.storyStats.mode')}
              </span>
              <span className='text-sm font-bold text-primary'>{stats.modeFormatted}</span>
            </div>
            <div className='flex flex-col items-center'>
              <span className='text-muted-foreground font-medium uppercase tracking-wider'>
                {t('GameController.storyStats.closest')}
              </span>
              <span className='text-sm font-bold text-primary'>{stats.closestFormatted}</span>
            </div>
          </div>
          {isModerator && (
            <div className='flex items-center justify-center gap-2 mt-2'>
              <label className='text-xs font-semibold' htmlFor='final-score'>
                {t('GameController.finalScore', 'Final Score')}:
              </label>
              <input
                id='final-score'
                className='w-16 p-1 text-center text-sm border bg-background border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring'
                defaultValue={story.points || stats.closestFormatted}
                onBlur={(e) => {
                  if (game && story.cod && story.cod !== 'active') {
                    editTaskAction(game.id, story.cod, { score: e.target.value });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export const AddStoryCard = ({ ...props }: HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button type='button' {...props} className='flex hover:scale-105 transition-all'>
      <Card className='flex aspect-4/3 w-lg shadow-md justify-center items-center'>
        <Plus size={100} />
      </Card>
    </button>
  )
}
