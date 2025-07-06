import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import TicketVerification from '../TicketVerification/TicketVerification';
import { act } from 'react';

// Increase timeout for all tests in this file
vi.setConfig({ testTimeout: 30000 });

// Mock implementations
vi.mock('../../Api/ApiCalls', () => ({
  getAllCompanies: vi.fn(),
  verifyTicket: vi.fn(),
}));

import { getAllCompanies, verifyTicket } from '../../Api/ApiCalls';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUser = { id: 1, username: 'Test User', role: 'ROLE_USER' };

const mockCompanies = ['Company A', 'Company B', 'Company C'];

const mockValidTicket = {
  verified: true,
  userName: 'John Doe',
  busCompany: 'Test Company',
  busType: 'AC',
  date: '2024-01-01',
  scheduledStartTime: '10:00 AM',
  price: 500,
  busPhoto: 'https://example.com/bus.jpg'
};

const mockInvalidTicket = {
  verified: false
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

describe('TicketVerification Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01'));
    
    // Mock API responses
    getAllCompanies.mockResolvedValue({ status: 200, data: mockCompanies });
    verifyTicket.mockResolvedValue({ status: 200, data: mockValidTicket });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders ticket verification form', async () => {
    renderWithUserContext(<TicketVerification />);
    
    await waitFor(() => {
      expect(screen.getByText(/Ticket Verification/i)).toBeInTheDocument();
      expect(screen.getByText(/Verify Ticket/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter ticket code/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('loads companies on component mount', async () => {
    renderWithUserContext(<TicketVerification />);
    
    await waitFor(() => {
      expect(getAllCompanies).toHaveBeenCalled();
    }, { timeout: 10000 });
    
    await waitFor(() => {
      const companySelect = screen.getByRole('combobox');
      expect(companySelect.querySelector('option[value="Company A"]')).toBeInTheDocument();
      expect(companySelect.querySelector('option[value="Company B"]')).toBeInTheDocument();
      expect(companySelect.querySelector('option[value="Company C"]')).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('verifies valid ticket successfully', async () => {
    const user = userEvent.setup({ delay: null });
    let resolveVerify;
    verifyTicket.mockImplementation(() => new Promise(resolve => { resolveVerify = resolve; }));
    
    renderWithUserContext(<TicketVerification />);
    
    // Wait for company option to appear
    await waitFor(() => {
      expect(screen.getByRole('combobox').querySelector('option[value="Company A"]')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Fill ticket code
    const ticketInput = screen.getByPlaceholderText(/Enter ticket code/i);
    await user.type(ticketInput, 'TICKET123');
    
    // Select company
    const companySelect = screen.getByRole('combobox');
    await user.selectOptions(companySelect, 'Company A');
    
    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    await user.click(verifyButton);
    
    // Resolve the API call
    act(() => {
      resolveVerify({ status: 200, data: mockValidTicket });
    });
    
    // Wait for the verification to complete
    await waitFor(() => {
      expect(verifyTicket).toHaveBeenCalledWith('TICKET123', 'Company A');
    }, { timeout: 10000 });
    
    // Check for success indicators
    expect(screen.getByText(/Valid Ticket/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Company/i)).toBeInTheDocument();
    expect(screen.getByText(/AC/i)).toBeInTheDocument();
    expect(screen.getByText(/2024-01-01/i)).toBeInTheDocument();
    expect(screen.getByText(/10:00 AM/i)).toBeInTheDocument();
    expect(screen.getByText(/500 Taka/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Successfully/i)).toBeInTheDocument();
  });

  test('handles invalid ticket verification', async () => {
    const user = userEvent.setup({ delay: null });
    verifyTicket.mockResolvedValue({ status: 200, data: mockInvalidTicket });
    
    renderWithUserContext(<TicketVerification />);
    
    await waitFor(async () => {
      // Fill ticket code
      const ticketInput = screen.getByPlaceholderText(/Enter ticket code/i);
      await user.type(ticketInput, 'INVALID123');
      
      // Select company
      const companySelect = screen.getByRole('combobox');
      await user.selectOptions(companySelect, 'Company A');
      
      // Click verify button
      const verifyButton = screen.getByRole('button', { name: /verify/i });
      await user.click(verifyButton);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(verifyTicket).toHaveBeenCalledWith('INVALID123', 'Company A');
      expect(screen.getByText(/This ticket is not valid/i)).toBeInTheDocument();
      expect(screen.getByText(/Please check the code and company and try again/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('shows error when form is incomplete', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<TicketVerification />);
    
    await waitFor(async () => {
      // Click verify button without filling form
      const verifyButton = screen.getByRole('button', { name: /verify/i });
      await user.click(verifyButton);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(verifyTicket).not.toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  test('shows error when only ticket code is provided', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<TicketVerification />);
    
    await waitFor(async () => {
      // Fill only ticket code
      const ticketInput = screen.getByPlaceholderText(/Enter ticket code/i);
      await user.type(ticketInput, 'TICKET123');
      
      // Click verify button without selecting company
      const verifyButton = screen.getByRole('button', { name: /verify/i });
      await user.click(verifyButton);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(verifyTicket).not.toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  test('shows error when only company is selected', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<TicketVerification />);
    
    // Wait for company option to appear
    await waitFor(() => {
      expect(screen.getByRole('combobox').querySelector('option[value="Company A"]')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Select only company
    const companySelect = screen.getByRole('combobox');
    await user.selectOptions(companySelect, 'Company A');
    
    // Click verify button without entering ticket code
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    await user.click(verifyButton);
    
    // Verify that the API was not called
    expect(verifyTicket).not.toHaveBeenCalled();
  });

  test('handles API error during verification', async () => {
    const user = userEvent.setup({ delay: null });
    let rejectVerify;
    verifyTicket.mockImplementation(() => new Promise((resolve, reject) => { rejectVerify = reject; }));
    
    renderWithUserContext(<TicketVerification />);
    
    // Fill form
    const ticketInput = screen.getByPlaceholderText(/Enter ticket code/i);
    await user.type(ticketInput, 'TICKET123');
    
    const companySelect = screen.getByRole('combobox');
    await user.selectOptions(companySelect, 'Company A');
    
    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    await user.click(verifyButton);
    
    // Reject the API call
    act(() => {
      rejectVerify(new Error('Network error'));
    });
    
    // Wait for the API call to be made
    await waitFor(() => {
      expect(verifyTicket).toHaveBeenCalledWith('TICKET123', 'Company A');
    }, { timeout: 10000 });
  });

  test('shows loading state during verification', async () => {
    const user = userEvent.setup({ delay: null });
    let resolveVerify;
    verifyTicket.mockImplementation(() => new Promise(resolve => { resolveVerify = resolve; }));
    
    renderWithUserContext(<TicketVerification />);
    
    await waitFor(async () => {
      // Fill form
      const ticketInput = screen.getByPlaceholderText(/Enter ticket code/i);
      await user.type(ticketInput, 'TICKET123');
      
      const companySelect = screen.getByRole('combobox');
      await user.selectOptions(companySelect, 'Company A');
      
      // Click verify button
      const verifyButton = screen.getByRole('button', { name: /verify/i });
      await user.click(verifyButton);
      
      // Check loading state
      expect(screen.getByText(/Verifying/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verify/i })).toBeDisabled();
    }, { timeout: 10000 });
    
    // Resolve the API call
    act(() => {
      resolveVerify({ status: 200, data: mockValidTicket });
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Valid Ticket/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('displays bus image when ticket is valid', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<TicketVerification />);
    
    await waitFor(async () => {
      // Fill form
      const ticketInput = screen.getByPlaceholderText(/Enter ticket code/i);
      await user.type(ticketInput, 'TICKET123');
      
      const companySelect = screen.getByRole('combobox');
      await user.selectOptions(companySelect, 'Company A');
      
      // Click verify button
      const verifyButton = screen.getByRole('button', { name: /verify/i });
      await user.click(verifyButton);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      const busImage = screen.getByAltText(/Bus/i);
      expect(busImage).toBeInTheDocument();
      expect(busImage).toHaveAttribute('src', 'https://example.com/bus.jpg');
    }, { timeout: 10000 });
  });

  test('displays placeholder image when no bus photo is available', async () => {
    const user = userEvent.setup({ delay: null });
    const ticketWithoutPhoto = { ...mockValidTicket, busPhoto: null };
    verifyTicket.mockResolvedValue({ status: 200, data: ticketWithoutPhoto });
    
    renderWithUserContext(<TicketVerification />);
    
    await waitFor(async () => {
      // Fill form
      const ticketInput = screen.getByPlaceholderText(/Enter ticket code/i);
      await user.type(ticketInput, 'TICKET123');
      
      const companySelect = screen.getByRole('combobox');
      await user.selectOptions(companySelect, 'Company A');
      
      // Click verify button
      const verifyButton = screen.getByRole('button', { name: /verify/i });
      await user.click(verifyButton);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      const busImage = screen.getByAltText(/Bus/i);
      expect(busImage).toBeInTheDocument();
      expect(busImage).toHaveAttribute('src', 'https://via.placeholder.com/300x200?text=Bus+Image');
    }, { timeout: 10000 });
  });

  test('shows initial state message when no ticket is verified', async () => {
    renderWithUserContext(<TicketVerification />);
    
    await waitFor(() => {
      expect(screen.getByText(/No ticket verified yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter a ticket code and select company to verify/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  test('handles companies API error', async () => {
    getAllCompanies.mockRejectedValue(new Error('Failed to fetch companies'));
    
    renderWithUserContext(<TicketVerification />);
    
    await waitFor(() => {
      expect(getAllCompanies).toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  test('allows multiple verification attempts', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithUserContext(<TicketVerification />);
    
    await waitFor(async () => {
      // First verification
      const ticketInput = screen.getByPlaceholderText(/Enter ticket code/i);
      await user.type(ticketInput, 'TICKET123');
      
      const companySelect = screen.getByRole('combobox');
      await user.selectOptions(companySelect, 'Company A');
      
      const verifyButton = screen.getByRole('button', { name: /verify/i });
      await user.click(verifyButton);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(screen.getByText(/Valid Ticket/i)).toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Second verification with different data
    verifyTicket.mockResolvedValue({ status: 200, data: mockInvalidTicket });
    
    await waitFor(async () => {
      const ticketInput = screen.getByPlaceholderText(/Enter ticket code/i);
      await user.clear(ticketInput);
      await user.type(ticketInput, 'TICKET456');
      
      const verifyButton = screen.getByRole('button', { name: /verify/i });
      await user.click(verifyButton);
    }, { timeout: 10000 });
    
    await waitFor(() => {
      expect(verifyTicket).toHaveBeenCalledWith('TICKET456', 'Company A');
      expect(screen.getByText(/This ticket is not valid/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });
}); 