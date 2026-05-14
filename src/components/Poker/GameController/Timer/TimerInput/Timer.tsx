import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TimerProgress } from '../TimerProgressPopup/TimerProgressPopup';
import { TimerProps as GameTimerProps } from '../../../../../types/game';
import { Clock } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ControllerButton } from '../../ControllerButton';

type TimerProps = {
  timerProps: {
    isMod?: boolean;
    currentSeconds?: number;
    totalSeconds?: number;
    soundOn?: boolean;
    timerVisible?: boolean;
    timerPaused?: boolean;
  };
  onTimerUpdate: (timer: GameTimerProps) => void;
};

export const Timer: React.FC<TimerProps> = ({ timerProps, onTimerUpdate }) => {
  const { t } = useTranslation();
  const {
    isMod = false,
    timerVisible = false,
    timerPaused = false,
    currentSeconds = 0,
    totalSeconds = 300,
    soundOn = true,
  } = timerProps;

  const onTimerStateUpdate = useCallback(
    (update: GameTimerProps) => {
      onTimerUpdate(update);
    },
    [onTimerUpdate],
  );

  const onTimerClose = useCallback(() => {
    onTimerStateUpdate({
      currentSeconds: 0,
      totalSeconds: 300,
      soundOn: true,
      timerPaused: false,
      timerVisible: false,
    });
  }, [onTimerStateUpdate]);

  return (
    <>
      {isMod && (
        <ControllerButton
          onClick={() => onTimerStateUpdate({
            currentSeconds: 0,
            totalSeconds: 300,
            soundOn: true,
            timerPaused: false,
            timerVisible: true,
          })}
          icon={<Clock />}
          label={t('GameController.Timer.timerButtonLabel')}
          className={`text-primary ${timerVisible && 'text-green-700'}`}
          testId='timer-button'
        />

      )}

      {timerVisible && (
        <TimerProgress
          currentSeconds={currentSeconds}
          totalSeconds={totalSeconds}
          onTimerClose={onTimerClose}
          isMod={isMod}
          onTimerStateUpdate={(update) => {
            onTimerStateUpdate({ ...update, timerVisible });
          }}
          soundOn={soundOn}
          timerPaused={timerPaused}
        />
      )}
    </>
  );
};
