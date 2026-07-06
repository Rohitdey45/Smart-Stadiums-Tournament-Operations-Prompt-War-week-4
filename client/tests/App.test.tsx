import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from '../src/App.js';
import * as api from '../src/lib/api.js';

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App routing', () => {
  it('renders the home page with entry points to both personas', () => {
    renderAt('/');
    expect(
      screen.getByRole('heading', { name: /Smart Stadiums & Tournament Operations/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open the Fan Assistant' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Operations' })).toBeInTheDocument();
  });

  it('exposes a skip link and primary navigation landmarks', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('lazy-loads the assistant route on navigation', async () => {
    vi.spyOn(api, 'askAssistant').mockResolvedValue({ answer: 'x', language: 'en', cached: false });
    const user = userEvent.setup();
    renderAt('/');

    await user.click(screen.getByRole('link', { name: 'Fan Assistant' }));

    expect(
      await screen.findByRole('heading', { name: 'Matchday Fan Assistant' }),
    ).toBeInTheDocument();
  });

  it('falls back to the home page for an unknown route', () => {
    renderAt('/nowhere');
    expect(
      screen.getByRole('heading', { name: /Smart Stadiums & Tournament Operations/i }),
    ).toBeInTheDocument();
  });
});
