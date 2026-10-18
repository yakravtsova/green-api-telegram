import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /green-api telegram chat/i })).toBeInTheDocument();
  });
});
