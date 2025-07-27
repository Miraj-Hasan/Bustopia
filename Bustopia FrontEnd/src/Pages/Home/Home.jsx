import { useEffect, useState, useContext, useMemo } from "react";
import { Navbar } from "../../Components/Navbar/Navbar";
import { UserContext } from "../../Context/UserContext";
import {
  getAllTickets,
  getTicketSales,
  getAllReviews,
  getBusesByRoute,
  getBusesByCompany,
} from "../../Api/ApiCalls";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export function Home() {
  const { user } = useContext(UserContext);
  const [ticketSales, setTicketSales] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeBuses, setRouteBuses] = useState([]);
  const [isLoadingBuses, setIsLoadingBuses] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyBuses, setCompanyBuses] = useState([]);
  const [isLoadingCompanyBuses, setIsLoadingCompanyBuses] = useState(false);

  // Fetch data
  useEffect(() => {
    getTicketSales().then((res) => setTicketSales(res.data || []));
    getAllTickets().then((res) => setAllTickets(res.data || []));
    getAllReviews().then((res) => setAllReviews(res.data || []));
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return "Time not available";

    // If it's already in HH:MM format, convert to 12-hour format
    const [hours, minutes] = timeString.split(":");
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? "PM" : "AM";

    return `${hour12}:${minutes} ${ampm}`;
  };

  // Popular Companies (based on activity)
  const popularCompanies = useMemo(() => {
    const map = new Map();
    allTickets.forEach((ticket) => {
      const name = ticket.companyName;
      if (!map.has(name)) {
        map.set(name, { name, count: 1 });
      } else {
        const company = map.get(name);
        company.count += 1;
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [allTickets]);

  // Top Rated Companies - removed the minimum review filter
  const topRatedCompanies = useMemo(() => {
    const map = new Map();
    allReviews.forEach((review) => {
      const name = review.companyName;
      if (!map.has(name)) {
        map.set(name, { name, stars: review.stars, count: 1 });
      } else {
        const company = map.get(name);
        company.stars += review.stars;
        company.count += 1;
      }
    });
    return Array.from(map.values())
      .map((c) => ({ ...c, avg: c.stars / c.count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);
  }, [allReviews]);

  // Popular Routes
  const popularRoutes = useMemo(() => {
    const map = new Map();
    ticketSales.forEach((route) => {
      const key = `${route.source}→${route.destination}`;
      if (!map.has(key)) {
        map.set(key, {
          source: route.source,
          destination: route.destination,
          ticketsSold: route.ticketsSold,
        });
      } else {
        const existing = map.get(key);
        existing.ticketsSold += route.ticketsSold;
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.ticketsSold - a.ticketsSold)
      .slice(0, 10);
  }, [ticketSales]);

  // All Available Companies
  const allCompanies = useMemo(() => {
    const seen = new Set();
    return allTickets
      .filter((ticket) => {
        if (seen.has(ticket.companyName)) return false;
        seen.add(ticket.companyName);
        return true;
      })
      .map((ticket) => ({ name: ticket.companyName }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allTickets]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="rating-stars">
        {"★".repeat(fullStars)}
        {hasHalfStar && "☆"}
        {"☆".repeat(emptyStars)}
      </div>
    );
  };

  const handleRouteClick = async (route) => {
    setIsLoadingBuses(true);
    setSelectedRoute(route);

    // Use source and destination from the route object
    const buses = await getBusesByRoute(route.source, route.destination);
    setRouteBuses(buses);
    setIsLoadingBuses(false);
  };

  const handleCompanyClick = async (companyName) => {
    setIsLoadingCompanyBuses(true);
    setSelectedCompany(companyName);

    try {
      const buses = await getBusesByCompany(companyName);
      setCompanyBuses(buses);
    } catch (error) {
      console.error("Failed to fetch company buses:", error);
      setCompanyBuses([]);
    }

    setIsLoadingCompanyBuses(false);
  };

  const closeCompanyModal = () => {
    setSelectedCompany(null);
    setCompanyBuses([]);
  };

  const handleBusClick = (busId) => {
    navigate(`/bus/${busId}`);
  };

  const closeBusModal = () => {
    setSelectedRoute(null);
    setRouteBuses([]);
  };

  return (
    <div className="dashboard-container">
      <div className="navbar-container">
        <Navbar />
      </div>

      <div className="main-content">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">Welcome to BusTopia</h1>
          <p className="hero-subtitle">
            Your journey begins with the perfect ride - connecting dreams to
            destinations!
          </p>
        </div>

        {/* Popular Routes */}
        <section className="section">
          <h2 className="section-title popular-routes-title">Popular Routes</h2>
          <div className="grid-container">
            {popularRoutes.map((route, i) => (
              <div
                key={i}
                className="card route-card"
                onClick={() => handleRouteClick(route)}
              >
                <div className="route-header">
                  <span className="route-location">{route.source}</span>
                  <span className="route-arrow">→</span>
                  <span className="route-location">{route.destination}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Rated Companies */}
        <section className="section">
          <h2 className="section-title rated-companies-title">
            Highest Rated Companies
          </h2>
          <div className="grid-container">
            {topRatedCompanies.map((company, i) => (
              <div
                key={i}
                className="card company-card"
                onClick={() => handleCompanyClick(company.name)}
              >
                <h3 className="company-name">{company.name}</h3>
                <div className="rating-container">
                  <div className="rating-display">
                    {renderStars(company.avg)}
                    <span className="rating-value">
                      {company.avg.toFixed(1)}
                    </span>
                  </div>
                  <span className="review-count">{company.count} reviews</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Companies */}
        <section className="section">
          <h2 className="section-title popular-companies-title">
            Popular Companies
          </h2>
          <div className="grid-container">
            {popularCompanies.map((company, i) => (
              <div
                key={i}
                className="card simple-company-card"
                onClick={() => handleCompanyClick(company.name)}
              >
                <h3 className="simple-company-name">{company.name}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* All Available Companies */}
        <section className="section">
          <h2 className="section-title all-companies-title">
            All Available Companies
          </h2>
          <div className="all-companies-container">
            <div className="all-companies-grid">
              {allCompanies.map((company, i) => (
                <div
                  key={i}
                  className="company-pill"
                  onClick={() => handleCompanyClick(company.name)}
                >
                  <span className="company-pill-text">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      {/* Bus Modal */}
      {selectedRoute && (
        <div className="bus-modal-overlay" onClick={closeBusModal}>
          <div className="bus-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bus-modal-header">
              <h3>
                Buses for {selectedRoute.source} → {selectedRoute.destination}
              </h3>
              <button className="close-button" onClick={closeBusModal}>
                ×
              </button>
            </div>

            <div className="bus-modal-content">
              {isLoadingBuses ? (
                <div className="loading">Loading buses...</div>
              ) : routeBuses.length > 0 ? (
                <div className="buses-grid">
                  {routeBuses.map((bus) => (
                    <div
                      key={bus.busId}
                      className="bus-card"
                      onClick={() => handleBusClick(bus.busId)}
                    >
                      <div className="bus-info">
                        <h4>
                          {bus.companyName} - Bus {bus.busId} ({bus.category})
                        </h4>
                        <p className="bus-license">{bus.licenseNo}</p>
                        <p className="bus-time">
                          Leaves {selectedRoute.source} at{" "}
                          {formatTime(bus.startTime)}
                        </p>
                      </div>
                      <div className="bus-arrow">→</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-buses">
                  No buses available for this route
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Company Buses Modal */}
      {selectedCompany && (
        <div className="bus-modal-overlay" onClick={closeCompanyModal}>
          <div
            className="bus-modal company-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bus-modal-header">
              <h3>Buses by {selectedCompany}</h3>
              <button className="close-button" onClick={closeCompanyModal}>
                ×
              </button>
            </div>

            <div className="bus-modal-content">
              {isLoadingCompanyBuses ? (
                <div className="loading">Loading buses...</div>
              ) : companyBuses.length > 0 ? (
                <div className="buses-grid">
                  {companyBuses.map((bus) => (
                    <div
                      key={bus.busId}
                      className="bus-card"
                      onClick={() => handleBusClick(bus.busId)}
                    >
                      <div className="bus-info">
                        <h4>
                          Bus {bus.busId} ({bus.category})
                        </h4>
                        <p className="bus-license">
                          License no. {bus.licenseNo}
                        </p>
                        <p className="bus-route">
                          Route:{" "}
                          {bus.route?.stops
                            ?.map((stop) => stop.name || stop)
                            .join(" → ") || "Route not available"}
                        </p>
                        <p className="bus-time">
                          Starts from{" "}
                          {bus.route?.stops?.[0]?.name ||
                            bus.route?.stops?.[0] ||
                            "Unknown"}{" "}
                          at {formatTime(bus.startTime)}
                        </p>
                      </div>
                      <div className="bus-arrow">→</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-buses">
                  No buses available for this company
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
