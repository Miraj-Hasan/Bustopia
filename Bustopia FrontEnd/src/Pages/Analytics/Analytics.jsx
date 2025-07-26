import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AdminNavbar } from '../../Components/Navbar/AdminNavbar';
import { UserContext } from '../../Context/UserContext';
import { Navigate } from 'react-router-dom';
import { getTicketSales, getAllTickets, getAllReviews } from '../../Api/ApiCalls';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Analytics() {
  const { user } = useContext(UserContext);
  const [ticketSales, setTicketSales] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage2, setLoadingPage2] = useState(false);
  const [loadingPage3, setLoadingPage3] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showCompanyReport, setShowCompanyReport] = useState(false);
  const [showReviewsReport, setShowReviewsReport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Admin protection - redirect if not admin
  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchTicketSales = async () => {
      try {
        const response = await getTicketSales();
        setTicketSales(response.data);
        console.log('Ticket Sales Data:', response.data);
      } catch (error) {
        console.error('Error fetching ticket sales:', error);
        toast.error('Failed to fetch ticket sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketSales();
  }, []);

  // Fetch all tickets when Page 2 is accessed
  useEffect(() => {
    if (currentPage === 2 && allTickets.length === 0) {
      const fetchAllTickets = async () => {
        setLoadingPage2(true);
        try {
          const response = await getAllTickets();
          setAllTickets(response.data);
          console.log('All Tickets Data:', response.data);
        } catch (error) {
          console.error('Error fetching all tickets:', error);
          toast.error('Failed to fetch tickets data');
        } finally {
          setLoadingPage2(false);
        }
      };

      fetchAllTickets();
    }
  }, [currentPage, allTickets.length]);

  // Fetch all reviews when Page 3 is accessed
  useEffect(() => {
    if (currentPage === 3 && allReviews.length === 0) {
      const fetchAllReviews = async () => {
        setLoadingPage3(true);
        try {
          const response = await getAllReviews();
          setAllReviews(response.data);
          console.log('All Reviews Data:', response.data);
        } catch (error) {
          console.error('Error fetching all reviews:', error);
          toast.error('Failed to fetch reviews data');
        } finally {
          setLoadingPage3(false);
        }
      };

      fetchAllReviews();
    }
  }, [currentPage, allReviews.length]);

  // Prepare chart data for top 10 revenue generators using useMemo
  const chartData = useMemo(() => {
    if (!ticketSales || ticketSales.length === 0) return null;

    // Discard duplicates - keep only one entry per unique (source, destination) pair
    const routeMap = new Map();
    ticketSales.forEach(route => {
      const key = `${route.source}→${route.destination}`;
      if (!routeMap.has(key)) {
        routeMap.set(key, { ...route });
      }
      // If key already exists, discard this duplicate entry
    });
    const uniqueRoutes = Array.from(routeMap.values());

    // Sort by revenue and get top 10
    const topRevenueRoutes = uniqueRoutes
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    const labels = topRevenueRoutes.map(route => `${route.source} → ${route.destination}`);
    const revenues = topRevenueRoutes.map(route => route.totalRevenue);
    const ticketCounts = topRevenueRoutes.map(route => route.ticketsSold);

    return {
      labels,
      datasets: [
        {
          label: 'Revenue (৳)',
          data: revenues,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: 'Tickets Sold',
          data: ticketCounts,
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          yAxisID: 'y1',
        }
      ]
    };
  }, [ticketSales]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 Revenue Generating Routes',
        align: 'start',
        font: {
          size: 16,
          weight: 'bold',
          style: 'italic'
        }
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
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (৳)'
        },
        ticks: {
          callback: function(value) {
            return '৳' + value.toLocaleString();
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Tickets Sold'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  }), []);

  // Prepare full report data (sorted by revenue)
  const sortedReport = useMemo(() => {
    if (!ticketSales) return [];
    
    // Aggregate by source and destination to remove duplicates
    const routeMap = new Map();
    ticketSales.forEach(route => {
      const key = `${route.source}→${route.destination}`;
      if (!routeMap.has(key)) {
        routeMap.set(key, { ...route });
      } else {
        const existing = routeMap.get(key);
        existing.ticketsSold += route.ticketsSold;
        existing.totalRevenue += route.totalRevenue;
        // Keep the highest price
        existing.price = Math.max(existing.price, route.price);
      }
    });

    const aggregatedRoutes = Array.from(routeMap.values());
    return aggregatedRoutes.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [ticketSales]);

  // Prepare company analytics data
  const companyAnalytics = useMemo(() => {
    if (!allTickets || allTickets.length === 0) return null;

    // Aggregate by company
    const companyMap = new Map();
    allTickets.forEach(ticket => {
      const companyName = ticket.companyName;
      if (!companyMap.has(companyName)) {
        companyMap.set(companyName, {
          companyName,
          totalRevenue: ticket.price,
          ticketsSold: 1,
          averagePrice: ticket.price
        });
      } else {
        const existing = companyMap.get(companyName);
        existing.totalRevenue += ticket.price;
        existing.ticketsSold += 1;
        existing.averagePrice = existing.totalRevenue / existing.ticketsSold;
      }
    });

    return Array.from(companyMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [allTickets]);

  // Prepare company chart data
  const companyChartData = useMemo(() => {
    if (!companyAnalytics) return null;

    const topCompanies = companyAnalytics.slice(0, 10); // Top 10 companies
    const labels = topCompanies.map(company => company.companyName);
    const revenues = topCompanies.map(company => company.totalRevenue);
    const ticketCounts = topCompanies.map(company => company.ticketsSold);

    return {
      labels,
      datasets: [
        {
          label: 'Revenue (৳)',
          data: revenues,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: 'Tickets Sold',
          data: ticketCounts,
          backgroundColor: 'rgba(255, 159, 64, 0.8)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 2,
          yAxisID: 'y1',
        }
      ]
    };
  }, [companyAnalytics]);

  const companyChartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 Companies by Revenue',
        align: 'start',
        font: {
          size: 16,
          weight: 'bold',
          style: 'italic'
        }
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
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (৳)'
        },
        ticks: {
          callback: function(value) {
            return '৳' + value.toLocaleString();
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Tickets Sold'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  }), []);

  // Prepare reviews analytics data
  const reviewsAnalytics = useMemo(() => {
    if (!allReviews || allReviews.length === 0) return null;

    // Aggregate by company
    const companyMap = new Map();
    allReviews.forEach(review => {
      const companyName = review.companyName;
      if (!companyMap.has(companyName)) {
        companyMap.set(companyName, {
          companyName,
          totalStars: review.stars,
          reviewCount: 1,
          averageRating: review.stars
        });
      } else {
        const existing = companyMap.get(companyName);
        existing.totalStars += review.stars;
        existing.reviewCount += 1;
        existing.averageRating = existing.totalStars / existing.reviewCount;
      }
    });

    return Array.from(companyMap.values()).sort((a, b) => b.averageRating - a.averageRating);
  }, [allReviews]);

  // Prepare reviews chart data
  const reviewsChartData = useMemo(() => {
    if (!reviewsAnalytics) return null;

    const labels = reviewsAnalytics.map(company => company.companyName);
    const averageRatings = reviewsAnalytics.map(company => company.averageRating);
    const reviewCounts = reviewsAnalytics.map(company => company.reviewCount);

    return {
      labels,
      datasets: [
        {
          label: 'Average Rating',
          data: averageRatings,
          backgroundColor: 'rgba(153, 102, 255, 0.8)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: 'Review Count',
          data: reviewCounts,
          backgroundColor: 'rgba(255, 205, 86, 0.8)',
          borderColor: 'rgba(255, 205, 86, 1)',
          borderWidth: 2,
          yAxisID: 'y1',
        }
      ]
    };
  }, [reviewsAnalytics]);

  const reviewsChartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Company Average Ratings',
        align: 'start',
        font: {
          size: 16,
          weight: 'bold',
          style: 'italic'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Average Rating') {
              return `Average Rating: ${context.parsed.y.toFixed(2)} ⭐`;
            } else if (context.dataset.label === 'Review Count') {
              return `Review Count: ${context.parsed.y}`;
            } else {
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Average Rating'
        },
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Review Count'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  }), []);

  // Prepare reviews grouped by bus for full report
  const reviewsByBus = useMemo(() => {
    if (!allReviews || allReviews.length === 0) return [];

    // Group reviews by bus (license number)
    const busMap = new Map();
    allReviews.forEach(review => {
      const busKey = `${review.companyName} - ${review.licenseNo}`;
      if (!busMap.has(busKey)) {
        busMap.set(busKey, {
          companyName: review.companyName,
          licenseNo: review.licenseNo,
          reviews: []
        });
      }
      busMap.get(busKey).reviews.push({
        reviewId: review.reviewId,
        message: review.message,
        stars: review.stars,
        reviewTime: review.reviewTime
      });
    });

    // Sort reviews within each bus by review time (newest first)
    busMap.forEach(bus => {
      bus.reviews.sort((a, b) => new Date(b.reviewTime) - new Date(a.reviewTime));
    });

    return Array.from(busMap.values()).sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [allReviews]);

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
                <div className="card-header bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h2 className="mb-0 fw-bold">
                        <i className="fas fa-chart-line me-3"></i>
                        Analytics Dashboard
                      </h2>
                      <p className="mb-0 mt-2 opacity-75">
                        Comprehensive insights and performance metrics for BusTopia operations
                      </p>
                    </div>
                    {/* Pagination Navigation */}
                    <div className="d-flex align-items-center">
                      <button 
                        className="btn btn-outline-light btn-sm me-2" 
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chart-bar me-1"></i>
                        Page 1
                      </button>
                      <button 
                        className="btn btn-outline-light btn-sm me-2" 
                        onClick={() => setCurrentPage(2)}
                        disabled={currentPage === 2}
                      >
                        <i className="fas fa-chart-line me-1"></i>
                        Page 2
                      </button>
                      <button 
                        className="btn btn-outline-light btn-sm" 
                        onClick={() => setCurrentPage(3)}
                        disabled={currentPage === 3}
                      >
                        <i className="fas fa-chart-pie me-1"></i>
                        Page 3
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4">
                  {loading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span className="ms-3">Loading ticket sales data...</span>
                    </div>
                  ) : (
                    <>
                      {/* Page 1: Revenue Analytics */}
                      {currentPage === 1 && (
                        <div className="row">
                          <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                              <h4 className="mb-0 text-start fst-italic">
                                <i className="fas fa-chart-bar me-2"></i>
                                Top 10 Revenue Generating Routes
                              </h4>
                              <button className="btn btn-outline-primary btn-sm fw-bold" onClick={() => setShowReport(true)}>
                                <i className="fas fa-file-alt me-2"></i>Show Full Report
                              </button>
                            </div>
                            {!chartData ? (
                              <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                No ticket sales data available.
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="chart-container" style={{ position: 'relative', height: '60vh', margin: '0 auto', maxWidth: '90%' }}>
                                  <Bar data={chartData} options={chartOptions} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Page 2: Company Analytics */}
                      {currentPage === 2 && (
                        <div className="row">
                          <div className="col-12">
                            {loadingPage2 ? (
                              <div className="d-flex justify-content-center align-items-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                                <span className="ms-3">Loading company analytics data...</span>
                              </div>
                            ) : (
                              <>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                  <h4 className="mb-0 text-start fst-italic">
                                    <i className="fas fa-building me-2"></i>
                                    Top 10 Companies by Revenue
                                  </h4>
                                  <button className="btn btn-outline-primary btn-sm fw-bold" onClick={() => setShowCompanyReport(true)}>
                                    <i className="fas fa-file-alt me-2"></i>Show Full Report
                                  </button>
                                </div>
                                {!companyChartData ? (
                                  <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    No company data available.
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <div className="chart-container" style={{ position: 'relative', height: '60vh', margin: '0 auto', maxWidth: '90%' }}>
                                      <Bar data={companyChartData} options={companyChartOptions} />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Page 3: Reviews Analytics */}
                      {currentPage === 3 && (
                        <div className="row">
                          <div className="col-12">
                            {loadingPage3 ? (
                              <div className="d-flex justify-content-center align-items-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                                <span className="ms-3">Loading reviews analytics data...</span>
                              </div>
                            ) : (
                              <>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                  <h4 className="mb-0 text-start fst-italic">
                                    <i className="fas fa-star me-2"></i>
                                    Company Average Ratings
                                  </h4>
                                  <button className="btn btn-outline-primary btn-sm fw-bold" onClick={() => setShowReviewsReport(true)}>
                                    <i className="fas fa-file-alt me-2"></i>Show Full Report
                                  </button>
                                </div>
                                {!reviewsChartData ? (
                                  <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    No reviews data available.
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <div className="chart-container" style={{ position: 'relative', height: '60vh', margin: '0 auto', maxWidth: '90%' }}>
                                      <Bar data={reviewsChartData} options={reviewsChartOptions} />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Full Report - Only show on page 1 */}
      {showReport && currentPage === 1 && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Full Ticket Sales Report</h5>
                <button type="button" className="btn-close" onClick={() => setShowReport(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-primary">
                      <tr>
                        <th>Source</th>
                        <th>Destination</th>
                        <th>Tickets Sold</th>
                        <th>Total Revenue (৳)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedReport.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.source}</td>
                          <td>{row.destination}</td>
                          <td>{row.ticketsSold}</td>
                          <td>৳{row.totalRevenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReport(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Company Report - Only show on page 2 */}
      {showCompanyReport && currentPage === 2 && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Company Performance Report</h5>
                <button type="button" className="btn-close" onClick={() => setShowCompanyReport(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-primary">
                      <tr>
                        <th>Company Name</th>
                        <th>Tickets Sold</th>
                        <th>Total Revenue (৳)</th>
                        <th>Average Price (৳)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyAnalytics && companyAnalytics.map((company, idx) => (
                        <tr key={idx}>
                          <td>{company.companyName}</td>
                          <td>{company.ticketsSold}</td>
                          <td>৳{company.totalRevenue.toLocaleString()}</td>
                          <td>৳{company.averagePrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompanyReport(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Reviews Report - Only show on page 3 */}
      {showReviewsReport && currentPage === 3 && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-xl" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">All Reviews by Bus</h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewsReport(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {reviewsByBus.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No reviews available.</p>
                  </div>
                ) : (
                  <div>
                    {reviewsByBus.map((bus, busIndex) => (
                      <div key={busIndex} className="card mb-4 border-primary">
                        <div className="card-header bg-primary text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-bus me-2"></i>
                            {bus.companyName} - {bus.licenseNo}
                          </h6>
                        </div>
                        <div className="card-body">
                          {bus.reviews.length === 0 ? (
                            <p className="text-muted text-center">No reviews for this bus.</p>
                          ) : (
                            <div>
                              {bus.reviews.map((review, reviewIndex) => (
                                <div key={reviewIndex} className="border-bottom pb-3 mb-3" style={{ borderColor: '#e9ecef' }}>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="d-flex align-items-center">
                                      <div className="me-3">
                                        {[...Array(5)].map((_, i) => (
                                          <span key={i} className={i < review.stars ? 'text-warning' : 'text-muted'}>
                                            ⭐
                                          </span>
                                        ))}
                                      </div>
                                      <span className="badge bg-secondary">Review #{review.reviewId}</span>
                                    </div>
                                    <small className="text-muted">
                                      {new Date(review.reviewTime).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </small>
                                  </div>
                                  <div className="review-message">
                                    <p className="mb-0" style={{ fontStyle: 'italic', color: '#495057' }}>
                                      "{review.message}"
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewsReport(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 