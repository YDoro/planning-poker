import CircularProgressBar from '../../../../elements/CircularProgressBar'
import { TimerControlButton } from './TimerControlButton'
import type { TimerProgressViewModel } from './useTimerProgress'

export const TimerProgressDesktop = (vm: TimerProgressViewModel) => {
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
    percentage,
    minutesInputValue,
    secondsInputValue,
    onMinutesChange,
    onSecondsChange,
    inputDisabled,
    startTimer,
    pauseTimer,
    handleReset,
    onAddSeconds,
    onReduceSeconds,
    total,
  } = vm

  return (
    <div className='fixed top-6 right-6 z-50 h-fit w-[15rem] rounded-lg border border-border bg-card p-4 shadow-lg'>
      <button
        title={
          _soundOn
            ? isMod
              ? t('GameController.Timer.soundEnabledMod')
              : t('GameController.Timer.soundEnabledPlayer')
            : isMod
              ? t('GameController.Timer.soundDisabledMod')
              : t('GameController.Timer.soundDisabledPlayer')
        }
        className={`absolute top-3 left-3 p-1 ${isMod ? 'cursor-pointer' : ''}`}
        onClick={() => isMod && setSoundOn((s) => !s)}
        type='button'
      >
        {_soundOn ? '🔊' : '🔇'}
      </button>
      {isMod && (
        <button
          type='button'
          className='absolute top-3 right-3 cursor-pointer text-sm'
          title={t('GameController.Timer.closeTimer')}
          aria-label={t('GameController.Timer.closeTimerAria')}
          onClick={onTimerClose}
        >
          ×
        </button>
      )}
      <div className='flex h-full w-full flex-col items-center justify-center gap-2'>
        <CircularProgressBar percentage={percentage}>
          <div className='flex flex-col items-center gap-2 text-4xl'>
            <div
              title={
                isMod
                  ? t('GameController.Timer.setTimeTitle', { minutes, seconds })
                  : t('GameController.Timer.runningTimeTitle', {
                      minutes: runningMinutes,
                      seconds: runningSeconds,
                    })
              }
              className='flex flex-grow items-center gap-1'
            >
              <input
                type='text'
                value={minutesInputValue}
                maxLength={3}
                pattern='[0-9]*'
                className='w-[2.5rem] border-none bg-transparent text-foreground focus:outline-none'
                onChange={onMinutesChange}
                disabled={inputDisabled}
              />
              <span className='pb-[0.3rem]'>:</span>
              <input
                type='text'
                value={secondsInputValue}
                maxLength={3}
                pattern='[0-9]*'
                className='w-[2.5rem] border-none bg-transparent text-foreground focus:outline-none'
                onChange={onSecondsChange}
                disabled={inputDisabled}
              />
            </div>
            {isMod && !inProgress && (
              <div
                title={t('GameController.Timer.runningElapsedTitle', {
                  minutes: currentMinutesRunning,
                  seconds: currentSecondsRunning,
                })}
                className='text-2xl text-foreground'
              >
                <span>{currentMinutesRunning.toString().padStart(2, '0')}</span>
                <span>:</span>
                <span>{currentSecondsRunning.toString().padStart(2, '0')}</span>
              </div>
            )}
          </div>
        </CircularProgressBar>
        {isMod && (
          <>
            <hr className='my-3 h-px w-full border-0 bg-border' />
            <div className='flex w-full gap-2'>
              <TimerControlButton
                title={t('GameController.Timer.resetTimer')}
                callback={handleReset}
                className='text-muted-foreground'
              >
                {'\u23F9'}
              </TimerControlButton>
              <div className='w-full flex-grow'>
                {!inProgress && (
                  <div className='flex h-8 w-full items-center justify-center gap-x-2' role='group'>
                    <TimerControlButton
                      callback={onReduceSeconds}
                      title={t('GameController.Timer.subtractOneMinute')}
                    >
                      -
                    </TimerControlButton>
                    <TimerControlButton callback={onAddSeconds} title={t('GameController.Timer.addOneMinute')}>
                      +
                    </TimerControlButton>
                  </div>
                )}
              </div>
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
          </>
        )}
      </div>
    </div>
  )
}
