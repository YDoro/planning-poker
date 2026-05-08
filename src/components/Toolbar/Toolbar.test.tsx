/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Toolbar } from './Toolbar';
const mockHistoryPush = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockHistoryPush,
}));

describe('Toolbar component', () => {
  beforeEach(() => {
    mockHistoryPush.mockClear();
  });

  it('should render correct title', () => {
    render(<Toolbar />);
    const title = screen.getByText('Planning Poker');
    expect(title).toBeInTheDocument();
  });
  it('should render Create new session button', () => {
    render(<Toolbar />);
    const newSession = screen.getByTestId('toolbar.menu.newSession');
    expect(newSession).toBeInTheDocument();
  });
  it('should render Join session button', () => {
    render(<Toolbar />);
    const newSession = screen.getByTestId('toolbar.menu.joinSession');
    expect(newSession).toBeInTheDocument();
  });
  it('should navigate to Home page when New Session button is clicked', async () => {
    render(<Toolbar />);
    const newSession = screen.getByTestId('toolbar.menu.newSession');
    await userEvent.click(newSession);
    expect(mockHistoryPush).toHaveBeenCalledWith('/');
  });
  it('should navigate to Join session page when Join Session button is clicked', async () => {
    render(<Toolbar />);
    const newSession = screen.getByTestId('toolbar.menu.joinSession');
    await userEvent.click(newSession);
    expect(mockHistoryPush).toHaveBeenCalledWith('/join');
  });
  it('should navigate to home page when Title is clicked clicked', async () => {
    render(<Toolbar />);
    const title = screen.getByText('Planning Poker');
    await userEvent.click(title);
    expect(mockHistoryPush).toHaveBeenCalledWith('/');
  });
});
