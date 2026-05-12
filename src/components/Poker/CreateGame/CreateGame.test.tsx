import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { uniqueNamesGenerator } from 'unique-names-generator';
import * as gamesService from '../../../service/games';
import { CreateGame } from './CreateGame';
import { vi, Mock } from 'vitest';

vi.mock('../../../service/games');
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('unique-names-generator', () => ({
  starWars: ['Jabba'],
  colors: ['red'],
  animals: ['kangaroo'],
  uniqueNamesGenerator: vi.fn(),
  Config: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CreateGame component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('should render the form correctly', () => {
    render(<CreateGame open={true} onClose={() => { }} />);

    expect(screen.getByPlaceholderText('CreateGame.sessionNamePlaceholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('CreateGame.yourNamePlaceholder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CreateGame.create/i })).toBeInTheDocument();
  });

  it('should have default values in the input fields', () => {
    (uniqueNamesGenerator as Mock).mockReturnValueOnce('sesh name');
    (uniqueNamesGenerator as Mock).mockReturnValueOnce('user name');
    render(<CreateGame open={true} onClose={() => { }} />);
    const sessionName = screen.getByPlaceholderText('CreateGame.sessionNamePlaceholder');
    const userName = screen.getByPlaceholderText('CreateGame.yourNamePlaceholder');

    expect(sessionName).toHaveValue('sesh name');
    expect(userName).toHaveValue('user name');
  });

  it('should empty inputs when clicked', async () => {
    render(<CreateGame open={true} onClose={() => { }} />);
    const sessionName = screen.getByPlaceholderText('CreateGame.sessionNamePlaceholder');
    const userName = screen.getByPlaceholderText('CreateGame.yourNamePlaceholder');
    await userEvent.click(sessionName);
    await userEvent.click(userName);

    expect(sessionName).toHaveValue('');
    expect(userName).toHaveValue('');
  });

  it('should pre-fill the name field from localStorage', () => {
    localStorage.setItem('recentPlayerName', 'Alice');

    render(<CreateGame open={true} onClose={() => { }} />);
    expect(screen.getByPlaceholderText('CreateGame.yourNamePlaceholder')).toHaveValue('Alice');
  });

  it('should be able to create new session', async () => {
    render(<CreateGame open={true} onClose={() => { }} />);
    const sessionName = screen.getByPlaceholderText('CreateGame.sessionNamePlaceholder');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('CreateGame.yourNamePlaceholder');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const createButton = screen.getByRole('button', { name: /CreateGame.create/i });
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'Rock',
        gameType: 'Fibonacci',
        name: 'Marvels',
        isAllowMembersToManageSession: false,
      }),
    );
  });

  it('should be able to create new session with Allow members to manage session', async () => {
    render(<CreateGame open={true} onClose={() => { }} />);
    const sessionName = screen.getByPlaceholderText('CreateGame.sessionNamePlaceholder');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('CreateGame.yourNamePlaceholder');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const allowMembersToManageSession = screen.getByText('CreateGame.allowMembersToManageSession');
    await userEvent.click(allowMembersToManageSession);

    const createButton = screen.getByRole('button', { name: /CreateGame.create/i });
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'Rock',
        gameType: 'Fibonacci',
        name: 'Marvels',
        isAllowMembersToManageSession: true,
      }),
    );
  });

  it('should be able to create new session of TShirt Sizing', async () => {
    render(<CreateGame open={true} onClose={() => { }} />);
    const sessionName = screen.getByPlaceholderText('CreateGame.sessionNamePlaceholder');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('CreateGame.yourNamePlaceholder');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const selectTrigger = screen.getByRole('combobox');
    await userEvent.click(selectTrigger);
    const tShirtOption = screen.getByRole('option', { name: 'CreateGame.tShirt' });
    await userEvent.click(tShirtOption);

    const createButton = screen.getByRole('button', { name: /CreateGame.create/i });
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'Rock', gameType: 'TShirt', name: 'Marvels' }),
    );
  });

  it('should be able to create new session of Short Fibonacci Sizing', async () => {
    render(<CreateGame open={true} onClose={() => { }} />);
    const sessionName = screen.getByPlaceholderText('CreateGame.sessionNamePlaceholder');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('CreateGame.yourNamePlaceholder');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const selectTrigger = screen.getByRole('combobox');
    await userEvent.click(selectTrigger);
    const gameTypeOption = screen.getByRole('option', { name: 'CreateGame.shortFibonacci' });
    await userEvent.click(gameTypeOption);

    const createButton = screen.getByRole('button', { name: /CreateGame.create/i });
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'Rock', gameType: 'ShortFibonacci', name: 'Marvels' }),
    );
  });

  it('should be able to create new session of TShirt & Numbers', async () => {
    render(<CreateGame open={true} onClose={() => { }} />);
    const sessionName = screen.getByPlaceholderText('CreateGame.sessionNamePlaceholder');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('CreateGame.yourNamePlaceholder');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const selectTrigger = screen.getByRole('combobox');
    await userEvent.click(selectTrigger);
    const tShirtOption = screen.getByRole('option', { name: 'CreateGame.tShirtAndNumber' });
    await userEvent.click(tShirtOption);

    const createButton = screen.getByRole('button', { name: /CreateGame.create/i });
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'Rock', gameType: 'TShirtAndNumber', name: 'Marvels' }),
    );
  });

  it('should be able to create new session of Custom option', async () => {
    render(<CreateGame open={true} onClose={() => { }} />);
    const sessionName = screen.getByPlaceholderText('CreateGame.sessionNamePlaceholder');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('CreateGame.yourNamePlaceholder');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const selectTrigger = screen.getByRole('combobox');
    await userEvent.click(selectTrigger);
    const customOption = screen.getByRole('option', { name: 'CreateGame.custom' });
    await userEvent.click(customOption);

    // input custom values
    const input1 = screen.getByTestId('custom-option-1');
    await userEvent.type(input1, '1');

    const input2 = screen.getByTestId('custom-option-2');
    await userEvent.type(input2, '2');

    const createButton = screen.getByRole('button', { name: /CreateGame.create/i });
    await userEvent.click(createButton);

    expect(gamesService.addNewGame).toHaveBeenCalled();

    expect(gamesService.addNewGame).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'Rock',
        gameType: 'Custom',
        name: 'Marvels',
        cards: [
          { color: '#9EC8FE', displayValue: '1', value: 1 },
          { color: '#9EC8FE', displayValue: '2', value: 2 },
        ],
      }),
    );
  });

  it('should display error when no custom options entered', async () => {
    render(<CreateGame open={true} onClose={() => { }} />);
    const sessionName = screen.getByPlaceholderText('CreateGame.sessionNamePlaceholder');
    await userEvent.clear(sessionName);
    await userEvent.type(sessionName, 'Marvels');

    const userName = screen.getByPlaceholderText('CreateGame.yourNamePlaceholder');
    await userEvent.clear(userName);
    await userEvent.type(userName, 'Rock');

    const selectTrigger = screen.getByRole('combobox');
    await userEvent.click(selectTrigger);
    const customOption = screen.getByRole('option', { name: 'CreateGame.custom' });
    await userEvent.click(customOption);

    const createButton = screen.getByRole('button', { name: /CreateGame.create/i });
    await userEvent.click(createButton);

    await waitFor(() =>
      expect(
        screen.getByText(/CreateGame.pleaseEnterValues/i),
      ).toBeInTheDocument(),
    );
  });
});
