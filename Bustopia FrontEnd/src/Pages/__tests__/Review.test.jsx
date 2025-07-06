import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import Review from '../Review/Review';
import { act } from 'react';
import { toast } from 'react-toastify';

// Increase timeout for all tests in this file
vi.setConfig({ testTimeout: 30000 });

// Mock implementations
vi.mock('../../Api/ApiCalls', () => ({
  getAllCompanies: vi.fn(),
  getSpecificBus: vi.fn(),
  getSpecificCompanyBuses: vi.fn(),
  getReviewsByBusId: vi.fn(),
  getTravelledBuses: vi.fn(),
  uploadReviewImages: vi.fn(),
  submitReview: vi.fn(),
}));

import { 
  getAllCompanies, 
  getSpecificBus, 
  getSpecificCompanyBuses, 
  getReviewsByBusId, 
  getTravelledBuses, 
  uploadReviewImages, 
  submitReview 
} from '../../Api/ApiCalls';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');

const mockUser = { id: 1, username: 'Test User', role: 'ROLE_USER' };

const mockBusData = {
  busId: 1,
  busName: 'Test Bus',
  companyName: 'Test Company',
  licenseNo: 'ABC123',
  category: 'AC',
  photo: 'https://example.com/bus.jpg',
  stops: ['Dhaka', 'Chittagong'],
  canCurrentUserReview: true
};

const mockReviewData = {
  id: 1,
  message: 'Great service!',
  stars: 5,
  userName: 'Test User',
  reviewTime: '2024-01-01T10:00:00Z',
  images: [],
  userPhoto: 'https://example.com/user.jpg'
};

const mockCompanies = ['Company A', 'Company B', 'Company C'];

function renderWithUserContext(ui, user = mockUser) {
  return render(
    <BrowserRouter>
      <UserContext.Provider value={{ user }}>
        {ui}
      </UserContext.Provider>
    </BrowserRouter>
  );
}

describe('Review Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01'));
    
    // Mock API responses
    getAllCompanies.mockResolvedValue({ status: 200, data: mockCompanies });
    getSpecificBus.mockResolvedValue({ 
      status: 200, 
      data: { bus: mockBusData, reviews: [mockReviewData] } 
    });
    getSpecificCompanyBuses.mockResolvedValue({ 
      status: 200, 
      data: { 
        content: [mockBusData], 
        number: 0, 
        totalPages: 1 
      } 
    });
    getReviewsByBusId.mockResolvedValue({ status: 200, data: [mockReviewData] });
    getTravelledBuses.mockResolvedValue({ status: 200, data: [mockBusData] });
    uploadReviewImages.mockResolvedValue({ status: 200, data: ['image1.jpg', 'image2.jpg'] });
    submitReview.mockResolvedValue({ status: 201, data: mockReviewData });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders bus review page with search options', async () => {
    renderWithUserContext(<Review />);
    
    await waitFor(() => {
      expect(screen.getByText(/Bus Review/i)).toBeInTheDocument();
      expect(screen.getByText(/Select Bus:/i)).toBeInTheDocument();
      expect(screen.getByText(/By license no/i)).toBeInTheDocument();
      expect(screen.getByText(/By company/i)).toBeInTheDocument();
      expect(screen.getByText(/By buses travelled/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('search by license number functionality', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<Review />);
    
    await waitFor(async () => {
      // Click on license search option
      const licenseButton = screen.getByText(/By license no/i);
      await user.click(licenseButton);
      
      // Fill license form
      const licenseInput = screen.getByPlaceholderText(/Search by license no/i);
      await user.type(licenseInput, 'ABC123');
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(getSpecificBus).toHaveBeenCalledWith('ABC123', mockUser.id);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(screen.getByText(/Test Company/i)).toBeInTheDocument();
      expect(screen.getByText(/ABC123/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('search by company functionality', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<Review />);
    
    await waitFor(async () => {
      // Click on company search option
      const companyButton = screen.getByText(/By company/i);
      await user.click(companyButton);
      
      // Wait for companies to load and select one
      await waitFor(() => {
        expect(getAllCompanies).toHaveBeenCalled();
      }, { timeout: 5000 });
      
      const companySelect = screen.getByRole('combobox');
      await user.selectOptions(companySelect, 'Company A');
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(getSpecificCompanyBuses).toHaveBeenCalledWith('Company A', 0, 10, mockUser.id);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(screen.getByText(/Test Company/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('search by travelled buses functionality', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<Review />);
    
    await waitFor(async () => {
      // Click on travelled buses option
      const travelledButton = screen.getByText(/By buses travelled/i);
      await user.click(travelledButton);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(getTravelledBuses).toHaveBeenCalledWith(mockUser.id);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(screen.getByText(/Test Company/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('displays bus information when search is successful', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<Review />);
    
    await waitFor(async () => {
      // Search by license to get bus data
      const licenseButton = screen.getByText(/By license no/i);
      await user.click(licenseButton);
      
      const licenseInput = screen.getByPlaceholderText(/Search by license no/i);
      await user.type(licenseInput, 'ABC123');
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(screen.getByText(/Test Company/i)).toBeInTheDocument();
      expect(screen.getByText(/ABC123/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('handles error when license is invalid', async () => {
    const user = userEvent.setup({ delay: null });
    getSpecificBus.mockRejectedValue(new Error('Invalid license'));
    
    renderWithUserContext(<Review />);
    
    await waitFor(async () => {
      // Select license search option
      const licenseButton = screen.getByText(/By license no/i);
      await user.click(licenseButton);
      
      // Fill license form with invalid license
      const licenseInput = screen.getByPlaceholderText(/Search by license no/i);
      await user.type(licenseInput, 'INVALID123');
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(getSpecificBus).toHaveBeenCalledWith('INVALID123', mockUser.id);
    }, { timeout: 10000 });
  });

  test('shows loading state during search', async () => {
    const user = userEvent.setup({ delay: null });
    let resolveBus;
    getSpecificBus.mockImplementation(() => new Promise(resolve => { resolveBus = resolve; }));

    renderWithUserContext(<Review />);

    await user.click(screen.getByText(/By license no/i));
    await user.type(screen.getByPlaceholderText(/Search by license no/i), 'ABC123');
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    // Assert loading state
    expect(screen.getByText(/Searching/i)).toBeInTheDocument();
    expect(searchButton).toBeDisabled();

    // Now resolve the API
    act(() => {
      resolveBus({ status: 200, data: { bus: mockBusData, reviews: [mockReviewData] } });
    });

    await waitFor(() => {
      expect(screen.getByText(/Test Company/i)).toBeInTheDocument();
    });
  });

  test('handles companies API error', async () => {
    const user = userEvent.setup({ delay: null });
    getAllCompanies.mockRejectedValue(new Error('Failed to fetch companies'));

    renderWithUserContext(<Review />);

    await user.click(screen.getByText(/By company/i));
    await waitFor(() => {
      expect(getAllCompanies).toHaveBeenCalled();
    });
    // Optionally, check that toast.error was called
    expect(toast.error).toHaveBeenCalled();
  });
}); 