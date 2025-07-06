import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import ResetPassword from '../ResetPassword/ResetPassword';
import { resetPassword } from '../../Api/ApiCalls';

// Create mock functions that persist across test runs
const mockNavigate = vi.fn();

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ token: 'test-token-123' }),
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../Api/ApiCalls', () => ({
  resetPassword: vi.fn(),
}));

vi.mock('../../assets/assets', () => ({
  default: {
    logo: 'mock-logo.png',
  },
}));

const renderWithRouter = (component) => {
  return render(
    <MemoryRouter initialEntries={['/reset-password/test-token-123']}>
      {component}
    </MemoryRouter>
  );
};

describe('ResetPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the environment variable
    vi.stubEnv('VITE_COMPANY_TITLE', 'Test Company');
  });

  describe('Component Rendering', () => {
    it('renders the reset password form correctly', () => {
      renderWithRouter(<ResetPassword />);
      
      // Check for logo
      expect(screen.getByAltText('logo')).toBeInTheDocument();
      
      // Check for company title (might be undefined in test environment)
      const titleElement = screen.getByRole('heading', { level: 3 });
      expect(titleElement).toBeInTheDocument();
      
      // Check for form elements
      expect(screen.getByLabelText('Enter New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Re-type Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
    });

    it('displays correct styling and structure', () => {
      renderWithRouter(<ResetPassword />);
      
      const section = document.querySelector('section');
      expect(section).toHaveStyle({ backgroundColor: '#9A616D' });
      
      const titleElement = screen.getByRole('heading', { level: 3 });
      expect(titleElement).toHaveStyle({ color: 'blue' });
    });
  });

  describe('Form Input Handling', () => {
    it('updates password field when typing', () => {
      renderWithRouter(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Enter New Password');
      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      
      expect(passwordInput.value).toBe('newpassword123');
    });

    it('updates confirm password field when typing', () => {
      renderWithRouter(<ResetPassword />);
      
      const confirmPasswordInput = screen.getByLabelText('Re-type Password');
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
      
      expect(confirmPasswordInput.value).toBe('newpassword123');
    });

    it('requires both password fields to be filled', () => {
      renderWithRouter(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Enter New Password');
      const confirmPasswordInput = screen.getByLabelText('Re-type Password');
      
      expect(passwordInput).toBeRequired();
      expect(confirmPasswordInput).toBeRequired();
    });
  });

  describe('Form Validation', () => {
    it('shows error toast when passwords do not match', async () => {
      renderWithRouter(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Enter New Password');
      const confirmPasswordInput = screen.getByLabelText('Re-type Password');
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
      fireEvent.click(submitButton);
      
      expect(toast.error).toHaveBeenCalledWith('Passwords did not match!');
      expect(resetPassword).not.toHaveBeenCalled();
    });

    it('proceeds with API call when passwords match', async () => {
      resetPassword.mockResolvedValue({
        status: 200,
        data: 'Password reset successful',
      });
      
      renderWithRouter(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Enter New Password');
      const confirmPasswordInput = screen.getByLabelText('Re-type Password');
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalledWith('password123', 'test-token-123');
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner and disables button during API call', async () => {
      let resolvePromise;
      resetPassword.mockImplementation(() => new Promise(resolve => {
        resolvePromise = resolve;
      }));
      
      renderWithRouter(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Enter New Password');
      const confirmPasswordInput = screen.getByLabelText('Re-type Password');
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      // Check loading state
      expect(screen.getByText('Resetting...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Check for spinner by looking for the spinner class
      const spinner = document.querySelector('.spinner-border');
      expect(spinner).toBeInTheDocument();
      
      // Resolve the promise
      resolvePromise({ status: 200, data: 'Success' });
      
      await waitFor(() => {
        expect(screen.getByText('Reset Password')).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('API Success Handling', () => {
    it('shows success toast and navigates to login on successful reset', async () => {
      resetPassword.mockResolvedValue({
        status: 200,
        data: 'Password reset successful',
      });
      
      renderWithRouter(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Enter New Password');
      const confirmPasswordInput = screen.getByLabelText('Re-type Password');
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Password reset successful');
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('API Error Handling', () => {
    it('shows error toast and navigates to forgot-password on API error', async () => {
      const errorResponse = {
        response: {
          data: 'Invalid or expired token',
        },
      };
      
      resetPassword.mockRejectedValue(errorResponse);
      
      renderWithRouter(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Enter New Password');
      const confirmPasswordInput = screen.getByLabelText('Re-type Password');
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid or expired token');
        expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
      });
    });

    it('shows default error message when error response has no data', async () => {
      const errorResponse = {
        response: {},
      };
      
      resetPassword.mockRejectedValue(errorResponse);
      
      renderWithRouter(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Enter New Password');
      const confirmPasswordInput = screen.getByLabelText('Re-type Password');
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Reset failed');
        expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
      });
    });

    it('handles network errors gracefully', async () => {
      resetPassword.mockRejectedValue(new Error('Network error'));
      
      renderWithRouter(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Enter New Password');
      const confirmPasswordInput = screen.getByLabelText('Re-type Password');
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Reset failed');
        expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
      });
    });
  });

  describe('Form Submission Prevention', () => {
    it('prevents API call when passwords do not match', async () => {
      renderWithRouter(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Enter New Password');
      const confirmPasswordInput = screen.getByLabelText('Re-type Password');
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
      fireEvent.click(submitButton);
      
      expect(toast.error).toHaveBeenCalledWith('Passwords did not match!');
      expect(resetPassword).not.toHaveBeenCalled();
    });
  });

  describe('Token Handling', () => {
    it('uses token from URL params in API call', async () => {
      resetPassword.mockResolvedValue({
        status: 200,
        data: 'Password reset successful',
      });
      
      renderWithRouter(<ResetPassword />);
      
      const passwordInput = screen.getByLabelText('Enter New Password');
      const confirmPasswordInput = screen.getByLabelText('Re-type Password');
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalledWith('password123', 'test-token-123');
      });
    });
  });

  describe('Environment Variables', () => {
    it('renders without crashing when environment variable is present', () => {
      renderWithRouter(<ResetPassword />);
      
      // Check that the component renders without crashing
      const titleElement = screen.getByRole('heading', { level: 3 });
      expect(titleElement).toBeInTheDocument();
    });

    it('handles missing environment variable gracefully', () => {
      // Clear the environment variable
      vi.unstubAllEnvs();
      
      renderWithRouter(<ResetPassword />);
      
      // Should not crash, check that the h3 element exists
      const titleElement = screen.getByRole('heading', { level: 3 });
      expect(titleElement).toBeInTheDocument();
    });
  });
});