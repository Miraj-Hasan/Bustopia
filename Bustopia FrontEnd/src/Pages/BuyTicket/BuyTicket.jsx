import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../Context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  fetchAvailableBuses,
  bookTicket,
  getAllStops,
  getDestinationsForSource,
} from "../../Api/ApiCalls";
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
  const [stops, setStops] = useState([]);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadStops = async () => {
      try {
        const response = await getAllStops();
        setStops(response.data);
      } catch (err) {
        console.error("Failed to load stops", err);
      }
    };
    loadStops();
  }, []);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If source is changed, dynamically update destinations
    if (name === "source") {
      try {
        const response = await getDestinationsForSource(value);
        setAvailableDestinations(response.data);

        // Clear destination if it is no longer valid
        setFormData((prev) => ({
          ...prev,
          destination: response.data.includes(prev.destination)
            ? prev.destination
            : "",
        }));
      } catch (err) {
        console.error("Failed to load destinations", err);
      }
    }
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
        routeId: bus.routeId,
        departureTime: bus.departureTime,
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
      <div style={{ width: "250px" }}>
        <Navbar />
      </div>
      <div className="buy-ticket-container">
        <h2>Book Your Bus Ticket</h2>

        <form onSubmit={handleSearchBuses} className="search-form">
          <div className="form-group">
            <label htmlFor="source">From:</label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              required
            >
              <option value="">Select source</option>
              {stops.map((stop, idx) => (
                <option key={idx} value={stop}>
                  {stop}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="destination">To:</label>
            <select
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              required
              disabled={!formData.source}
            >
              <option value="">Select destination</option>
              {availableDestinations.map((stop, idx) => (
                <option key={idx} value={stop}>
                  {stop}
                </option>
              ))}
            </select>
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

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {buses.length > 0 && (
          <div className="bus-results">
            <h3>Available Buses</h3>
            <ul>
              {buses.map((bus) => (
                <li key={bus.busId} className="bus-item">
                  <p>
                    <strong>{bus.companyName}</strong> ({bus.busType})
                  </p>
                  <p>
                    Route: {bus.source} to {bus.destination}
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
