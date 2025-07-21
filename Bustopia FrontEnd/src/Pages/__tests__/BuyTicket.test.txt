import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import BuyTicket from '../BuyTicket/BuyTicket';
import { act } from 'react-dom/test-utils';

// Increase timeout for all tests in this file
vi.setConfig({ testTimeout: 30000 });

// Mock implementations
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('../../Api/ApiCalls', () => ({
  fetchAvailableBuses: vi.fn(),
  bookTicket: vi.fn(),
  getAllStops: vi.fn(),
  getDestinationsForSource: vi.fn(),
  getSeatLayout: vi.fn(),
  getBookedSeats: vi.fn(),
}));
import { fetchAvailableBuses, bookTicket, getAllStops, getDestinationsForSource, getSeatLayout, getBookedSeats } from '../../Api/ApiCalls';

const mockUser = { id: 1, username: 'Test User', role: 'ROLE_USER' };
const mockNavigate = vi.fn();

const mockBusData = {
  busId: 1,
  busName: 'Bus 1',
  companyName: 'Test Company',
  category: 'AC',
  availableSeats: 30,
  departureTime: '10:00',
  price: 500,
  route: {
    stops: ['A', 'B', 'C']
  }
};

function renderWithUserContext(ui, user = mockUser) {
  return render(
    <BrowserRouter>
      <UserContext.Provider value={{ user }}>
        {ui}
      </UserContext.Provider>
    </BrowserRouter>
  );
}

describe('BuyTicket Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01'));
    useNavigate.mockReturnValue(mockNavigate);
    
    // Mock API responses with immediate resolution
    getAllStops.mockResolvedValue({ data: ['A', 'B', 'C'] });
    getDestinationsForSource.mockResolvedValue({ data: ['B', 'C'] });
    fetchAvailableBuses.mockResolvedValue({ data: [mockBusData] });
    getSeatLayout.mockResolvedValue({ data: { layout: [['1A', '1B'], ['2A', '2B']] } });
    getBookedSeats.mockResolvedValue({ data: { '1A': true } });
    bookTicket.mockResolvedValue({ data: { ticketId: 123 } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders form fields and search button', async () => {
    renderWithUserContext(<BuyTicket />);
    
    await waitFor(() => {
      expect(getAllStops).toHaveBeenCalled();
      expect(screen.getByLabelText(/From:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/To:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('searches for buses and displays results', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<BuyTicket />);
    
    // Wait for initial stops and fill form
    await waitFor(async () => {
      expect(getAllStops).toHaveBeenCalled();
      const sourceSelect = screen.getByLabelText(/From:/i);
      expect(sourceSelect.querySelector('option[value="A"]')).toBeInTheDocument();
      
      // Fill form
      await user.selectOptions(sourceSelect, 'A');
      expect(getDestinationsForSource).toHaveBeenCalledWith('A');
      
      const destinationSelect = screen.getByLabelText(/To:/i);
      expect(destinationSelect.querySelector('option[value="B"]')).toBeInTheDocument();
      await user.selectOptions(destinationSelect, 'B');
      
      const dateInput = screen.getByLabelText(/Date:/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2024-01-01');
      await user.click(screen.getByRole('button', { name: /search/i }));
    }, { timeout: 10000 });
    
    // Verify bus results
    await waitFor(() => {
      expect(fetchAvailableBuses).toHaveBeenCalledWith({
        source: 'A',
        destination: 'B',
        date: '2024-01-01'
      });
      expect(screen.getByText(/Available Buses/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Company/i)).toBeInTheDocument();
      expect(screen.getByText(/AC/i)).toBeInTheDocument();
      expect(screen.getByText(/30/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('selecting a bus opens seat selection modal', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<BuyTicket />);
    
    // Complete form and search
    await waitFor(async () => {
      const sourceSelect = screen.getByLabelText(/From:/i);
      expect(sourceSelect.querySelector('option[value="A"]')).toBeInTheDocument();
      await user.selectOptions(sourceSelect, 'A');
      
      const destinationSelect = screen.getByLabelText(/To:/i);
      expect(destinationSelect.querySelector('option[value="B"]')).toBeInTheDocument();
      await user.selectOptions(destinationSelect, 'B');
      
      const dateInput = screen.getByLabelText(/Date:/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2024-01-01');
      await user.click(screen.getByRole('button', { name: /search/i }));
    }, { timeout: 10000 });
    
    // Select seats and verify layout
    await waitFor(async () => {
      expect(screen.getByText(/Test Company/i)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /select seats/i }));
      
      expect(getSeatLayout).toHaveBeenCalledWith(mockBusData.busId);
      expect(getBookedSeats).toHaveBeenCalledWith(mockBusData.busId, '2024-01-01');
      expect(screen.getByText(/1A/i)).toBeInTheDocument();
      expect(screen.getByText(/1B/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('booking ticket calls bookTicket API', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<BuyTicket />);
    
    // Complete form and search
    await waitFor(async () => {
      const sourceSelect = screen.getByLabelText(/From:/i);
      expect(sourceSelect.querySelector('option[value="A"]')).toBeInTheDocument();
      await user.selectOptions(sourceSelect, 'A');
      
      const destinationSelect = screen.getByLabelText(/To:/i);
      expect(destinationSelect.querySelector('option[value="B"]')).toBeInTheDocument();
      await user.selectOptions(destinationSelect, 'B');
      
      const dateInput = screen.getByLabelText(/Date:/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2024-01-01');
      await user.click(screen.getByRole('button', { name: /search/i }));
    }, { timeout: 10000 });
    
    // Select seat and book
    await waitFor(async () => {
      expect(screen.getByText(/Test Company/i)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /select seats/i }));
      
      expect(screen.getByText(/1B/i)).toBeInTheDocument();
      await user.click(screen.getByText(/1B/i));
      
      expect(screen.getByRole('button', { name: /book/i })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /book/i }));
      
      expect(bookTicket).toHaveBeenCalledWith({
        userId: mockUser.id,
        busId: mockBusData.busId,
        source: 'A',
        destination: 'B',
        date: '2024-01-01',
        time: mockBusData.departureTime,
        seats: ['1B']
      });
      expect(mockNavigate).toHaveBeenCalledWith('/payment', expect.any(Object));
    }, { timeout: 10000 });
  });

  test('shows error if not logged in', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<BuyTicket />, null);
    
    // Complete form and verify error
    await waitFor(async () => {
      const sourceSelect = screen.getByLabelText(/From:/i);
      expect(sourceSelect.querySelector('option[value="A"]')).toBeInTheDocument();
      await user.selectOptions(sourceSelect, 'A');
      
      const destinationSelect = screen.getByLabelText(/To:/i);
      expect(destinationSelect.querySelector('option[value="B"]')).toBeInTheDocument();
      await user.selectOptions(destinationSelect, 'B');
      
      const dateInput = screen.getByLabelText(/Date:/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2024-01-01');
      await user.click(screen.getByRole('button', { name: /search/i }));
      
      expect(screen.getByText(/Please log in to search for buses/i)).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 10000 });
  });
}); 