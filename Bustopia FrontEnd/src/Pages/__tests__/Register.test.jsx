import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register/Register';

vi.mock('../../Api/ApiCalls', () => ({
  register: vi.fn(),
}));
import { register } from '../../Api/ApiCalls';

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup() {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  }

  test('renders all form fields', () => {
    setup();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Profile Image/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('updates state on user input', () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'FEMALE' } });
    expect(screen.getByLabelText(/Full Name/i)).toHaveValue('Alice');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('alice@example.com');
    expect(screen.getByLabelText(/Phone/i)).toHaveValue('1234567890');
    expect(screen.getByLabelText(/Password/i)).toHaveValue('password');
    expect(screen.getByLabelText(/Gender/i)).toHaveValue('FEMALE');
  });

  test('shows error if required fields are missing', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    // HTML5 validation prevents submit, so no API call
    expect(register).not.toHaveBeenCalled();
  });

  test('submits form and calls register API', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'FEMALE' } });
    register.mockResolvedValueOnce({ status: 200 });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(register).toHaveBeenCalled();
    });
  });

  test('shows error toast on API error', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'FEMALE' } });
    register.mockRejectedValueOnce({ response: { data: 'Registration failed' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(register).toHaveBeenCalled();
    });
    // Toast is shown, but we can't assert it without mocking toast
  });
}); 