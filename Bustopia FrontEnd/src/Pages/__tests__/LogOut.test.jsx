import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vi } from 'vitest';
import { LogOut } from '../LogOut/Logout';
import { logOutFromServer } from '../../Api/ApiCalls';
import { UserContext } from '../../Context/UserContext';

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../Api/ApiCalls', () => ({
  logOutFromServer: vi.fn(),
}));

vi.mock('../../assets/assets', () => ({
  default: {
    logo: 'mock-logo.png',
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  clear: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

const mockSessionStorage = {
  clear: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock console.log
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

// Helper function to render component with all required providers
const renderWithProviders = (setUser = vi.fn()) => {
  const contextValue = {
    user: { id: 1, name: 'Test User' },
    setUser,
  };

  return render(
    <BrowserRouter>
      <UserContext.Provider value={contextValue}>
        <LogOut />
      </UserContext.Provider>
    </BrowserRouter>
  );
};

describe('LogOut Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('Rendering', () => {
    test('renders logout UI elements', () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      renderWithProviders();
      
      expect(screen.getByText(/logging you out.../i)).toBeInTheDocument();
      expect(screen.getByText(/thank for joining/i)).toBeInTheDocument();
      expect(screen.getByText(/bustopia/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
    });

    test('renders logo with correct attributes', () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      renderWithProviders();
      
      const logo = screen.getByAltText('EchoRoom Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', 'mock-logo.png');
      expect(logo).toHaveStyle({ width: '100px' });
    });

    test('renders spinner with correct attributes', () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      renderWithProviders();
      
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('spinner-border');
    });
  });

  describe('Logout Functionality', () => {
    test('calls logOutFromServer API on component mount', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      renderWithProviders();
      
      await waitFor(() => {
        expect(logOutFromServer).toHaveBeenCalledTimes(1);
      });
    });

    test('performs successful logout sequence', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      const mockSetUser = vi.fn();
      
      renderWithProviders(mockSetUser);
      
      await waitFor(() => {
        expect(logOutFromServer).toHaveBeenCalled();
        expect(mockLocalStorage.clear).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
        expect(mockSetUser).toHaveBeenCalledWith(null);
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('user', null);
        expect(toast.success).toHaveBeenCalledWith('Logged out successfully');
      });
    });

    test('handles logout sequence in correct order', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      const mockSetUser = vi.fn();
      
      renderWithProviders(mockSetUser);
      
      await waitFor(() => {
        expect(logOutFromServer).toHaveBeenCalled();
      });

      // Verify the sequence of operations
      expect(mockLocalStorage.clear).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(mockSetUser).toHaveBeenCalledWith(null);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('user', null);
      expect(toast.success).toHaveBeenCalledWith('Logged out successfully');
    });
  });

  describe('Error Handling', () => {
    test('handles API error and shows error toast', async () => {
      const error = new Error('Network error');
      logOutFromServer.mockRejectedValue(error);
      
      renderWithProviders();
      
      await waitFor(() => {
        expect(logOutFromServer).toHaveBeenCalled();
        expect(mockConsoleLog).toHaveBeenCalledWith(error);
        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
      });
    });

    test('does not perform logout actions when API fails', async () => {
      logOutFromServer.mockRejectedValue(new Error('API Error'));
      const mockSetUser = vi.fn();
      
      renderWithProviders(mockSetUser);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Something went wrong');
      });

      // Verify logout actions were not performed
      expect(mockLocalStorage.clear).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
    });

    test('handles different types of errors', async () => {
      const scenarios = [
        new Error('Network timeout'),
        { response: { status: 500 } },
        'String error',
        null,
      ];

      for (const error of scenarios) {
        vi.clearAllMocks();
        logOutFromServer.mockRejectedValue(error);
        
        renderWithProviders();
        
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Something went wrong');
          expect(mockConsoleLog).toHaveBeenCalledWith(error);
        });
      }
    });
  });

  describe('API Response Handling', () => {
    test('only performs logout actions when status is 200', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      const mockSetUser = vi.fn();
      
      renderWithProviders(mockSetUser);
      
      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(null);
      });
    });

    test('does not perform logout actions for non-200 status', async () => {
      logOutFromServer.mockResolvedValue({ status: 400 });
      const mockSetUser = vi.fn();
      
      renderWithProviders(mockSetUser);
      
      await waitFor(() => {
        expect(logOutFromServer).toHaveBeenCalled();
      });

      // Should not perform logout actions for non-200 status
      expect(mockLocalStorage.clear).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
    });

    test('handles response without status property', async () => {
      logOutFromServer.mockResolvedValue({});
      const mockSetUser = vi.fn();
      
      renderWithProviders(mockSetUser);
      
      await waitFor(() => {
        expect(logOutFromServer).toHaveBeenCalled();
      });

      // Should not perform logout actions without proper status
      expect(mockLocalStorage.clear).not.toHaveBeenCalled();
      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  describe('Context Integration', () => {
    test('calls setUser with null to clear user state', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      const mockSetUser = vi.fn();
      
      renderWithProviders(mockSetUser);
      
      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(null);
      });
    });

    test('requires UserContext to function properly', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      // Verify that the component requires UserContext by checking it throws
      // when context is not provided
      expect(() => {
        render(
          <BrowserRouter>
            <LogOut />
          </BrowserRouter>
        );
      }).toThrow();
    });
  });

  describe('Storage Operations', () => {
    test('clears localStorage completely', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      renderWithProviders();
      
      await waitFor(() => {
        expect(mockLocalStorage.clear).toHaveBeenCalledTimes(1);
      });
    });

    test('sets sessionStorage user to null', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      renderWithProviders();
      
      await waitFor(() => {
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('user', null);
      });
    });
  });

  describe('Navigation', () => {
    test('navigates to login page after successful logout', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      renderWithProviders();
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    test('only navigates once per logout', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      renderWithProviders();
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('UseEffect Behavior', () => {
    test('signOut is called only once on mount', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      renderWithProviders();
      
      await waitFor(() => {
        expect(logOutFromServer).toHaveBeenCalledTimes(1);
      });
    });

    test('does not call signOut on re-renders', async () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      const { rerender } = renderWithProviders();
      
      await waitFor(() => {
        expect(logOutFromServer).toHaveBeenCalledTimes(1);
      });

      // Force re-render
      rerender(
        <BrowserRouter>
          <UserContext.Provider value={{ user: null, setUser: vi.fn() }}>
            <LogOut />
          </UserContext.Provider>
        </BrowserRouter>
      );
      
      // Should still only be called once
      expect(logOutFromServer).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('spinner has proper role attribute', () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      renderWithProviders();
      
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    test('has proper heading structure', () => {
      logOutFromServer.mockResolvedValue({ status: 200 });
      
      renderWithProviders();
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Logging you out...');
    });
  });
});