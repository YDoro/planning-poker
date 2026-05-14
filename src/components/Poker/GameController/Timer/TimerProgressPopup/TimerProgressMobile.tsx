import { TimerControlButton } from './TimerControlButton'
import type { TimerProgressViewModel } from './useTimerProgress'

export const TimerProgressMobile = (timer: TimerProgressViewModel) => {
  const {
    t,
    isMod,
    onTimerClose,
    _soundOn,
    setSoundOn,
    inProgress,
    minutes,
    seconds,
    runningMinutes,
    runningSeconds,
    currentMinutesRunning,
    currentSecondsRunning,
    startTimer,
    pauseTimer,
    handleReset,
    onAddSeconds,
    onReduceSeconds,
    minutesInputValue,
    secondsInputValue,
    onMinutesChange,
    onSecondsChange,
    inputDisabled,
    total,
  } = timer

  const soundTitle = _soundOn
    ? isMod
      ? t('GameController.Timer.soundEnabledMod')
      : t('GameController.Timer.soundEnabledPlayer')
    : isMod
      ? t('GameController.Timer.soundDisabledMod')
      : t('GameController.Timer.soundDisabledPlayer')

  return (
    <div className='fixed top-6 left-1/2 z-50 w-auto max-w-[min(100vw-2rem,24rem)] -translate-x-1/2 bg-card opacity-75 rounded-md'>
      <div className='flex flex-row items-center gap-2 px-1'>
        <div className='flex items-center justify-center gap-4'>
          <button
            title={soundTitle}
            className={`shrink-0 p-1 ${isMod ? 'cursor-pointer' : 'opacity-80'}`}
            onClick={() => isMod && setSoundOn((s) => !s)}
            type='button'
          >
            {_soundOn ? '🔊' : '🔇'}
          </button>
          {isMod && (
            <button
              type='button'
              className='shrink-0 cursor-pointer px-1 text-lg leading-none text-muted-foreground hover:text-foreground'
              title={t('GameController.Timer.closeTimer')}
              aria-label={t('GameController.Timer.closeTimerAria')}
              onClick={onTimerClose}
            >
              ×
            </button>
          )}
        </div>

        <div className='flex items-baseline justify-center gap-1 font-mono text-5xl font-semibold tabular-nums tracking-tight text-foreground'>
          <span
            title={
              isMod
                ? t('GameController.Timer.setTimeTitle', { minutes, seconds })
                : t('GameController.Timer.runningTimeTitle', {
                    minutes: runningMinutes,
                    seconds: runningSeconds,
                  })
            }
            className='flex items-center gap-0.5'
          >
            <input
              type='text'
              value={minutesInputValue}
              maxLength={3}
              pattern='[0-9]*'
              className='w-[2.8ch] min-w-0 border-none bg-transparent p-0 text-center text-5xl font-semibold tabular-nums text-foreground focus:outline-none focus:ring-0'
              onChange={onMinutesChange}
              disabled={inputDisabled}
            />
            <span className='pb-1'>:</span>
            <input
              type='text'
              value={secondsInputValue}
              maxLength={3}
              pattern='[0-9]*'
              className='w-[2.8ch] min-w-0 border-none bg-transparent p-0 text-center text-5xl font-semibold tabular-nums text-foreground focus:outline-none focus:ring-0'
              onChange={onSecondsChange}
              disabled={inputDisabled}
            />
          </span>
        </div>

        {isMod && !inProgress && (
          <p
            className='text-xs tabular-nums text-muted-foreground'
            title={t('GameController.Timer.runningElapsedTitle', {
              minutes: currentMinutesRunning,
              seconds: currentSecondsRunning,
            })}
          >
            {currentMinutesRunning.toString().padStart(2, '0')}:
            {currentSecondsRunning.toString().padStart(2, '0')}
          </p>
        )}

        {isMod && (
          <div className='flex w-full flex-wrap items-center justify-center gap-2 border-t border-border pt-2'>
            <TimerControlButton
              title={t('GameController.Timer.resetTimer')}
              callback={handleReset}
              className='text-muted-foreground'
            >
              {'\u23F9'}
            </TimerControlButton>
            {!inProgress && (
              <>
                <TimerControlButton
                  callback={onReduceSeconds}
                  title={t('GameController.Timer.subtractOneMinute')}
                >
                  -
                </TimerControlButton>
                <TimerControlButton
                  callback={onAddSeconds}
                  title={t('GameController.Timer.addOneMinute')}
                >
                  +
                </TimerControlButton>
              </>
            )}
            {!inProgress && (
              <TimerControlButton
                title={t('GameController.Timer.startTimer')}
                callback={startTimer}
                disabled={total === 0}
                className='text-muted-foreground'
              >
                {'\u25B6'}
              </TimerControlButton>
            )}
            {inProgress && (
              <TimerControlButton
                title={t('GameController.Timer.pauseTimer')}
                callback={pauseTimer}
                className='text-muted-foreground'
              >
                {'\u23F8'}
              </TimerControlButton>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
