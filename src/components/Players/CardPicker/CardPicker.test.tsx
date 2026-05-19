/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Game } from '../../../core/domain/entities/Game';
import { Player } from '../../../core/domain/entities/Player';
import { Task } from '../../../core/domain/entities/Task';
import { GameType } from '../../../types/game';
import * as cardConfigs from './CardConfigs';
import { getCards } from './CardConfigs';
import { CardPicker } from './CardPicker';
import { vi } from 'vitest';

describe('CardPicker component', () => {
  beforeEach(() => {
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) {
      mockStore.voteOnTask.mockClear();
    }
  });

  const createMockGame = () => {
    const game = new Game('xyz', 'testGame', false);
    game.createdById = 'abc';
    game.cards = [
      { value: 1, displayValue: '1', color: 'red' },
      { value: 2, displayValue: '2', color: 'blue' },
      { value: 3, displayValue: 'xl', color: 'green' },
    ];
    game.gameType = GameType.Fibonacci;
    const task = new Task('task-1', 'Story 1', '', 'voting');
    game.tasks = [task];
    game.currentTaskId = 'task-1';
    return game;
  };

  const createMockPlayers = () => {
    const p1 = new Player('a1', 'SpiderMan');
    p1.value = 0;
    const p2 = new Player('a2', 'IronMan');
    p2.value = 3;
    return [p1, p2];
  };

  it('should display correct card values', () => {
    const game = createMockGame();
    game.cards = getCards(GameType.Fibonacci);
    const view = render(
      <CardPicker
        game={game}
        players={createMockPlayers()}
        currentPlayerId="a1"
      />,
    );

    getCards(GameType.Fibonacci)
      .filter((a) => a.value >= 0)
      .forEach((card) => {
        const cardElement = view.container.querySelector(`#card-${card.displayValue}`);
        expect(cardElement).toBeInTheDocument();
        const cardValueElement = screen.queryAllByText(card.value);
        expect(cardValueElement.length).toBeGreaterThan(0);
      });
  });

  it('should display correct card values for ShortFibonacci game type', () => {
    const game = createMockGame();
    game.cards = getCards(GameType.ShortFibonacci);
    game.gameType = GameType.ShortFibonacci;
    const view = render(
      <CardPicker
        game={game}
        players={createMockPlayers()}
        currentPlayerId="a1"
      />,
    );

    getCards(GameType.ShortFibonacci)
      .filter((a) => a.value >= 0)
      .forEach((card) => {
        const cardElement = view.container.querySelector(`#card-${card.displayValue}`);
        expect(cardElement).toBeInTheDocument();
        const cardValueElement = screen.queryAllByText(card.displayValue);
        expect(cardValueElement.length).toBeGreaterThan(0);
      });
  });

  it('should display correct card values TShirt game type', () => {
    const game = createMockGame();
    game.cards = getCards(GameType.TShirt);
    game.gameType = GameType.TShirt;
    const view = render(
      <CardPicker
        game={game}
        players={createMockPlayers()}
        currentPlayerId="a1"
      />,
    );

    getCards(GameType.TShirt)
      .filter((a) => a.value >= 0)
      .forEach((card) => {
        const cardElement = view.container.querySelector(`#card-${card.displayValue}`);
        expect(cardElement).toBeInTheDocument();
        const cardValueElement = screen.queryAllByText(card.displayValue);
        expect(cardValueElement.length).toBeGreaterThan(0);
      });
  });

  it('should display correct card values TShirt & Numbers game type', () => {
    const game = createMockGame();
    game.cards = getCards(GameType.TShirtAndNumber);
    game.gameType = GameType.TShirtAndNumber;
    const view = render(
      <CardPicker
        game={game}
        players={createMockPlayers()}
        currentPlayerId="a1"
      />,
    );

    getCards(GameType.TShirtAndNumber)
      .filter((a) => a.value >= 0)
      .forEach((card) => {
        const cardElement = view.container.querySelector(`#card-${card.displayValue}`);
        expect(cardElement).toBeInTheDocument();
        const cardValueElement = screen.queryAllByText(card.displayValue);
        expect(cardValueElement.length).toBeGreaterThan(0);
      });
  });

  it('should display correct card values for Custom type', () => {
    const game = createMockGame();
    game.gameType = GameType.TShirtAndNumber;
    const view = render(
      <CardPicker
        game={game}
        players={createMockPlayers()}
        currentPlayerId="a1"
      />,
    );

    game.cards
      .filter((a) => a.value >= 0)
      .forEach((card) => {
        const cardElement = view.container.querySelector(`#card-${card.displayValue}`);
        expect(cardElement).toBeInTheDocument();
        const cardValueElement = screen.queryAllByText(card.displayValue);
        expect(cardValueElement.length).toBeGreaterThan(0);
      });
  });

  it('should update player value when player clicks on a card', async () => {
    const game = createMockGame();
    const players = createMockPlayers();
    vi.spyOn(cardConfigs, 'getRandomEmoji').mockReturnValue('something');
    render(<CardPicker game={game} players={players} currentPlayerId="a1" />);
    const cardValueElement = screen.queryAllByText(1);
    await userEvent.click(cardValueElement[0]);
    const mockStore = (globalThis as any).mockStoreState;
    expect(mockStore.voteOnTask).toHaveBeenCalled();
    expect(mockStore.voteOnTask).toHaveBeenCalledWith('xyz', 'a1', 1, 'something');
  });

  it('should not update player value when player clicks on a card and game is finished', async () => {
    const game = createMockGame();
    game.isFinished = true;
    const players = createMockPlayers();
    render(
      <CardPicker
        game={game}
        players={players}
        currentPlayerId="a1"
      />,
    );
    const cardValueElement = screen.queryAllByText(1);
    await userEvent.click(cardValueElement[0]);
    const mockStore = (globalThis as any).mockStoreState;
    expect(mockStore.voteOnTask).not.toHaveBeenCalled();
  });

  it('should display Click on the card to vote when game is not finished', () => {
    const game = createMockGame();
    render(<CardPicker game={game} players={createMockPlayers()} currentPlayerId="a1" />);
    const helperText = screen.getByText('Click on the card to vote');
    expect(helperText).toBeInTheDocument();
  });

  it('should display wait message to vote when game is finished', () => {
    const game = createMockGame();
    game.isFinished = true;
    render(
      <CardPicker
        game={game}
        players={createMockPlayers()}
        currentPlayerId="a1"
      />,
    );
    const helperText = screen.getByText(
      'Session not ready for Voting! Wait for moderator to start',
    );
    expect(helperText).toBeInTheDocument();
  });
});
