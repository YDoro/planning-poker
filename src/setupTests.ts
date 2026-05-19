// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { vi } from 'vitest';
globalThis.jest = vi as any;
import en from '../public/locales/en/translation.json'; // adjust the path as needed

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

i18n.use(initReactI18next).init({
  lng: 'en', // set your default language here
  fallbackLng: 'en',
  resources: {
    en: {
      translation: en,
    },
  },
  interpolation: { escapeValue: false },
});

global.ResizeObserver = vi.fn().mockImplementation(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

if (typeof window !== 'undefined') {
  HTMLElement.prototype.hasPointerCapture = vi.fn();
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

export const mockStoreState = {
  game: null as any,
  players: [] as any[],
  isLoading: false,
  connectToGame: vi.fn(() => vi.fn()),
  createGame: vi.fn().mockResolvedValue({ gameId: 'mockGameId', creatorId: 'mockCreatorId' }),
  addPlayer: vi.fn().mockResolvedValue('mockPlayerId'),
  voteOnTask: vi.fn(),
  revealCards: vi.fn(),
  nextTask: vi.fn(),
  finishGame: vi.fn(),
  removePlayer: vi.fn(),
  changeCurrentTask: vi.fn(),
  addTask: vi.fn(),
  editTask: vi.fn(),
  deleteTask: vi.fn(),
  reorderTasks: vi.fn(),
  updateStoryName: vi.fn(),
  updateGame: vi.fn(),
  deleteGame: vi.fn(),
  getCurrentPlayer: vi.fn((playerId) => mockStoreState.players.find(p => p.id === playerId)),
  setDontVote: vi.fn(),
};

(globalThis as any).mockStoreState = mockStoreState;

const mockUseGameStore = Object.assign(
  (selector: any) => selector(mockStoreState),
  {
    getState: () => mockStoreState,
    setState: (fnOrState: any) => {
      const next = typeof fnOrState === 'function' ? fnOrState(mockStoreState) : fnOrState;
      Object.assign(mockStoreState, next);
    },
    subscribe: vi.fn(),
  }
);

vi.mock('../../presentation/stores/useGameStore', () => ({
  useGameStore: mockUseGameStore,
}));

vi.mock('../../../presentation/stores/useGameStore', () => ({
  useGameStore: mockUseGameStore,
}));

vi.mock('@/src/presentation/stores/useGameStore', () => ({
  useGameStore: mockUseGameStore,
}));

