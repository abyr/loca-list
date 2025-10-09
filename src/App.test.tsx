import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loca list title', () => {
  render(<App />);
  const linkElement = screen.getByText(/Loca List/i);
  expect(linkElement).toBeInTheDocument();
});
