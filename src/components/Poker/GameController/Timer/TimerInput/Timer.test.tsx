import { render, screen, fireEvent } from '@testing-library/react'
import { Timer } from './Timer'
import { vi } from 'vitest'

vi.mock('../TimerProgressPopup/TimerProgressPopup', () => ({
  TimerProgress: (props: any) => (
    <div data-testid='timer-progress'>
      TimerProgress
      <button type='button' onClick={props.onTimerClose}>
        Close
      </button>
    </div>
  ),
}))

describe('Timer', () => {
  const dockDefaults = {
    variant: 'dock' as const,
    timerProps: {
      isMod: true,
      timerVisible: false,
      timerPaused: false,
      currentSeconds: 0,
      totalSeconds: 300,
      soundOn: true,
    },
    onTimerUpdate: vi.fn(),
  }

  const overlayDefaults = {
    variant: 'overlay' as const,
    timerProps: {
      isMod: true,
      timerVisible: true,
      timerPaused: false,
      currentSeconds: 0,
      totalSeconds: 300,
      soundOn: true,
    },
    onTimerUpdate: vi.fn(),
  }

  it('does not render clock button for non-mod (dock)', () => {
    render(
      <Timer variant='dock' timerProps={{ isMod: false }} onTimerUpdate={vi.fn()} />,
    )
    expect(screen.queryByTestId('timer-button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('timer-progress')).not.toBeInTheDocument()
  })

  it('renders timer panel for all players when visible (overlay), including non-mod', () => {
    render(
      <Timer
        variant='overlay'
        timerProps={{ isMod: false, timerVisible: true }}
        onTimerUpdate={vi.fn()}
      />,
    )
    expect(screen.getByTestId('timer-progress')).toBeInTheDocument()
  })

  it('renders clock button for mod (dock)', () => {
    render(<Timer {...dockDefaults} />)
    expect(screen.getByTestId('timer-button')).toBeInTheDocument()
  })

  it('opens timer via clock (dock) calls onTimerUpdate', () => {
    const onTimerUpdate = vi.fn()
    render(<Timer {...dockDefaults} onTimerUpdate={onTimerUpdate} />)
    fireEvent.click(screen.getByTestId('timer-button'))
    expect(onTimerUpdate).toHaveBeenCalledWith({
      currentSeconds: 0,
      totalSeconds: 300,
      soundOn: true,
      timerPaused: false,
      timerVisible: true,
    })
  })

  it('shows TimerProgress in overlay when timerVisible is true', () => {
    render(<Timer {...overlayDefaults} />)
    expect(screen.getByTestId('timer-progress')).toBeInTheDocument()
  })

  it('does not show overlay panel when timerVisible is false', () => {
    render(
      <Timer
        variant='overlay'
        timerProps={{ ...overlayDefaults.timerProps, timerVisible: false }}
        onTimerUpdate={vi.fn()}
      />,
    )
    expect(screen.queryByTestId('timer-progress')).not.toBeInTheDocument()
  })

  it('closes overlay via onTimerClose', () => {
    const onTimerUpdate = vi.fn()
    render(
      <Timer
        variant='overlay'
        timerProps={{ ...overlayDefaults.timerProps, timerVisible: true }}
        onTimerUpdate={onTimerUpdate}
      />,
    )
    expect(screen.getByTestId('timer-progress')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Close'))
    expect(onTimerUpdate).toHaveBeenCalledWith({
      currentSeconds: 0,
      totalSeconds: 300,
      soundOn: true,
      timerPaused: false,
      timerVisible: false,
    })
  })

  it('dock does not render overlay panel even when timerVisible true', () => {
    render(
      <Timer
        variant='dock'
        timerProps={{ ...dockDefaults.timerProps, timerVisible: true }}
        onTimerUpdate={vi.fn()}
      />,
    )
    expect(screen.queryByTestId('timer-progress')).not.toBeInTheDocument()
  })
})
