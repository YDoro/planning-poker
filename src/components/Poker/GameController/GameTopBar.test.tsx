import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Game } from '../../../core/domain/entities/Game'
import { Player, PlayerStatus } from '../../../core/domain/entities/Player'
import { GameTopBar } from './GameTopBar'
import { vi } from 'vitest'

import { Task } from '../../../core/domain/entities/Task'

const mockNavigate = vi.fn()
document.execCommand = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

describe('GameTopBar component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    const mockStore = (globalThis as any).mockStoreState
    if (mockStore) {
      mockStore.revealCards.mockClear()
      mockStore.nextTask.mockClear()
      mockStore.updateGame.mockClear()
      mockStore.deleteGame.mockClear()
    }
  })

  const createMockGame = () => {
    const game = new Game('xyz', 'testGame', false)
    game.createdById = 'abc'
    game.cards = [
      { value: 1, displayValue: '1', color: 'red' },
      { value: 2, displayValue: '2', color: 'blue' },
      { value: 3, displayValue: '3', color: 'green' },
    ]
    const task = new Task('task1', 'testStory', '', 'voting')
    game.tasks = [task]
    game.currentTaskId = 'task1'
    game.isFinished = false
    return game
  }

  const mockCurrentPlayerId = 'abc'
  const mockPlayers = [
    new Player('abc', 'Player1'),
  ]
  mockPlayers[0].status = PlayerStatus.Finished
  mockPlayers[0].value = 2

  it('should display game name', () => {
    render(
      <GameTopBar
        game={createMockGame()}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    )
    expect(screen.getByText('testGame')).toBeInTheDocument()
  })

  it('should display game status', () => {
    render(
      <GameTopBar
        game={createMockGame()}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    )

    const statusSpan = screen.getByText(/GameController.sessionStatus.inProgress/)
    expect(statusSpan).toHaveTextContent('⏱️')
  })

  it('should display exit option', () => {
    render(
      <GameTopBar
        game={createMockGame()}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    )

    expect(screen.getByTestId('exit-button')).toBeInTheDocument()
  })

  it('should display invite option', () => {
    render(
      <GameTopBar
        game={createMockGame()}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    )

    expect(screen.getByTestId('invite-button')).toBeInTheDocument()
  })

  it('should copy invite link to clipboard', async () => {
    render(
      <GameTopBar
        game={createMockGame()}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    )

    await userEvent.click(screen.getByTestId('invite-button'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/join/xyz'),
    )
  })

  it('should navigate to home page when exit button is clicked', async () => {
    render(
      <GameTopBar
        game={createMockGame()}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    )

    await userEvent.click(screen.getByTestId('exit-button'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  describe('When Player is Moderator', () => {
    it('should display reveal option', () => {
      render(
        <GameTopBar
          game={createMockGame()}
          currentPlayerId={mockCurrentPlayerId}
          players={mockPlayers}
        />,
      )

      expect(screen.getByTestId('reveal-button')).toBeInTheDocument()
    })

    it('should reveal cards when player clicks on Reveal button', async () => {
      render(
        <GameTopBar
          game={createMockGame()}
          currentPlayerId={mockCurrentPlayerId}
          players={mockPlayers}
        />,
      )
      await userEvent.click(screen.getByTestId('reveal-button'))
      const mockStore = (globalThis as any).mockStoreState
      expect(mockStore.revealCards).toHaveBeenCalledWith('xyz')
    })
  })
})
