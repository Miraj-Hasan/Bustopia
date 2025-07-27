import React, { useContext, useState, useEffect } from 'react';
import { AdminNavbar } from '../../Components/Navbar/AdminNavbar';
import { UserContext } from '../../Context/UserContext';
import { Navigate } from 'react-router-dom';
import { getTicketSales, getCurrentPriceConfig, updatePriceConfig, triggerPriceUpdate, getCurrentDemandConfig, updateDemandConfig, triggerDemandUpdate } from '../../Api/ApiCalls';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const { user } = useContext(UserContext);
  const [activeAction, setActiveAction] = useState(null);
  const [allData, setAllData] = useState(null);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceConfig, setPriceConfig] = useState(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [forceUpdating, setForceUpdating] = useState(false);
  const [demandConfig, setDemandConfig] = useState(null);
  const [savingDemandConfig, setSavingDemandConfig] = useState(false);
  const [forceUpdatingRoutes, setForceUpdatingRoutes] = useState(false);
  const [routeUpdateResult, setRouteUpdateResult] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);

  // Fetch all lists on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoadingAll(true);
      try {
        const ticketSalesResponse = await getTicketSales();
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
          ticketSales: uniqueTicketSales
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
  const handleUpdatePrice = async () => {
    setActiveAction('updatePrice');
    setLoadingPrice(true);
    try {
      const response = await getCurrentPriceConfig();
      setPriceConfig(response.data);
    } catch (error) {
      console.error('Error fetching price config:', error);
      setPriceConfig(null);
    } finally {
      setLoadingPrice(false);
    }
  };

  // Handler for saving price configuration
  const handleSavePriceConfig = async () => {
    if (!priceConfig) return;
    
    setSavingConfig(true);
    try {
      const response = await updatePriceConfig(priceConfig);
      toast.success('Price configuration updated successfully!');
    } catch (error) {
      console.error('Error saving price config:', error);
      toast.error('Failed to save price configuration. Please try again.');
    } finally {
      setSavingConfig(false);
    }
  };

  // Handler for forcing immediate price update
  const handleForceUpdate = async () => {
    setForceUpdating(true);
    try {
      const response = await triggerPriceUpdate();
      toast.success(response.data);
    } catch (error) {
      console.error('Error triggering price update:', error);
      toast.error('Failed to trigger price update. Please try again.');
    } finally {
      setForceUpdating(false);
    }
  };

  // Handler for Update Routes button
  const handleUpdateRoutes = async () => {
    setActiveAction('updateRoutes');
    try {
      const response = await getCurrentDemandConfig();
      setDemandConfig(response.data);
    } catch (error) {
      console.error('Error fetching demand config:', error);
      setDemandConfig(null);
    }
  };

  // Handler for saving demand configuration
  const handleSaveDemandConfig = async () => {
    if (!demandConfig) return;
    
    setSavingDemandConfig(true);
    try {
      const response = await updateDemandConfig(demandConfig);
      toast.success(response.data);
    } catch (error) {
      console.error('Error saving demand config:', error);
      toast.error('Failed to save demand configuration. Please try again.');
    } finally {
      setSavingDemandConfig(false);
    }
  };

  // Handler for forcing immediate route update
  const handleForceRouteUpdate = async () => {
    setForceUpdatingRoutes(true);
    setRouteUpdateResult(null);
    try {
      const response = await triggerDemandUpdate();
      setRouteUpdateResult(response.data);
      toast.success('Route update completed successfully!');
    } catch (error) {
      console.error('Error triggering route update:', error);
      toast.error('Failed to trigger route update. Please try again.');
    } finally {
      setForceUpdatingRoutes(false);
    }
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
                          <button 
                            className={`btn rounded-circle shadow-lg p-4 d-flex flex-column align-items-center justify-content-center ${activeAction === 'updatePrice' ? 'btn-info' : 'btn-light'}`} 
                            style={{ 
                              width: 100, 
                              height: 100, 
                              boxShadow: activeAction === 'updatePrice' ? '0 0.5rem 1.5rem rgba(13, 202, 240, 0.4)' : '0 0.5rem 1.5rem rgba(0,0,0,0.25)',
                              border: activeAction === 'updatePrice' ? '3px solid #0dcaf0' : 'none'
                            }} 
                            onClick={handleUpdatePrice}
                          >
                            <i className={`bi bi-currency-dollar fs-1 mb-2 ${activeAction === 'updatePrice' ? 'text-white' : 'text-primary'}`}></i>
                          </button>
                          <div className={`fw-semibold mt-2 ${activeAction === 'updatePrice' ? 'text-info' : ''}`}>Update Price</div>
                        </div>
                        <div className="text-center">
                          <button 
                            className={`btn rounded-circle shadow-lg p-4 d-flex flex-column align-items-center justify-content-center ${activeAction === 'updateRoutes' ? 'btn-info' : 'btn-light'}`} 
                            style={{ 
                              width: 100, 
                              height: 100, 
                              boxShadow: activeAction === 'updateRoutes' ? '0 0.5rem 1.5rem rgba(13, 202, 240, 0.4)' : '0 0.5rem 1.5rem rgba(0,0,0,0.25)',
                              border: activeAction === 'updateRoutes' ? '3px solid #0dcaf0' : 'none'
                            }} 
                            onClick={handleUpdateRoutes}
                          >
                            <i className={`bi bi-signpost-split fs-1 mb-2 ${activeAction === 'updateRoutes' ? 'text-white' : 'text-success'}`}></i>
                          </button>
                          <div className={`fw-semibold mt-2 ${activeAction === 'updateRoutes' ? 'text-info' : ''}`}>Update Routes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* End Quick Action Options */}
                  
                  {/* Welcome Section - Show when no action is selected */}
                  {!activeAction && (
                    <div className="row mt-5">
                      <div className="col-12">
                        <div className="text-center py-4">
                          <div className="mb-4">
                            <i className="fas fa-tachometer-alt fa-4x text-primary mb-3"></i>
                          </div>
                          <h3 className="text-primary fw-bold mb-3">
                            Welcome to Your Control Center
                          </h3>
                          <p className="text-muted fs-5 mb-5" style={{ maxWidth: 600, margin: '0 auto' }}>
                            Select an action above to manage pricing strategies or optimize bus routes. Your administrative tools are ready to help you maintain optimal system performance.
                          </p>
                          
                          {/* Quick Stats Cards */}
                          <div className="row justify-content-center">
                            <div className="col-md-4 mb-3">
                              <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <div className="card-body text-center text-white p-4">
                                  <i className="fas fa-route fa-2x mb-3 opacity-75"></i>
                                  <h5 className="fw-bold mb-2">Route Optimization</h5>
                                  <p className="mb-0 opacity-75">Automatically adjust routes based on demand patterns</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4 mb-3">
                              <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                <div className="card-body text-center text-white p-4">
                                  <i className="fas fa-chart-line fa-2x mb-3 opacity-75"></i>
                                  <h5 className="fw-bold mb-2">Price Optimization</h5>
                                  <p className="mb-0 opacity-75">Monitor and optimize pricing strategies for maximum revenue</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4 mb-3">
                              <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                                <div className="card-body text-center text-white p-4">
                                  <i className="fas fa-chart-bar fa-2x mb-3 opacity-75"></i>
                                  <h5 className="fw-bold mb-2">Service Analytics</h5>
                                  <p className="mb-0 opacity-75">Comprehensive insights into system performance and trends</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="row">
                    <div className="col-12">
                      {activeAction === 'updatePrice' ? (
                        <div className="text-center py-3">
                          <div className="mb-4">
                            <i className="fas fa-chart-line fa-3x text-primary mb-3"></i>
                          </div>
                          <h3 className="text-primary fw-bold mb-3">
                            Dynamic Pricing Configuration
                          </h3>
                          <p className="text-muted mb-4" style={{ maxWidth: 700, margin: '0 auto' }}>
                            <b>Smart Pricing Strategy:</b> Configure intelligent price boundaries and adjustment percentages to optimize revenue while maintaining competitive fares. The system will use these parameters when automatically updating prices according to data analysis and market conditions.
                          </p>
                          {loadingPrice ? (
                            <div className="d-flex justify-content-center align-items-center py-5">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <span className="ms-3">Loading pricing configuration...</span>
                            </div>
                          ) : !priceConfig ? (
                            <div className="alert alert-info">
                              <i className="fas fa-info-circle me-2"></i>
                              No data available for pricing analysis.
                            </div>
                          ) : (
                            <div className="row justify-content-center">
                              <div className="col-lg-10">
                                <div className="card shadow-lg border-0" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                                  <div className="card-header bg-primary text-white text-center py-3">
                                    <h5 className="mb-0 fw-bold">
                                      <i className="fas fa-cogs me-2"></i>
                                      Price Management Parameters
                                    </h5>
                                  </div>
                                  <div className="card-body p-5">
                                    <form className="row g-4">
                                      <div className="col-md-6">
                                        <div className="card h-100 border-0 shadow-sm">
                                          <div className="card-header bg-info text-white text-center py-2">
                                            <h6 className="mb-0 fw-bold">
                                              <i className="fas fa-arrow-up me-2"></i>
                                              Price Upper Limit
                                            </h6>
                                          </div>
                                          <div className="card-body text-center py-4">
                                            <div className="mb-3">
                                              <i className="fas fa-tag fa-2x text-info mb-2"></i>
                                            </div>
                                            <label className="form-label fw-semibold text-dark">Maximum Fare Cap (৳)</label>
                                            <input 
                                              type="number" 
                                              className="form-control form-control-lg text-center fw-bold" 
                                              min="0" 
                                              step="10" 
                                              placeholder="e.g. 5000" 
                                              value={priceConfig?.maxPrice ?? ''}
                                              onChange={(e) => setPriceConfig(prev => ({...prev, maxPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)}))}
                                              style={{ fontSize: '1.1rem' }}
                                            />
                                            <small className="text-muted">Set the highest possible fare for any route</small>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-md-6">
                                        <div className="card h-100 border-0 shadow-sm">
                                          <div className="card-header bg-info text-white text-center py-2">
                                            <h6 className="mb-0 fw-bold">
                                              <i className="fas fa-arrow-down me-2"></i>
                                              Price Lower Limit
                                            </h6>
                                          </div>
                                          <div className="card-body text-center py-4">
                                            <div className="mb-3">
                                              <i className="fas fa-tags fa-2x text-info mb-2"></i>
                                            </div>
                                            <label className="form-label fw-semibold text-dark">Minimum Fare Floor (৳)</label>
                                            <input 
                                              type="number" 
                                              className="form-control form-control-lg text-center fw-bold" 
                                              min="0" 
                                              step="10" 
                                              placeholder="e.g. 200" 
                                              value={priceConfig?.minPrice ?? ''}
                                              onChange={(e) => setPriceConfig(prev => ({...prev, minPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)}))}
                                              style={{ fontSize: '1.1rem' }}
                                            />
                                            <small className="text-muted">Set the lowest acceptable fare for any route</small>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-md-6">
                                        <div className="card h-100 border-0 shadow-sm">
                                          <div className="card-header bg-info text-white text-center py-2">
                                            <h6 className="mb-0 fw-bold">
                                              <i className="fas fa-percentage me-2"></i>
                                              Increase Percentage
                                            </h6>
                                          </div>
                                          <div className="card-body text-center py-4">
                                            <div className="mb-3">
                                              <i className="fas fa-arrow-trend-up fa-2x text-info mb-2"></i>
                                            </div>
                                            <label className="form-label fw-semibold text-dark">Price Hike Rate (%)</label>
                                            <input 
                                              type="number" 
                                              className="form-control form-control-lg text-center fw-bold" 
                                              min="0" 
                                              max="100" 
                                              step="0.5" 
                                              placeholder="e.g. 15.5" 
                                              value={priceConfig?.increasePercent ?? ''}
                                              onChange={(e) => setPriceConfig(prev => ({...prev, increasePercent: e.target.value === '' ? 0 : parseFloat(e.target.value)}))}
                                              style={{ fontSize: '1.1rem' }}
                                            />
                                            <small className="text-muted">Maximum percentage increase for high-demand routes</small>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-md-6">
                                        <div className="card h-100 border-0 shadow-sm">
                                          <div className="card-header bg-info text-white text-center py-2">
                                            <h6 className="mb-0 fw-bold">
                                              <i className="fas fa-percentage me-2"></i>
                                              Decrease Percentage
                                            </h6>
                                          </div>
                                          <div className="card-body text-center py-4">
                                            <div className="mb-3">
                                              <i className="fas fa-arrow-trend-down fa-2x text-info mb-2"></i>
                                            </div>
                                            <label className="form-label fw-semibold text-dark">Price Reduction Rate (%)</label>
                                            <input 
                                              type="number" 
                                              className="form-control form-control-lg text-center fw-bold" 
                                              min="0" 
                                              max="100" 
                                              step="0.5" 
                                              placeholder="e.g. 10.0" 
                                              value={priceConfig?.decreasePercent ?? ''}
                                              onChange={(e) => setPriceConfig(prev => ({...prev, decreasePercent: e.target.value === '' ? 0 : parseFloat(e.target.value)}))}
                                              style={{ fontSize: '1.1rem' }}
                                            />
                                            <small className="text-muted">Maximum percentage decrease for low-demand routes</small>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12 text-center mt-5">
                                        <button 
                                          type="button" 
                                          className="btn btn-primary btn-lg px-5 fw-bold shadow-lg" 
                                          style={{ fontSize: '1.1rem' }}
                                          onClick={handleSavePriceConfig}
                                          disabled={savingConfig}
                                        >
                                          {savingConfig ? (
                                            <>
                                              <div className="spinner-border spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                              </div>
                                              Saving Configuration...
                                            </>
                                          ) : (
                                            <>
                                              <i className="fas fa-rocket me-2"></i>
                                              Update Parameters
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </form>
                                    
                                    {/* Schedule Information and Force Update */}
                                    <div className="row mt-5">
                                      <div className="col-12">
                                        <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                                          <div className="card-body p-4">
                                            <div className="row align-items-center">
                                              <div className="col-md-8">
                                                <div className="d-flex align-items-center">
                                                  <div className="me-3">
                                                    <i className="fas fa-calendar-alt fa-2x text-primary"></i>
                                                  </div>
                                                  <div>
                                                    <h6 className="mb-1 fw-bold text-dark">
                                                      <i className="fas fa-clock me-2 text-warning"></i>
                                                      Next Scheduled Price Update
                                                    </h6>
                                                    <p className="mb-0 text-muted">
                                                      The system will automatically apply these parameters during the next scheduled price update on the <strong>2nd of next month</strong>.
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                                <button 
                                                  type="button" 
                                                  className="btn btn-outline-warning btn-sm px-4 fw-semibold"
                                                  style={{ borderWidth: '2px' }}
                                                  onClick={handleForceUpdate}
                                                  disabled={forceUpdating}
                                                >
                                                  {forceUpdating ? (
                                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                                      <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                  ) : (
                                                    <i className="fas fa-bolt me-2"></i>
                                                  )}
                                                  Force Update Now
                                                </button>
                                                <div className="mt-2">
                                                  <small className="text-muted d-block text-center fst-italic">
                                                    <i className="fas fa-exclamation-triangle me-1 text-warning"></i>
                                                    <strong>**</strong> This process may take a few seconds to complete.
                                                  </small>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : activeAction === 'updateRoutes' ? (
                        <div className="text-center py-3">
                          <div className="mb-4">
                            <i className="fas fa-route fa-3x text-success mb-3"></i>
                          </div>
                          <h3 className="text-success fw-bold mb-3">
                            Route Management System
                          </h3>
                          <p className="text-muted mb-4" style={{ maxWidth: 700, margin: '0 auto' }}>
                            <b>Route Configuration:</b> Manage and update bus routes, stops, and schedules to optimize the transportation network. The system allows you to add new routes, modify existing ones, and adjust service frequencies based on demand patterns.
                          </p>
                          <div className="row justify-content-center">
                            <div className="col-lg-10">
                              <div className="card shadow-lg border-0" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                                <div className="card-header bg-success text-white text-center py-3">
                                  <h5 className="mb-0 fw-bold">
                                    <i className="fas fa-cogs me-2"></i>
                                    Route Management Features
                                  </h5>
                                </div>
                                <div className="card-body p-5">
                                  <form className="row g-4">
                                    <div className="col-md-4">
                                      <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-header bg-success text-white text-center py-2">
                                          <h6 className="mb-0 fw-bold">
                                            <i className="fas fa-arrow-up me-2"></i>
                                            High Demand Threshold
                                          </h6>
                                        </div>
                                        <div className="card-body text-center py-4">
                                          <div className="mb-3">
                                            <i className="fas fa-ticket-alt fa-2x text-success mb-2"></i>
                                          </div>
                                          <label className="form-label fw-semibold text-dark">High Demand Threshold</label>
                                          <input 
                                            type="number" 
                                            className="form-control form-control-lg text-center fw-bold" 
                                            min="0" 
                                            step="1" 
                                            placeholder="e.g. 50" 
                                            value={demandConfig?.highDemandThreshold ?? ''}
                                            onChange={(e) => setDemandConfig(prev => ({...prev, highDemandThreshold: e.target.value === '' ? 0 : parseInt(e.target.value)}))}
                                            style={{ fontSize: '1.1rem' }}
                                          />
                                          <small className="text-muted">Set the threshold for high demand routes</small>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-4">
                                      <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-header bg-success text-white text-center py-2">
                                          <h6 className="mb-0 fw-bold">
                                            <i className="fas fa-arrow-down me-2"></i>
                                            Low Demand Threshold
                                          </h6>
                                        </div>
                                        <div className="card-body text-center py-4">
                                          <div className="mb-3">
                                            <i className="fas fa-ticket-alt fa-2x text-success mb-2"></i>
                                          </div>
                                          <label className="form-label fw-semibold text-dark">Low Demand Threshold</label>
                                          <input 
                                            type="number" 
                                            className="form-control form-control-lg text-center fw-bold" 
                                            min="0" 
                                            step="1" 
                                            placeholder="e.g. 5" 
                                            value={demandConfig?.underperformThreshold ?? ''}
                                            onChange={(e) => setDemandConfig(prev => ({...prev, underperformThreshold: e.target.value === '' ? 0 : parseInt(e.target.value)}))}
                                            style={{ fontSize: '1.1rem' }}
                                          />
                                          <small className="text-muted">Set the threshold for low demand routes</small>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-4">
                                      <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-header bg-success text-white text-center py-2">
                                          <h6 className="mb-0 fw-bold">
                                            <i className="fas fa-bus me-2"></i>
                                            Bus Count<br />Threshold
                                          </h6>
                                        </div>
                                        <div className="card-body text-center py-4">
                                          <div className="mb-3">
                                            <i className="fas fa-bus fa-2x text-success mb-2"></i>
                                          </div>
                                          <label className="form-label fw-semibold text-dark">Number of Buses</label>
                                          <input 
                                            type="number" 
                                            className="form-control form-control-lg text-center fw-bold" 
                                            min="0" 
                                            step="1" 
                                            placeholder="e.g. 10" 
                                            value={demandConfig?.rerouteCount ?? ''}
                                            onChange={(e) => setDemandConfig(prev => ({...prev, rerouteCount: e.target.value === '' ? 0 : parseInt(e.target.value)}))}
                                            style={{ fontSize: '1.1rem' }}
                                          />
                                          <small className="text-muted">Number of buses to be rerouted</small>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-12 text-center mt-5">
                                      <button 
                                        type="button" 
                                        className="btn btn-success btn-lg px-5 fw-bold shadow-lg" 
                                        style={{ fontSize: '1.1rem' }}
                                        onClick={handleSaveDemandConfig}
                                        disabled={savingDemandConfig}
                                      >
                                        {savingDemandConfig ? (
                                          <>
                                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                              <span className="visually-hidden">Loading...</span>
                                            </div>
                                            Saving Configuration...
                                          </>
                                        ) : (
                                          <>
                                            <i className="fas fa-save me-2"></i>
                                            Update Route Parameters
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </form>
                                  
                                  {/* Schedule Information and Force Update */}
                                  <div className="row mt-5">
                                    <div className="col-12">
                                      <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                                        <div className="card-body p-4">
                                          <div className="row align-items-center">
                                            <div className="col-md-8">
                                              <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                  <i className="fas fa-calendar-alt fa-2x text-success"></i>
                                                </div>
                                                <div>
                                                  <h6 className="mb-1 fw-bold text-dark">
                                                    <i className="fas fa-clock me-2 text-warning"></i>
                                                    Next Scheduled Route Update
                                                  </h6>
                                                  <p className="mb-0 text-muted">
                                                    The system will automatically apply these parameters during the next scheduled route update on the <strong>2nd of next month</strong>.
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                              <button 
                                                type="button" 
                                                className="btn btn-outline-warning btn-sm px-4 fw-semibold"
                                                style={{ borderWidth: '2px' }}
                                                onClick={handleForceRouteUpdate}
                                                disabled={forceUpdatingRoutes}
                                              >
                                                {forceUpdatingRoutes ? (
                                                  <div className="spinner-border spinner-border-sm me-2" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                  </div>
                                                ) : (
                                                  <i className="fas fa-bolt me-2"></i>
                                                )}
                                                Force Update Now
                                              </button>
                                              <div className="mt-2">
                                                <small className="text-muted d-block text-center fst-italic">
                                                  <i className="fas fa-exclamation-triangle me-1 text-warning"></i>
                                                  <strong>**</strong> This process may take a few seconds to complete.
                                                </small>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Route Update Result Summary */}
                                    {routeUpdateResult && (
                                      <div className="row mt-4">
                                        <div className="col-12">
                                          <div className="card border-0 shadow-sm text-center" style={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)' }}>
                                            <div className="card-body p-4">
                                              <div className="d-flex align-items-center justify-content-center">
                                                <div className="me-3">
                                                  <i className="fas fa-check-circle fa-2x text-success"></i>
                                                </div>
                                                <div>
                                                  <h6 className="mb-1 fw-bold text-success">
                                                    <i className="fas fa-route me-2"></i>
                                                    Route Update Summary
                                                  </h6>
                                                  {Array.isArray(routeUpdateResult) && routeUpdateResult.length > 0 ? (
                                                    <p className="mb-0 text-dark">
                                                      Successfully rerouted <strong>{routeUpdateResult.length} buses</strong> from low demand to high demand routes.
                                                    </p>
                                                  ) : (
                                                    <p className="mb-0 text-dark">
                                                      <strong>No buses were rerouted.</strong> All routes are currently operating within optimal demand parameters.
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              {routeUpdateResult && routeUpdateResult.length > 0 && (
                                                <div className="mt-3">
                                                  <button 
                                                    type="button" 
                                                    className="btn btn-outline-success btn-sm px-4 fw-semibold"
                                                    style={{ borderWidth: '2px' }}
                                                    onClick={() => setShowFullReport(true)}
                                                  >
                                                    <i className="fas fa-file-alt me-2"></i>
                                                    View Full Report
                                                  </button>
                                                </div>
                                              )}
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
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
    {/* Full Report Modal */}
    {showFullReport && routeUpdateResult && (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title fw-bold">
                <i className="fas fa-route me-2"></i>
                Route Update Full Report
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowFullReport(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-success">
                <i className="fas fa-check-circle me-2"></i>
                <strong>Successfully rerouted {routeUpdateResult.length} buses</strong> from low demand to high demand routes.
              </div>
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>Bus ID</th>
                      <th>Company Name</th>
                      <th>Previous Route</th>
                      <th>New Route</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeUpdateResult.map((reroute, index) => (
                      <tr key={index}>
                        <td className="fw-bold">{index + 1}</td>
                        <td className="fw-semibold">{reroute.busId}</td>
                        <td className="text-primary fw-semibold">{reroute.companyName}</td>
                        <td className="text-muted">
                          {reroute.oldRouteId === -1 ? 'No Route' : `Route ${reroute.oldRouteId}`}
                        </td>
                        <td className="text-success fw-bold">Route {reroute.newRouteId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowFullReport(false)}
              >
                <i className="fas fa-times me-2"></i>
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