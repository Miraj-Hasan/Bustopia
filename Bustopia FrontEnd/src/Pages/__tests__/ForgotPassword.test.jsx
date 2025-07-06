import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import ForgotPassword from '../ForgotPassword/ForgotPassword';
import { sendResetEmail } from '../../Api/ApiCalls';

import { vi } from 'vitest';

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../Api/ApiCalls', () => ({
  sendResetEmail: vi.fn(),
}));

vi.mock('../../assets/assets', () => ({
  default: {
    logo: 'mock-logo.png',
  },
}));

// Mock environment variable
const mockEnv = {
  VITE_COMPANY_TITLE: 'Test Company',
};

Object.defineProperty(import.meta, 'env', {
  value: mockEnv,
  writable: true,
});

// Helper function to render component with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders the forgot password form', () => {
      renderWithRouter(<ForgotPassword />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
      expect(screen.getByText(/go back to/i)).toBeInTheDocument();
    });

    test('renders logo with correct attributes', () => {
      renderWithRouter(<ForgotPassword />);
      
      const logo = screen.getByAltText('logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', 'mock-logo.png');
      expect(logo).toHaveAttribute('height', '200');
      expect(logo).toHaveAttribute('width', '200');
    });

    test('renders email input with correct attributes', () => {
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'john@example.com');
      expect(emailInput).toHaveAttribute('required');
    });

    test('renders login link with correct path', () => {
      renderWithRouter(<ForgotPassword />);
      
      const loginLink = screen.getByRole('link', { name: /login/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Form Interaction', () => {
    test('updates email state when input changes', () => {
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    test('form submission is prevented when email is empty', async () => {
      renderWithRouter(<ForgotPassword />);
      
      const form = screen.getByRole('button', { name: /send reset link/i }).closest('form');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      fireEvent.click(submitButton);
      
      // HTML5 validation should prevent submission
      expect(sendResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('API Integration', () => {
    test('calls sendResetEmail API when form is submitted with valid email', async () => {
      sendResetEmail.mockResolvedValue({ status: 200 });
      
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(sendResetEmail).toHaveBeenCalledWith('test@example.com');
      });
    });

    test('shows success toast when API call succeeds', async () => {
      sendResetEmail.mockResolvedValue({ status: 200 });
      
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Password Reset Link sent to test@example.com');
      });
    });

    test('shows error toast when API call fails with response data', async () => {
      const errorMessage = 'User not found';
      sendResetEmail.mockRejectedValue({
        response: { data: errorMessage }
      });
      
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
      });
    });

    test('shows generic error toast when API call fails without response data', async () => {
      sendResetEmail.mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
      });
    });
  });

  describe('Loading State', () => {
    test('shows loading spinner and disables button during API call', async () => {
      // Mock a delayed API response
      sendResetEmail.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 100))
      );
      
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      // Check loading state
      expect(screen.getByText(/sending.../i)).toBeInTheDocument();
      expect(screen.getByText(/sending.../i).closest('button')).toBeDisabled();
      expect(document.querySelector('.spinner-border')).toBeInTheDocument();
      
      // Wait for API call to complete
      await waitFor(() => {
        expect(screen.getByText(/send reset link/i)).toBeInTheDocument();
      });
      
      expect(submitButton).not.toBeDisabled();
    });

    test('removes loading state after API call fails', async () => {
      sendResetEmail.mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      // Wait for error handling
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
      
      // Check that loading state is removed
      expect(screen.getByText(/send reset link/i)).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    test('email input accepts valid email format', () => {
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'name+tag@company.org'
      ];
      
      validEmails.forEach(email => {
        fireEvent.change(emailInput, { target: { value: email } });
        expect(emailInput).toHaveValue(email);
      });
    });

    test('form prevents submission with invalid email (HTML5 validation)', () => {
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      // Set invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);
      
      // HTML5 validation should prevent API call
      expect(sendResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('email input has proper label association', () => {
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('id', 'email');
      
      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'email');
    });

    test('submit button has proper loading state accessibility', async () => {
      sendResetEmail.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 100))
      );
      
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      // Check spinner has proper accessibility attributes
      await waitFor(() => {
        const spinner = document.querySelector('.spinner-border');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveAttribute('aria-hidden', 'true');
      });
      
      await waitFor(() => {
        expect(screen.getByText(/send reset link/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles multiple rapid form submissions', async () => {
      sendResetEmail.mockResolvedValue({ status: 200 });
      
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      // Rapid clicks
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(sendResetEmail).toHaveBeenCalledTimes(1);
      });
    });

    test('handles empty error response', async () => {
      sendResetEmail.mockRejectedValue({ response: {} });
      
      renderWithRouter(<ForgotPassword />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
      });
    });
  });
});