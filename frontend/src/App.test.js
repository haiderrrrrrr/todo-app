import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => [],
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders todo app title', async () => {
  render(<App />);
  const title = await screen.findByRole('heading', { name: /todo list/i });
  const emptyState = await screen.findByText(/no tasks yet/i);

  expect(title).toBeInTheDocument();
  expect(emptyState).toBeInTheDocument();
});
