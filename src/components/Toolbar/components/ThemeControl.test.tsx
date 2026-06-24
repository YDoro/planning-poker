import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeControl } from './ThemeControl';
import { ThemeProvider } from '../../../contexts/ThemeContext';

const mockMetchMedia = (matches = true) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
  }))
}

describe('ThemeControl', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    mockMetchMedia(true)
  });

  it('renders with dark label when system prefers dark', () => {
    mockMetchMedia(true)
    render(
      <ThemeProvider>
        <ThemeControl withLabel />
      </ThemeProvider>
    );
    expect(screen.getByTestId('toolbar.menu.theme')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('renders with light label when system prefers light', () => {
    mockMetchMedia(false)
    render(
      <ThemeProvider>
        <ThemeControl withLabel />
      </ThemeProvider>
    );
    expect(screen.getByTestId('toolbar.menu.theme')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('renders with light theme by default', () => {
    mockMetchMedia(false)
    render(
      <ThemeProvider>
        <ThemeControl withLabel />
      </ThemeProvider>
    );
    expect(screen.getByTestId('toolbar.menu.theme')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('renders with dark theme if set in localStorage', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <ThemeControl withLabel />
      </ThemeProvider>
    );
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme on click', () => {
    mockMetchMedia(false)
    render(
      <ThemeProvider>
        <ThemeControl withLabel />
      </ThemeProvider>
    );
    const button = screen.getByTestId('toolbar.menu.theme');
    // Initially light
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to switch to dark
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(screen.getByText('Light')).toBeInTheDocument();

    // Click to switch back to light
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('renders only icon bydefault', () => {
    render(
      <ThemeProvider>
        <ThemeControl />
      </ThemeProvider>
    )
    expect(screen.getByTestId('toolbar.menu.theme')).toBeInTheDocument();
    expect(screen.queryByText('Light')).not.toBeInTheDocument();
    expect(screen.queryByText('Dark')).not.toBeInTheDocument();
  })
});

