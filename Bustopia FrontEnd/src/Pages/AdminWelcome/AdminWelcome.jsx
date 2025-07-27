import React, { useContext } from 'react';
import { AdminNavbar } from '../../Components/Navbar/AdminNavbar';
import { UserContext } from '../../Context/UserContext';
import { Navigate, Link } from 'react-router-dom';
import assets from '../../assets/assets';

export default function AdminWelcome() {
  const { user } = useContext(UserContext);

  // Admin protection - redirect if not admin
  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/login" replace />;
  }

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
                      <i className="fas fa-crown fa-3x opacity-75"></i>
                    </div>
                    <div className="d-flex align-items-center">
                      <Link to="/" className="me-3" style={{ textDecoration: 'none' }}>
                        <img src={assets.logo} alt="BusTopia Logo" height="80" className="rounded shadow-sm" />
                      </Link>
                      <div>
                        <h1 className="mb-0 fw-bold display-6">
                          Welcome to BusTopia Admin Portal
                        </h1>
                        <p className="mb-0 mt-2 opacity-75 fs-5">
                          <i className="fas fa-user-shield me-2"></i>
                          Administrative Control & Management System
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body p-5">
                  <div className="row">
                    <div className="col-12">
                      <div className="text-center py-3">
                        <div className="mb-4">
                          <i className="fas fa-rocket fa-4x text-primary mb-3"></i>
                        </div>
                        <h2 className="text-primary fw-bold mb-3">
                          System Overview & Guidelines
                        </h2>
                        <p className="text-muted fs-5 mb-4">
                          Welcome to your administrative control center. Here's everything you need to know to effectively manage BusTopia operations.
                        </p>
                        <div className="row justify-content-center">
                          <div className="col-md-10">
                            <div className="alert alert-info border-0 shadow-sm text-start">
                              <h5 className="mb-3"><i className="fas fa-lightbulb me-2 text-warning"></i>Getting Started</h5>
                              <ul className="mb-4 ps-4">
                                <li>Use the sidebar navigation to access different administrative features and analytics.</li>
                                <li>Monitor system performance through the Analytics dashboard for data-driven decisions.</li>
                                <li>Keep your admin credentials secure and log out after completing tasks.</li>
                              </ul>
                              <h5 className="mb-3"><i className="fas fa-cogs me-2 text-primary"></i>Key Features</h5>
                              <ul className="mb-4 ps-4">
                                <li><b>Route Management:</b> Configure bus routes, stops, and schedules to optimize the transportation network.</li>
                                <li><b>Analytics Dashboard:</b> Access comprehensive reports and insights on ticket sales, revenue, and customer reviews.</li>
                                <li><b>System Monitoring:</b> Monitor system performance and user activities in real-time.</li>
                                <li><b>Price Management:</b> Update and optimize pricing strategies based on revenue analysis.</li>
                              </ul>
                              <h5 className="mb-3"><i className="fas fa-shield-alt me-2 text-success"></i>Best Practices</h5>
                              <ul className="mb-0 ps-4">
                                <li>Regularly review analytics to monitor system health and identify trends.</li>
                                <li>Use data-driven insights to make informed decisions about pricing and routes.</li>
                                <li>Maintain system security by following proper authentication protocols.</li>
                                <li>Report any suspicious activity or system issues immediately.</li>
                              </ul>
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
      </div>
    </div>
  );
} 