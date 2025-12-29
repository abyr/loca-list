import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from './App';

test('renders loca list title', async () => {
  await act(async () => {
    render(<App />);
  });

  const contextElement = screen.getByText(/Anywhere/i);
  const projectsElement = screen.getByText(/Projects/i);
  const starredElement = screen.getByText(/Starred/i);
  const doneElement = screen.getByText(/Done/i);

  expect(contextElement).toBeInTheDocument();
  expect(projectsElement).toBeInTheDocument();
  expect(starredElement).toBeInTheDocument();
  expect(doneElement).toBeInTheDocument();
});
