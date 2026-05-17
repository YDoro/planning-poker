import type { FC } from 'react'
import { TimerProgressDesktop } from './TimerProgressDesktop'
import { TimerProgressMobile } from './TimerProgressMobile'
import { useTimerProgress } from './useTimerProgress'
import { useIsDesktopTimerLayout } from './useTimerViewport'

type TimerProps = {
  isMod?: boolean
  currentSeconds?: number
  totalSeconds?: number
  soundOn?: boolean
  timerPaused?: boolean
  onTimerClose: () => void
  onTimerStateUpdate: (update: {
    currentSeconds: number
    totalSeconds: number
    soundOn: boolean
    timerPaused: boolean
  }) => void
}

export const TimerProgress: FC<TimerProps> = (props) => {
  const vm = useTimerProgress(props)
  const isDesktop = useIsDesktopTimerLayout()
  return isDesktop ? <TimerProgressDesktop {...vm} /> : <TimerProgressMobile {...vm} />
}

export { TimerControlButton } from './TimerControlButton'
