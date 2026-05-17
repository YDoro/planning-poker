import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const audio = typeof Audio !== 'undefined' ? new Audio('/timer-notification.mp3') : null

export type UseTimerProgressArgs = {
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

const getMinutesAndSeconds = (time: number) => [Math.floor(time / 60), time % 60]

export const useTimerProgress = ({
  currentSeconds = 0,
  totalSeconds = 300,
  onTimerClose,
  isMod,
  onTimerStateUpdate,
  soundOn = true,
  timerPaused = false,
}: UseTimerProgressArgs) => {
  const { t } = useTranslation()
  const [total, setTotal] = useState(totalSeconds)
  const [current, setCurrent] = useState(currentSeconds)
  const [inProgress, setInProgress] = useState(!isMod && !timerPaused)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [_soundOn, setSoundOn] = useState(soundOn)

  useEffect(() => {
    if (!isMod) {
      setInProgress(false)
      setCurrent(currentSeconds)
      setTotal(totalSeconds)
      setSoundOn(soundOn)
    }
  }, [isMod, currentSeconds, totalSeconds, soundOn])

  useEffect(() => {
    if (inProgress && isMod) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => {
          if (prev + 1 >= total) {
            clearInterval(intervalRef.current as NodeJS.Timeout)
            setInProgress(false)
            if (audio && _soundOn) audio.play()
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout)
  }, [inProgress, total, _soundOn, isMod])

  useEffect(() => {
    if (isMod) {
      onTimerStateUpdate({
        totalSeconds: total,
        currentSeconds: current,
        timerPaused: !inProgress,
        soundOn: _soundOn,
      })
    }
  }, [current, total, inProgress, _soundOn, isMod, onTimerStateUpdate])

  const startTimer = useCallback(() => setInProgress(true), [])
  const pauseTimer = useCallback(() => {
    setInProgress(false)
    clearInterval(intervalRef.current as NodeJS.Timeout)
  }, [])
  const handleReset = useCallback(() => {
    setCurrent(0)
    setInProgress(false)
    clearInterval(intervalRef.current as NodeJS.Timeout)
    intervalRef.current = null
  }, [])
  const onAddSeconds = useCallback(() => setTotal((prev) => prev + 60), [])
  const onReduceSeconds = useCallback(
    () => setTotal((prev) => (prev - 60 > 30 ? prev - 60 : prev)),
    [],
  )
  const onMinutesChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const minutes = Number(event.target.value.slice(-2))
      setTotal(minutes * 60 + (total % 60))
      setCurrent(0)
    },
    [total],
  )
  const onSecondsChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const seconds = Number(event.target.value.slice(-2))
      setTotal(Math.floor(total / 60) * 60 + seconds)
      setCurrent(0)
    },
    [total],
  )

  const [minutes, seconds] = getMinutesAndSeconds(total)
  const [runningMinutes, runningSeconds] = getMinutesAndSeconds(total - current)
  const percentage = total > 0 ? 100 - (current / total) * 100 : 100
  const [currentMinutesRunning, currentSecondsRunning] = getMinutesAndSeconds(current)

  const inputDisabled = !isMod || !!intervalRef.current || inProgress
  const showRunningInputs = (intervalRef.current && inProgress) || !isMod

  return {
    t,
    isMod,
    onTimerClose,
    _soundOn,
    setSoundOn,
    total,
    current,
    inProgress,
    minutes,
    seconds,
    runningMinutes,
    runningSeconds,
    currentMinutesRunning,
    currentSecondsRunning,
    percentage,
    intervalRef,
    startTimer,
    pauseTimer,
    handleReset,
    onAddSeconds,
    onReduceSeconds,
    onMinutesChange,
    onSecondsChange,
    inputDisabled,
    showRunningInputs,
    minutesInputValue: showRunningInputs
      ? runningMinutes.toString().padStart(2, '0')
      : minutes.toString().padStart(2, '0'),
    secondsInputValue: showRunningInputs
      ? runningSeconds.toString().padStart(2, '0')
      : seconds.toString().padStart(2, '0'),
  }
}

export type TimerProgressViewModel = ReturnType<typeof useTimerProgress>
