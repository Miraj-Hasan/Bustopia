import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import Verify from '../VerifyEmail/Verify';
import { verifyEmailLink } from '../../Api/ApiCalls';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../Api/ApiCalls', () => ({
  verifyEmailLink: vi.fn(),
}));

// Import mocked modules
import { useSearchParams, useNavigate } from 'react-router-dom';

describe('Verify Component', () => {
  let mockNavigate;
  let mockSearchParams;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mocks
    mockNavigate = vi.fn();
    mockSearchParams = new URLSearchParams();
    
    useNavigate.mockReturnValue(mockNavigate);
    useSearchParams.mockReturnValue([mockSearchParams]);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Verify />
      </BrowserRouter>
    );
  };

  describe('Initial State', () => {
    it('should render verifying state initially when code and email are present', () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('email', 'test@example.com');
      
      verifyEmailLink.mockResolvedValueOnce({ status: 200 });
      
      renderComponent();
      
      expect(screen.getByText('Verifying your account...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render error state when code is missing', () => {
      mockSearchParams.set('email', 'test@example.com');
      
      renderComponent();
      
      expect(screen.getByText('Verification failed or expired.')).toBeInTheDocument();
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Missing verification parameters.');
    });

    it('should render error state when email is missing', () => {
      mockSearchParams.set('code', 'test-code');
      
      renderComponent();
      
      expect(screen.getByText('Verification failed or expired.')).toBeInTheDocument();
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Missing verification parameters.');
    });

    it('should render error state when both code and email are missing', () => {
      renderComponent();
      
      expect(screen.getByText('Verification failed or expired.')).toBeInTheDocument();
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Missing verification parameters.');
    });
  });

  describe('Successful Verification', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle successful verification', async () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('email', 'test@example.com');
      
      verifyEmailLink.mockResolvedValueOnce({ status: 200 });
      
      renderComponent();
      
      // Initially should show verifying state
      expect(screen.getByText('Verifying your account...')).toBeInTheDocument();
      
      // Wait for verification to complete
      await waitFor(() => {
        expect(screen.getByText('Account verified! Redirecting to login...')).toBeInTheDocument();
      });
      
      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith('Your account has been verified!');
      expect(verifyEmailLink).toHaveBeenCalledWith('test-code', 'test@example.com');
    });

    it('should navigate to login after successful verification', async () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('email', 'test@example.com');
      
      verifyEmailLink.mockResolvedValueOnce({ status: 200 });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Account verified! Redirecting to login...')).toBeInTheDocument();
      });
      
      // Fast-forward time to trigger navigation
      vi.advanceTimersByTime(3000);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Failed Verification', () => {
    it('should handle verification failure with error response', async () => {
      mockSearchParams.set('code', 'invalid-code');
      mockSearchParams.set('email', 'test@example.com');
      
      const errorResponse = {
        response: {
          data: 'Invalid verification code'
        }
      };
      
      verifyEmailLink.mockRejectedValueOnce(errorResponse);
      
      renderComponent();
      
      // Initially should show verifying state
      expect(screen.getByText('Verifying your account...')).toBeInTheDocument();
      
      // Wait for verification to fail
      await waitFor(() => {
        expect(screen.getByText('Verification failed or expired.')).toBeInTheDocument();
      });
      
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Invalid verification code');
      expect(verifyEmailLink).toHaveBeenCalledWith('invalid-code', 'test@example.com');
    });

    it('should handle verification failure without error response', async () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('email', 'test@example.com');
      
      const errorResponse = new Error('Network error');
      
      verifyEmailLink.mockRejectedValueOnce(errorResponse);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Verification failed or expired.')).toBeInTheDocument();
      });
      
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Verification failed.');
    });

    it('should handle non-200 status response', async () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('email', 'test@example.com');
      
      verifyEmailLink.mockResolvedValueOnce({ status: 400 });
      
      renderComponent();
      
      // Initially should show verifying state
      expect(screen.getByText('Verifying your account...')).toBeInTheDocument();
      
      // Component should remain in verifying state since it doesn't handle non-200 responses
      // The component logic only sets success on status 200, otherwise stays in verifying state
      await waitFor(() => {
        expect(screen.getByText('Verifying your account...')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('API Integration', () => {
    it('should call verifyEmailLink with correct parameters', async () => {
      mockSearchParams.set('code', 'abc123');
      mockSearchParams.set('email', 'user@test.com');
      
      verifyEmailLink.mockResolvedValueOnce({ status: 200 });
      
      renderComponent();
      
      await waitFor(() => {
        expect(verifyEmailLink).toHaveBeenCalledWith('abc123', 'user@test.com');
      });
    });

    it('should only call verifyEmailLink once', async () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('email', 'test@example.com');
      
      verifyEmailLink.mockResolvedValueOnce({ status: 200 });
      
      renderComponent();
      
      await waitFor(() => {
        expect(verifyEmailLink).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('UI Elements', () => {
    it('should display correct spinner during verification', () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('email', 'test@example.com');
      
      renderComponent();
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('spinner-border', 'text-primary');
      expect(spinner).toHaveStyle({ width: '3rem', height: '3rem' });
    });

    it('should display success icon with correct styling', async () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('email', 'test@example.com');
      
      verifyEmailLink.mockResolvedValueOnce({ status: 200 });
      
      renderComponent();
      
      await waitFor(() => {
        const successIcon = screen.getByText('✅');
        expect(successIcon).toHaveClass('text-success');
        expect(successIcon).toHaveStyle({ fontSize: '3rem' });
      });
    });

    it('should display error icon with correct styling', () => {
      renderComponent();
      
      const errorIcon = screen.getByText('❌');
      expect(errorIcon).toHaveClass('text-danger');
      expect(errorIcon).toHaveStyle({ fontSize: '3rem' });
    });

    it('should have proper container styling', () => {
      renderComponent();
      
      const container = screen.getByText('Verification failed or expired.').closest('div');
      expect(container).toHaveClass('container', 'd-flex', 'flex-column', 'justify-content-center', 'align-items-center');
      expect(container).toHaveStyle({ minHeight: '70vh', textAlign: 'center' });
    });
  });
});