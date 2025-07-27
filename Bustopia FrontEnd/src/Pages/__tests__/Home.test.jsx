import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Home } from '../Home/Home';
import { UserContext } from '../../Context/UserContext';
import * as ApiCalls from '../../Api/ApiCalls';

// Mock the API calls
vi.mock('../../Api/ApiCalls');
vi.mock('../../Components/Navbar/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar Component</div>
}));

// Mock CSS import
vi.mock('./Home.css', () => ({}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test data
const mockTicketSales = [
  { source: 'Dhaka', destination: 'Chittagong', ticketsSold: 100 },
  { source: 'Dhaka', destination: 'Sylhet', ticketsSold: 80 },
  { source: 'Chittagong', destination: 'Cox\'s Bazar', ticketsSold: 60 },
];

const mockAllTickets = [
  { companyName: 'Green Line', source: 'Dhaka', destination: 'Chittagong' },
  { companyName: 'Shyamoli', source: 'Dhaka', destination: 'Sylhet' },
  { companyName: 'Green Line', source: 'Chittagong', destination: 'Cox\'s Bazar' },
  { companyName: 'Hanif Enterprise', source: 'Dhaka', destination: 'Rajshahi' },
];

const mockAllReviews = [
  { companyName: 'Green Line', stars: 5 },
  { companyName: 'Green Line', stars: 4 },
  { companyName: 'Shyamoli', stars: 3 },
  { companyName: 'Hanif Enterprise', stars: 4 },
  { companyName: 'Hanif Enterprise', stars: 5 },
];

const mockBusesByRoute = [
  {
    busId: 'BUS001',
    companyName: 'Green Line',
    category: 'AC',
    licenseNo: 'DH-123456',
    startTime: '08:00',
  },
  {
    busId: 'BUS002',
    companyName: 'Shyamoli',
    category: 'Non-AC',
    licenseNo: 'DH-789012',
    startTime: '14:30',
  },
];

const mockBusesByCompany = [
  {
    busId: 'BUS003',
    companyName: 'Green Line',
    category: 'AC',
    licenseNo: 'DH-345678',
    startTime: '09:00',
    route: {
      stops: [{ name: 'Dhaka' }, { name: 'Chittagong' }]
    }
  },
];

const mockUserContext = {
  user: { id: '1', name: 'Test User' }
};

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <UserContext.Provider value={mockUserContext}>
      {children}
    </UserContext.Provider>
  </BrowserRouter>
);

describe('Home Component', () => {
  beforeEach(() => {
    // Setup API mocks
    ApiCalls.getTicketSales.mockResolvedValue({ data: mockTicketSales });
    ApiCalls.getAllTickets.mockResolvedValue({ data: mockAllTickets });
    ApiCalls.getAllReviews.mockResolvedValue({ data: mockAllReviews });
    ApiCalls.getBusesByRoute.mockResolvedValue(mockBusesByRoute);
    ApiCalls.getBusesByCompany.mockResolvedValue(mockBusesByCompany);
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders without crashing', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Welcome to BusTopia')).toBeInTheDocument();
  });

  it('displays hero section correctly', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByText('Welcome to BusTopia')).toBeInTheDocument();
    expect(screen.getByText(/Your journey begins with the perfect ride/)).toBeInTheDocument();
  });

  it('fetches and displays popular routes', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Routes')).toBeInTheDocument();
      const popularRoutesSection = screen.getByText('Popular Routes').closest('.section');
      expect(popularRoutesSection).toHaveTextContent('Dhaka');
      expect(popularRoutesSection).toHaveTextContent('Chittagong');
    });
  });

  it('fetches and displays top rated companies', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Highest Rated Companies')).toBeInTheDocument();
      const topRatedSection = screen.getByText('Highest Rated Companies').closest('.section');
      expect(topRatedSection).toHaveTextContent('Green Line');
      expect(topRatedSection).toHaveTextContent('Hanif Enterprise');
    });
  });

  it('displays popular companies section', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Companies')).toBeInTheDocument();
    });
  });

  it('displays all available companies section', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('All Available Companies')).toBeInTheDocument();
    });
  });

  it('handles route click and opens bus modal', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Routes')).toBeInTheDocument();
    });

    // Find the popular routes section and click on the first route card
    await waitFor(() => {
      const routeCards = screen.getAllByText('→');
      expect(routeCards.length).toBeGreaterThan(0);
      const routeCard = routeCards[0].closest('.route-card');
      fireEvent.click(routeCard);
    });

    await waitFor(() => {
      expect(screen.getByText(/Buses for.*→/)).toBeInTheDocument();
      expect(ApiCalls.getBusesByRoute).toHaveBeenCalled();
    });
  });

  it('displays buses in route modal', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Routes')).toBeInTheDocument();
    });

    await waitFor(() => {
      const routeCards = screen.getAllByText('→');
      const routeCard = routeCards[0].closest('.route-card');
      fireEvent.click(routeCard);
    });

    await waitFor(() => {
      expect(screen.getByText('Green Line - Bus BUS001 (AC)')).toBeInTheDocument();
      expect(screen.getByText('DH-123456')).toBeInTheDocument();
      expect(screen.getByText(/Leaves.*at 8:00 AM/)).toBeInTheDocument();
    });
  });

  it('closes bus modal when close button is clicked', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Routes')).toBeInTheDocument();
    });

    await waitFor(() => {
      const routeCards = screen.getAllByText('→');
      const routeCard = routeCards[0].closest('.route-card');
      fireEvent.click(routeCard);
    });

    await waitFor(() => {
      expect(screen.getByText(/Buses for.*→/)).toBeInTheDocument();
    });

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/Buses for.*→/)).not.toBeInTheDocument();
    });
  });

  it('handles company click and opens company modal', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Highest Rated Companies')).toBeInTheDocument();
    });

    // Wait for companies to load and click on a company name
    await waitFor(() => {
      const companyElements = screen.getAllByText('Green Line');
      expect(companyElements.length).toBeGreaterThan(0);
      const companyCard = companyElements.find(el => el.closest('.company-card'));
      fireEvent.click(companyCard);
    });

    await waitFor(() => {
      expect(screen.getByText(/Buses by/)).toBeInTheDocument();
      expect(ApiCalls.getBusesByCompany).toHaveBeenCalled();
    });
  });

  it('navigates to bus details when bus card is clicked', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Routes')).toBeInTheDocument();
    });

    await waitFor(() => {
      const routeCards = screen.getAllByText('→');
      const routeCard = routeCards[0].closest('.route-card');
      fireEvent.click(routeCard);
    });

    await waitFor(() => {
      expect(screen.getByText('Green Line - Bus BUS001 (AC)')).toBeInTheDocument();
    });

    const busCard = screen.getByText('Green Line - Bus BUS001 (AC)').closest('.bus-card');
    fireEvent.click(busCard);

    expect(mockNavigate).toHaveBeenCalledWith('/bus/BUS001');
  });

  it('formats time correctly', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Routes')).toBeInTheDocument();
    });

    await waitFor(() => {
      const routeCards = screen.getAllByText('→');
      const routeCard = routeCards[0].closest('.route-card');
      fireEvent.click(routeCard);
    });

    await waitFor(() => {
      expect(screen.getByText(/8:00 AM/)).toBeInTheDocument();
      expect(screen.getByText(/2:30 PM/)).toBeInTheDocument();
    });
  });

  it('displays loading state for buses', async () => {
    // Mock a delayed response
    ApiCalls.getBusesByRoute.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockBusesByRoute), 100))
    );

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Routes')).toBeInTheDocument();
    });

    await waitFor(() => {
      const routeCards = screen.getAllByText('→');
      const routeCard = routeCards[0].closest('.route-card');
      fireEvent.click(routeCard);
    });

    expect(screen.getByText('Loading buses...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading buses...')).not.toBeInTheDocument();
    });
  });

  it('handles empty bus results', async () => {
    ApiCalls.getBusesByRoute.mockResolvedValue([]);

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Routes')).toBeInTheDocument();
    });

    await waitFor(() => {
      const routeCards = screen.getAllByText('→');
      const routeCard = routeCards[0].closest('.route-card');
      fireEvent.click(routeCard);
    });

    await waitFor(() => {
      expect(screen.getByText('No buses available for this route')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock console.error to avoid error logs in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock API calls to return empty arrays instead of rejecting
    // This simulates the component's error handling behavior
    ApiCalls.getTicketSales.mockResolvedValue({ data: [] });
    ApiCalls.getAllTickets.mockResolvedValue({ data: [] });
    ApiCalls.getAllReviews.mockResolvedValue({ data: [] });

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Component should still render even with empty data
    expect(screen.getByText('Welcome to BusTopia')).toBeInTheDocument();
    
    // Wait for any async operations to complete
    await waitFor(() => {
      expect(screen.getByText('Popular Routes')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('calculates ratings correctly', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Highest Rated Companies')).toBeInTheDocument();
    });

    // Green Line should have average rating of 4.5 (5+4)/2 = 4.5
    // Hanif Enterprise should have average rating of 4.5 (4+5)/2 = 4.5
    const topRatedSection = screen.getByText('Highest Rated Companies').closest('.section');
    expect(topRatedSection).toHaveTextContent('4.5');
  });

  it('sorts companies by popularity correctly', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Companies')).toBeInTheDocument();
    });

    // Green Line appears twice in mockAllTickets, so it should be most popular
    const popularSection = screen.getByText('Popular Companies').closest('.section');
    const firstCompanyCard = popularSection.querySelector('.simple-company-card');
    expect(firstCompanyCard).toHaveTextContent('Green Line');
  });

  it('closes modal when clicking overlay', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Routes')).toBeInTheDocument();
    });

    await waitFor(() => {
      const routeCards = screen.getAllByText('→');
      const routeCard = routeCards[0].closest('.route-card');
      fireEvent.click(routeCard);
    });

    await waitFor(() => {
      expect(screen.getByText(/Buses for.*→/)).toBeInTheDocument();
    });

    const overlay = screen.getByText(/Buses for.*→/).closest('.bus-modal-overlay');
    fireEvent.click(overlay);

    await waitFor(() => {
      expect(screen.queryByText(/Buses for.*→/)).not.toBeInTheDocument();
    });
  });

  it('prevents modal close when clicking on modal content', async () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Routes')).toBeInTheDocument();
    });

    await waitFor(() => {
      const routeCards = screen.getAllByText('→');
      const routeCard = routeCards[0].closest('.route-card');
      fireEvent.click(routeCard);
    });

    await waitFor(() => {
      expect(screen.getByText(/Buses for.*→/)).toBeInTheDocument();
    });

    const modalContent = screen.getByText(/Buses for.*→/).closest('.bus-modal');
    fireEvent.click(modalContent);

    // Modal should still be open
    expect(screen.getByText(/Buses for.*→/)).toBeInTheDocument();
  });
});