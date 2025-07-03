import React, { useState, useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import { useNavigate } from "react-router-dom";
import { fetchAvailableBuses, bookTicket } from "../../Api/ApiCalls";
import "./BuyTicket.css";

import { Navbar } from "../../Components/Navbar/Navbar";

const BuyTicket = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    date: "",
    time: "",
  });
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchBuses = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to search for buses.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetchAvailableBuses(formData);
      setBuses(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch buses. Please try again.");
      console.error(err);
    }
  };

  const handleBookTicket = async (bus) => {
    if (!user) {
      setError("Please log in to book a ticket.");
      navigate("/login");
      return;
    }

    try {
      const bookingData = {
        userId: user.id,
        busId: bus.busId,
        routeId: bus.route.routeId,
        departureTime: bus.startTime,
        source: bus.route.stops[0],
        destination: bus.route.stops[bus.route.stops.length - 1],
        date: formData.date,
      };
      const response = await bookTicket(bookingData);
      setError("");
      navigate("/payment", { state: { ticket: response.data } });
    } catch (err) {
      setError("Failed to book ticket. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div style={{ width: "250px" }}>
        <Navbar />
      </div>
      <div className="buy-ticket-container">
        <h2>Book Your Bus Ticket</h2>

        {/* Search Form */}
        <form onSubmit={handleSearchBuses} className="search-form">
          <div className="form-group">
            <label htmlFor="source">From:</label>
            <input
              type="text"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="destination">To:</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="time">Preferred Time:</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit" className="search-button">
            Search Buses
          </button>
        </form>

        {/* Error/Success Messages */}
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {/* Bus Results */}
        {buses.length > 0 && (
          <div className="bus-results">
            <h3>Available Buses</h3>
            <ul>
              {buses.map((bus) => (
                <li key={bus.busId} className="bus-item">
                  <p>
                    <strong>{bus.companyName}</strong> ({bus.category})
                  </p>
                  <p>
                    {/* Route: {bus.source} to {bus.destination} */}
                    Route: {bus.route.stops}
                  </p>
                  <p>
                    Departure: {new Date(bus.departureTime).toLocaleString()}
                  </p>
                  <p>Price: {bus.price}</p>
                  <button
                    onClick={() => handleBookTicket(bus)}
                    className="book-button"
                  >
                    Book Now
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyTicket;
