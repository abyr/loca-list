import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loca list title', () => {
  render(<App />);

  const inboxElement = screen.getByText(/Inbox/i);
  const starredElement = screen.getByText(/Starred/i);
  const doneElement = screen.getByText(/Done/i);

  expect(inboxElement).toBeInTheDocument();
  expect(starredElement).toBeInTheDocument();
  expect(doneElement).toBeInTheDocument();
});
