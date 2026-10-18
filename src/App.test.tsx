import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('shows the login form', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });
});
