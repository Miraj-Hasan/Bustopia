import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../Navbar/Navbar';

describe('Navbar Component (User)', () => {
  test('renders UserNavbar when regular user is logged in', () => {
    const mockUser = {
      username: 'Test User',
      role: 'ROLE_USER'
    };
    render(
      <BrowserRouter>
        <Navbar user={mockUser} />
      </BrowserRouter>
    );
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });
}); 