import React, { useContext, useState, useEffect } from 'react';
import { AdminNavbar } from '../../Components/Navbar/AdminNavbar';
import { UserContext } from '../../Context/UserContext';
import { Navigate } from 'react-router-dom';
import { getTicketSales, getAllTickets, getAllReviews } from '../../Api/ApiCalls';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const { user } = useContext(UserContext);
  const [activeAction, setActiveAction] = useState(null);
  const [allData, setAllData] = useState(null);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Fetch all lists on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoadingAll(true);
      try {
        const [ticketSalesResponse, allTicketsResponse, allReviewsResponse] = await Promise.all([
          getTicketSales(),
          getAllTickets(),
          getAllReviews()
        ]);
        // Filter ticket sales for unique routes
        const ticketSales = ticketSalesResponse.data;
        const routeMap = new Map();
        ticketSales.forEach(route => {
          const key = `${route.source}→${route.destination}`;
          if (!routeMap.has(key)) {
            routeMap.set(key, { ...route });
          }
        });
        const uniqueTicketSales = Array.from(routeMap.values());
        setAllData({
          ticketSales: uniqueTicketSales,
          allTickets: allTicketsResponse.data,
          allReviews: allReviewsResponse.data
        });
      } catch (error) {
        setAllData(null);
      } finally {
        setLoadingAll(false);
      }
    };
    fetchAll();
  }, []);

  // Admin protection - redirect if not admin
  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/login" replace />;
  }

  // Handler for Update Price button
  const handleUpdatePrice = () => {
    setActiveAction('updatePrice');
  };

  const priceChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Top 10 Revenue Generating Routes',
        align: 'start',
        font: { size: 16, weight: 'bold', style: 'italic' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Revenue (৳)') {
              return `Revenue: ৳${context.parsed.y.toLocaleString()}`;
            } else if (context.dataset.label === 'Tickets Sold') {
              return `Tickets Sold: ${context.parsed.y}`;
            } else {
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      }
    },
    scales: {
      x: { ticks: { maxRotation: 45, minRotation: 45 } },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Revenue (৳)' },
        ticks: { callback: value => '৳' + value.toLocaleString() }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Tickets Sold' },
        grid: { drawOnChartArea: false },
      }
    }
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div style={{ width: "250px", backgroundColor: "#f8f9fa" }}>
        <AdminNavbar />
      </div>
      
      {/* Main Content */}
      <div className="flex-grow-1" style={{ background: "#f4f6fb" }}>
        <div className="container my-5">
          <div className="row">
            <div className="col-12">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-gradient-primary text-white" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}>
                  <div className="d-flex align-items-center">
                    <div className="me-4">
                      <i className="fas fa-tachometer-alt fa-3x opacity-75"></i>
                    </div>
                    <div>
                      <h1 className="mb-0 fw-bold display-6">
                        Welcome to BusTopia Admin Dashboard
                      </h1>
                      <p className="mb-0 mt-2 opacity-75 fs-5">
                        <i className="fas fa-user-shield me-2"></i>
                        Administrative Control Center
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-body p-5">
                  {/* Quick Action Options */}
                  <div className="row justify-content-center mb-3">
                    <div className="col-auto">
                      <div className="d-flex flex-row gap-5">
                        <div className="text-center">
                          <button className="btn btn-light rounded-circle shadow-lg p-4 d-flex flex-column align-items-center justify-content-center" style={{ width: 100, height: 100, boxShadow: '0 0.5rem 1.5rem rgba(0,0,0,0.25)' }} onClick={handleUpdatePrice}>
                            <i className="bi bi-currency-dollar fs-1 text-primary mb-2"></i>
                          </button>
                          <div className="fw-semibold mt-2">Update Price</div>
                        </div>
                        <div className="text-center">
                          <button className="btn btn-light rounded-circle shadow-lg p-4 d-flex flex-column align-items-center justify-content-center" style={{ width: 100, height: 100, boxShadow: '0 0.5rem 1.5rem rgba(0,0,0,0.25)' }}>
                            <i className="bi bi-signpost-split fs-1 text-success mb-2"></i>
                          </button>
                          <div className="fw-semibold mt-2">Update Routes</div>
                        </div>
                        <div className="text-center">
                          <button className="btn btn-light rounded-circle shadow-lg p-4 d-flex flex-column align-items-center justify-content-center" style={{ width: 100, height: 100, boxShadow: '0 0.5rem 1.5rem rgba(0,0,0,0.25)' }}>
                            <i className="bi bi-exclamation-triangle fs-1 text-danger mb-2"></i>
                          </button>
                          <div className="fw-semibold mt-2">Take Action</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* End Quick Action Options */}
                  <div className="row">
                    <div className="col-12">
                      {activeAction === 'updatePrice' ? (
                        <div className="text-center py-3">
                          <div className="mb-4">
                            <i className="fas fa-balance-scale fa-3x text-primary mb-3"></i>
                          </div>
                          <h5 className="text-center mb-2">Set Analysis Weights</h5>
                          <p className="text-muted mb-4" style={{ maxWidth: 600, margin: '0 auto' }}>
                            <b>Disclaimer:</b> These weights determine the relative importance of Route Revenue, Bus Revenue, and Customer Review in the analysis. Adjust them to prioritize different aspects of your operational strategy. The sum or ratio of these weights will influence the outcome of the analysis.
                          </p>
                          {loadingAll ? (
                            <div className="d-flex justify-content-center align-items-center py-5">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <span className="ms-3">Loading data for price optimization...</span>
                            </div>
                          ) : !allData ? (
                            <div className="alert alert-info">
                              <i className="fas fa-info-circle me-2"></i>
                              No data available.
                            </div>
                          ) : (
                            <div className="row justify-content-center">
                              <div className="col-md-8">
                                <div className="card shadow-sm border-0">
                                  <div className="card-body p-4">
                                    <form className="row g-4 justify-content-center">
                                      <div className="col-md-4">
                                        <label className="form-label fw-semibold">Route Revenue</label>
                                        <input type="number" className="form-control" min="0" max="100" step="1" placeholder="e.g. 40" />
                                      </div>
                                      <div className="col-md-4">
                                        <label className="form-label fw-semibold">Bus Revenue</label>
                                        <input type="number" className="form-control" min="0" max="100" step="1" placeholder="e.g. 30" />
                                      </div>
                                      <div className="col-md-4">
                                        <label className="form-label fw-semibold">Customer Review</label>
                                        <input type="number" className="form-control" min="0" max="100" step="1" placeholder="e.g. 30" />
                                      </div>
                                      <div className="col-12 text-center mt-4">
                                        <button type="button" className="btn btn-primary px-5 fw-bold">Run Analysis</button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <div className="mb-4">
                            <i className="fas fa-book-open fa-3x text-primary mb-3"></i>
                          </div>
                          <h2 className="text-primary fw-bold mb-3">
                            System Usage Guidelines
                          </h2>
                          <p className="text-muted fs-5 mb-4">
                            Please follow these standard guidelines to ensure smooth and secure operation of the BusTopia Admin System.
                          </p>
                          <div className="row justify-content-center">
                            <div className="col-md-10">
                              <div className="alert alert-info border-0 shadow-sm text-start">
                                <h5 className="mb-3"><i className="fas fa-check-circle me-2 text-success"></i>General Usage</h5>
                                <ul className="mb-4 ps-4">
                                  <li>Always use the sidebar to navigate between dashboard features and analytics.</li>
                                  <li>Keep your admin credentials secure and do not share them with others.</li>
                                  <li>Log out after completing your administrative tasks.</li>
                                </ul>
                                <h5 className="mb-3"><i className="fas fa-cogs me-2 text-primary"></i>System Operations</h5>
                                <ul className="mb-4 ps-4">
                                  <li>Use <b>Update Price</b> to modify fare structures for different routes.</li>
                                  <li>Use <b>Update Routes</b> to modify bus routes in the system.</li>
                                  <li>Use <b>Take Action</b> to address issues with specific buses (e.g., complaints, maintenance, or disciplinary actions).</li>
                                </ul>
                                <h5 className="mb-3"><i className="fas fa-shield-alt me-2 text-warning"></i>Security & Best Practices</h5>
                                <ul className="mb-0 ps-4">
                                  <li>Regularly review analytics to monitor system health and performance.</li>
                                  <li>Report any suspicious activity or system bugs to the IT team immediately.</li>
                                  <li>Ensure all changes are double-checked before saving or applying them.</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 