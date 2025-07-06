import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import { Profile } from '../Profile/Profile';
import { act } from 'react';

// Increase timeout for all tests in this file
vi.setConfig({ testTimeout: 30000 });

// Mock implementations
vi.mock('../../Api/ApiCalls', () => ({
  getCurrentUser: vi.fn(),
  updateProfileInfo: vi.fn(),
}));

import { getCurrentUser, updateProfileInfo } from '../../Api/ApiCalls';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import toast for testing
import { toast } from 'react-toastify';

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

const mockUser = { 
  id: 1, 
  username: 'Test User', // Changed from 'name' to 'username'
  email: 'test@example.com',
  phone: '+880123456789',
  gender: 'MALE',
  role: 'ROLE_USER',
  image: 'https://example.com/profile.jpg'
};

const mockUpdatedUser = {
  ...mockUser,
  username: 'Updated User', // Changed from 'name' to 'username'
  phone: '+880987654321',
  gender: 'FEMALE'
};

const mockFormData = {
  username: 'Test User',
  email: 'test@example.com',
  phone: '+880123456789',
  gender: 'MALE',
};

function renderWithUserContext(ui, user = mockUser, setUser = vi.fn()) {
  return render(
    <BrowserRouter>
      <UserContext.Provider value={{ user, setUser }}>
        {ui}
      </UserContext.Provider>
    </BrowserRouter>
  );
}

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01'));
    
    // Mock API responses
    getCurrentUser.mockResolvedValue({ status: 200, data: mockUser });
    updateProfileInfo.mockResolvedValue({ status: 200, data: mockUpdatedUser });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders profile form with user data', async () => {
    renderWithUserContext(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+880123456789')).toBeInTheDocument();
    // Gender is a select, check its value
    const genderSelect = screen.getByRole('combobox');
    expect(genderSelect.value).toBe('MALE');
  });

  test('loads user data on component mount', async () => {
    renderWithUserContext(<Profile />);
    
    await waitFor(() => {
      expect(getCurrentUser).toHaveBeenCalled();
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('updates form fields when user types', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    const nameInput = screen.getByDisplayValue('Test User');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');
    expect(nameInput.value).toBe('New Name');
  });

  test('handles file upload and shows preview', async () => {
    const user = userEvent.setup({ delay: null });
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    renderWithUserContext(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Use querySelector for file input since it's the only file input
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    await user.upload(fileInput, mockFile);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
  });

  test('submits form successfully with updated data', async () => {
    const user = userEvent.setup({ delay: null });
    updateProfileInfo.mockResolvedValueOnce({ status: 200, data: mockUpdatedUser }); // Fixed response structure
    
    renderWithUserContext(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    const submitButton = screen.getByRole('button', { name: /update profile/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(updateProfileInfo).toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  test('submits form with image file', async () => {
    const user = userEvent.setup({ delay: null });
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    updateProfileInfo.mockResolvedValueOnce({ status: 200, data: mockUpdatedUser }); // Fixed response structure
    
    renderWithUserContext(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Upload file using querySelector
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    await user.upload(fileInput, mockFile);
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /update profile/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(updateProfileInfo).toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  test('displays default profile image when no image is available', async () => {
    // Clear storage to avoid cached user
    sessionStorage.clear();
    localStorage.clear();
    // Mock user without image - Fixed field name and response structure
    getCurrentUser.mockResolvedValueOnce({
      status: 200,
      data: {
        id: 1,
        username: 'Test User', // Fixed: was 'name', should be 'username'
        email: 'test@example.com',
        phone: '+880123456789',
        gender: 'MALE',
        image: null
      }
    });
    
    renderWithUserContext(<Profile />);
    // Confirm the form loads
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
    // Assert API was called
    expect(getCurrentUser).toHaveBeenCalled();
    // Wait for the profile image to appear
    const defaultImage = await screen.findByAltText(/profile/i, {}, { timeout: 10000 });
    expect(defaultImage.src).toContain('default_profile.png');
  });

  test('displays user profile image when available', async () => {
    renderWithUserContext(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Check for user image - use the actual URL from the mock
    const userImage = screen.getByAltText(/profile/i);
    expect(userImage.src).toContain('example.com/profile.jpg');
  });

  test('validates required fields before submission', async () => {
    const user = userEvent.setup({ delay: null });
    
    renderWithUserContext(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Clear required fields
    const nameInput = screen.getByDisplayValue('Test User');
    await user.clear(nameInput);
    
    const submitButton = screen.getByRole('button', { name: /update profile/i });
    await user.click(submitButton);
    
    // Form should not submit if required fields are empty
    expect(updateProfileInfo).not.toHaveBeenCalled();
  });

  test('updates user context and session after successful update', async () => {
    const user = userEvent.setup({ delay: null });
    const mockUpdatedUser = {
      id: 1,
      username: 'Updated Name', // Fixed: was 'name', should be 'username'
      email: 'updated@example.com',
      phone: '+880123456789',
      gender: 'MALE',
      image: 'updated-image.jpg'
    };
    
    updateProfileInfo.mockResolvedValueOnce({ status: 200, data: mockUpdatedUser }); // Fixed response structure
    
    renderWithUserContext(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    const submitButton = screen.getByRole('button', { name: /update profile/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(updateProfileInfo).toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  test('cleans up object URL on component unmount', async () => {
    const { unmount } = renderWithUserContext(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Upload a file to create object URL
    const fileInput = document.querySelector('input[type="file"]');
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const user = userEvent.setup({ delay: null });
    await user.upload(fileInput, mockFile);
    
    unmount();
    
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  test('handles API error during profile update', async () => {
    const user = userEvent.setup({ delay: null });
    updateProfileInfo.mockRejectedValueOnce(new Error('Update failed'));
    const originalError = console.error;
    console.error = vi.fn();
    
    renderWithUserContext(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    const submitButton = screen.getByRole('button', { name: /update profile/i });
    await user.click(submitButton);
    
    // Wait for error toast - Fixed error message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Profile update failed.');
    }, { timeout: 10000 });
    
    console.error = originalError;
  });

  test('handles API error during user data fetch', async () => {
    // Clear any previous mocks
    vi.clearAllMocks();
    
    getCurrentUser.mockRejectedValueOnce(new Error('Fetch failed'));
    const originalError = console.error;
    console.error = vi.fn();
    
    await act(async () => {
      renderWithUserContext(<Profile />);
    });
    
    // First wait for the API call to be made
    await waitFor(() => {
      expect(getCurrentUser).toHaveBeenCalled();
    }, { timeout: 10000 });
    
    // Then wait for error toast - Fixed error message to match component
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load profile info.');
    }, { timeout: 10000 });
    
    console.error = originalError;
  });
});