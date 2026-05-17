import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer component', () => {
  it('should render copyright', () => {
    render(<Footer />);
    const element = screen.getByText('hellomuthu23');
    expect(element).toBeInTheDocument();
  });
  it('should render feedback', () => {
    render(<Footer />);
    const element = screen.getByText('Feedback: hellomuthu23@gmail.com');
    expect(element).toBeInTheDocument();
  });
  it('should show link to submit issue', () => {
    render(<Footer />);
    const element = screen.getByText('Submit an Issue');
    expect(element).toBeInTheDocument();
  });
});
