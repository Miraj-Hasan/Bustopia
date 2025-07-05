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
  });

  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const loadStops = async () => {
      try {
        const response = await getAllStops();
        const sorted = response.data.sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
        setStops(sorted);
      } catch (err) {
        console.error("Failed to load stops", err);
      }
    };
    loadStops();
  }, []);

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 14);
    return max.toISOString().split("T")[0];
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "source") {
      try {
        const response = await getDestinationsForSource(value);
        const sorted = response.data.sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
        setAvailableDestinations(sorted);

        setFormData((prev) => ({
          ...prev,
          destination: sorted.includes(prev.destination)
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
      setLoading(true);
      setHasSearched(true);
      const response = await fetchAvailableBuses(formData);
      setBuses(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch buses. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
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
        source: formData.source,
        destination: formData.destination,
        date: formData.date,
        time: bus.departureTime,
      };
      const response = await bookTicket(bookingData);
      setError("");
      navigate("/payment", { state: { ticket: response.data } });
    } catch (err) {
      setError("Failed to book ticket. Please try again.");
      console.error(err);
    }
  };

  const formatFullDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "";

    const [hourStr, minuteStr] = timeStr.slice(0, 5).split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    const dateObj = new Date(dateStr);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const dateFormatted = dateObj.toLocaleDateString(undefined, options);

    return `${dateFormatted} — ${hour}:${minuteStr} ${ampm}`;
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
              min={getTodayDate()}
              max={getMaxDate()}
              required
            />
          </div>

          <button type="submit" className="search-button">
            Search Buses
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        {loading && <p className="loading-message">Searching for buses...</p>}

        {!loading && hasSearched && buses.length === 0 && (
          <p className="no-bus-message">No bus found for the selected day.</p>
        )}

        {buses.length > 0 && !loading && (
          <div className="bus-results">
            <h3>Available Buses ({buses.length})</h3>
            <ul>
              {buses
                .slice()
                .sort((a, b) => a.departureTime.localeCompare(b.departureTime))
                .map((bus) => (
                  <li key={bus.busId} className="bus-item">
                    <p>
                      <strong>{bus.companyName}</strong> ({bus.category})
                    </p>
                    <p>
                      Route:{" "}
                      {bus.route?.stops?.join(" → ") || "No route available"}
                    </p>
                    <p>
                      Departure:{" "}
                      {formatFullDateTime(formData.date, bus.departureTime)}
                    </p>
                    <p>Price: {bus.price} ৳</p>
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
