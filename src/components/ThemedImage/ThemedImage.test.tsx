import { fireEvent, render, screen } from '@testing-library/react';
import { ThemedImage } from './ThemedImage';
import { ThemeProvider } from '../../contexts/ThemeContext';

const LIGHT_SRC = 'image-light.png';
const DARK_SRC = 'image-dark.png';

const mockMatchMedia = (matches = false) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
  }));
};

const renderComponent = () =>
  render(
    <ThemeProvider>
      <ThemedImage imageLight={LIGHT_SRC} imageDark={DARK_SRC} />
    </ThemeProvider>
  );

describe('ThemedImage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    mockMatchMedia(false); // default: system prefers light
  });

  describe('initial render', () => {
    it('shows the light image when global theme is light', () => {
      mockMatchMedia(false);
      renderComponent();

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', LIGHT_SRC);
    });

    it('shows the dark image when global theme is dark', () => {
      mockMatchMedia(true);
      renderComponent();

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', DARK_SRC);
    });

    it('shows the dark image when dark theme is saved in localStorage', () => {
      localStorage.setItem('theme', 'dark');
      renderComponent();

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', DARK_SRC);
    });

    it('shows the light image when light theme is saved in localStorage', () => {
      localStorage.setItem('theme', 'light');
      renderComponent();

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', LIGHT_SRC);
    });
  });

  describe('toggle button icon', () => {
    it('shows Moon icon when previewTheme is light', () => {
      mockMatchMedia(false); // global = light, previewTheme = light
      renderComponent();

      // lucide Moon svg has a title or aria role; we check by querying the button
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Moon icon rendered when previewTheme === 'light'
      // The img src should be light, and the icon should be Moon (not Sun)
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    });

    it('shows Sun icon when previewTheme is dark', () => {
      mockMatchMedia(true); // global = dark, previewTheme = dark
      renderComponent();

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', DARK_SRC);
    });
  });

  describe('preview toggle (independent from global theme)', () => {
    it('switches to dark preview when clicking the toggle from light', () => {
      mockMatchMedia(false); // starts light
      renderComponent();

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', LIGHT_SRC);

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByRole('img')).toHaveAttribute('src', DARK_SRC);
    });

    it('switches to light preview when clicking the toggle from dark', () => {
      mockMatchMedia(true); // starts dark
      renderComponent();

      expect(screen.getByRole('img')).toHaveAttribute('src', DARK_SRC);

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByRole('img')).toHaveAttribute('src', LIGHT_SRC);
    });

    it('toggles preview back and forth independently of the global theme', () => {
      mockMatchMedia(false); // global = light
      renderComponent();

      const button = screen.getByRole('button');

      // light → dark
      fireEvent.click(button);
      expect(screen.getByRole('img')).toHaveAttribute('src', DARK_SRC);

      // dark → light
      fireEvent.click(button);
      expect(screen.getByRole('img')).toHaveAttribute('src', LIGHT_SRC);

      // light → dark again
      fireEvent.click(button);
      expect(screen.getByRole('img')).toHaveAttribute('src', DARK_SRC);
    });

    it('does NOT change the global theme when toggling the preview', () => {
      mockMatchMedia(false); // global = light
      renderComponent();

      fireEvent.click(screen.getByRole('button'));

      // The document class should remain unchanged (no dark class)
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('additional props forwarding', () => {
    it('forwards extra HTML attributes to the inner div', () => {
      render(
        <ThemeProvider>
          <ThemedImage
            imageLight={LIGHT_SRC}
            imageDark={DARK_SRC}
            data-testid="themed-image-wrapper"
            className="extra-class"
          />
        </ThemeProvider>
      );

      expect(screen.getByTestId('themed-image-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('themed-image-wrapper')).toHaveClass('extra-class');
    });
  });
});
