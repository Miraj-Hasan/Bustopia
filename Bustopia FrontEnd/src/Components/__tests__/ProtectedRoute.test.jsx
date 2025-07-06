import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../RouterProtection/ProtectedRoute';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock Navigate component
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: vi.fn(({ to, replace }) => {
      mockNavigate(to, replace);
      return <div data-testid="navigate-mock">Redirecting to {to}</div>;
    }),
  };
});

describe('ProtectedRoute', () => {
  // Mock child component for testing
  const MockChildComponent = () => <div data-testid="protected-content">Protected Content</div>;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Mock sessionStorage globally
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });
    // Reset sessionStorage mock
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    // Clean up after each test
    vi.clearAllMocks();
  });

  describe('when user is authenticated', () => {
    it('should render children when valid user data exists in sessionStorage', () => {
      // Arrange
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate-mock')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should render children when user object has minimal required data', () => {
      // Arrange
      const mockUser = { id: 1 };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should render children when user is an empty object but truthy', () => {
      // Arrange
      const mockUser = {};
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('when user is not authenticated', () => {
    it('should redirect to login when no user data in sessionStorage', () => {
      // Arrange
      mockSessionStorage.getItem.mockReturnValue(null);

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login', true);
    });

    it('should redirect to login when sessionStorage user item is empty string', () => {
      // Arrange
      mockSessionStorage.getItem.mockReturnValue('');

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login', true);
    });

    it('should redirect to login when sessionStorage user item is null string', () => {
      // Arrange
      mockSessionStorage.getItem.mockReturnValue('null');

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login', true);
    });

    it('should redirect to login when sessionStorage user item is undefined string', () => {
      // Arrange
      mockSessionStorage.getItem.mockReturnValue('undefined');

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login', true);
    });
  });

  describe('error handling', () => {
    it('should redirect to login when sessionStorage contains invalid JSON', () => {
      // Arrange
      mockSessionStorage.getItem.mockReturnValue('invalid-json{');

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login', true);
    });

    it('should handle sessionStorage getItem throwing an error', () => {
      // Arrange
      mockSessionStorage.getItem.mockImplementation(() => {
        throw new Error('SessionStorage not available');
      });

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate-mock')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login', true);
    });
  });

  describe('children prop handling', () => {
    it('should render multiple children when authenticated', () => {
      // Arrange
      const mockUser = { id: 1, name: 'John Doe' };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should render complex nested children when authenticated', () => {
      // Arrange
      const mockUser = { id: 1, name: 'John Doe' };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div data-testid="parent">
              <div data-testid="nested-child">Nested Content</div>
            </div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByTestId('nested-child')).toBeInTheDocument();
    });
  });

  describe('Navigate component behavior', () => {
    it('should call Navigate with correct props', () => {
      // Arrange
      mockSessionStorage.getItem.mockReturnValue(null);

      // Act
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockChildComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      // Assert
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login', true);
    });
  });
});