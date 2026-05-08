import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';
vi.mock('./service/players');
vi.mock('./service/games');
vi.mock('./repository/firebase');

// eslint-disable-next-line jest/valid-describe-callback

vi.mock('country-flag-emoji-polyfill', () => ({
  polyfillCountryFlagEmojis: vi.fn(),
}));

describe('App', () =>
  it('Should display toolbar with header', () => {
    render(<App />);
    const toolBarHeader = screen.getByText('Planning Poker');
    expect(toolBarHeader).toBeInTheDocument();
  }));
