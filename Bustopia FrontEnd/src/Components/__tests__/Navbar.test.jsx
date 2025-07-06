// This file tests the GuestNavbar (no user in sessionStorage)
import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../Navbar/Navbar';

describe('Navbar Component (Guest)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test('renders GuestNavbar when user is not logged in', () => {
    render(
      <BrowserRouter>
        <Navbar user={undefined} />
      </BrowserRouter>
    );
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });
}); 