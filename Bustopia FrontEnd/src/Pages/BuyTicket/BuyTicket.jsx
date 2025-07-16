import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../Context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  fetchAvailableBuses,
  bookTicket,
  getAllStops,
  getDestinationsForSource,
  getSeatLayout,
  getBookedSeats,
  getReviewsByBusId,
} from "../../Api/ApiCalls";
import "./BuyTicket.css";
import { Navbar } from "../../Components/Navbar/Navbar";
import { formatDistanceToNow } from "date-fns";

const BuyTicket = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    date: "",
    category: "",
    min_budget: 0,
    max_budget: 2000,
  });

  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [seatLayout, setSeatLayout] = useState(null);
  const [bookedSeats, setBookedSeats] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLoading, setSeatLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(-1);
  const [showReviews, setShowReviews] = useState(false);

  const fetchReviews = async (busId) => {
    try {
      const response = await getReviewsByBusId(busId);
      setReviews(response.data || []);
      
      if(reviewIndex === busId) {
        setShowReviews(false);
        setReviewIndex(-1); 
      } else {
        setShowReviews(true);
        setReviewIndex(busId);
      }
    } catch (err) {
      console.error("Error fetching reviews", err);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch destinations when source changes
  useEffect(() => {
    if (!formData.source) {
      setAvailableDestinations([]);
      setFormData((prev) => ({ ...prev, destination: '' }));
      return;
    }
    let isMounted = true;
    getDestinationsForSource(formData.source)
      .then((response) => {
        if (!isMounted) return;
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
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load destinations", err);
      });
    return () => {
      isMounted = false;
    };
  }, [formData.source]);

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

  const handleSelectSeats = async (bus) => {
    if (!user) {
      setError("Please log in to select seats.");
      navigate("/login");
      return;
    }

    setSelectedBus(bus);
    setSeatLoading(true);
    try {
      const [layoutResponse, bookedResponse] = await Promise.all([
        getSeatLayout(bus.busId),
        getBookedSeats(bus.busId, formData.date),
      ]);
      setSeatLayout(layoutResponse.data);
      setBookedSeats(bookedResponse.data || {});
      setShowSeatModal(true);
    } catch (err) {
      setError("Failed to load seat layout or booked seats.");
      console.error(err);
    } finally {
      setSeatLoading(false);
    }
  };

  const handleSeatClick = (seatLabel) => {
    if (bookedSeats[seatLabel]) return; // Prevent selecting booked seats
    if (selectedSeats.includes(seatLabel)) {
      setSelectedSeats((prev) => prev.filter((seat) => seat !== seatLabel));
    } else if (selectedSeats.length < 4) {
      setSelectedSeats((prev) => [...prev, seatLabel]);
    } else {
      setError("You can select up to 4 seats only.");
    }
  };

  const handleBookTicket = async () => {
    if (!user) {
      setError("Please log in to book a ticket.");
      navigate("/login");
      return;
    }

    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }

    try {
      const bookingData = {
        userId: user.id,
        busId: selectedBus.busId,
        source: formData.source,
        destination: formData.destination,
        date: formData.date,
        time: selectedBus.departureTime,
        seats: selectedSeats,
      };
      const response = await bookTicket(bookingData);
      setError("");
      setShowSeatModal(false);
      setSelectedSeats([]);
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
              disabled={!formData.source || availableDestinations.length === 0}
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

          <div className="form-group">
            <label htmlFor="coach_type">From:</label>
            <select
              id="coach_type"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select Coach type</option>
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>

            </select>
          </div>

          <div className="form-group">
            <label htmlFor="min_budget">min_budget:</label>
            <input
              type="text"
              placeholder="Minimum Budget"
              value={formData.min_budget}
              onChange={(e) => setFormData((prev) => ({ ...prev, min_budget: e.target.value }))}
            />
          </div>


          <div className="form-group">
            <label htmlFor="max_budget">From:</label>
            <input
              type="text"
              placeholder="Maximum Budget"
              value={formData.max_budget}
              onChange={(e) => setFormData((prev) => ({ ...prev, max_budget: e.target.value }))}
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
                    <p>Available Seats: {bus.availableSeats}</p>
                    <p>
                      Route:{" "}
                      {bus.route?.stops?.join(" → ") || "No route available"}
                    </p>
                    <p>
                      Departure:{" "}
                      {formatFullDateTime(formData.date, bus.departureTime)}
                    </p>
                    <p>Price: {bus.price} ৳</p>
                    <div>
                      <button
                        onClick={() => handleSelectSeats(bus)}
                        className="book-button"
                        disabled={seatLoading}
                      >
                        {seatLoading && selectedBus?.busId === bus.busId
                          ? "Loading..."
                          : "Select Seats"}
                      </button>

                      <button
                        className="book-button"
                        onClick={() => fetchReviews(bus.busId)}
                      >
                        Reviews
                      </button>
                    </div>

                    {showReviews && reviewIndex === bus.busId ? (reviews.length > 0 ? (
                      reviews.map((review, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "15px",
                            marginBottom: "15px",
                            backgroundColor: "#ffffff",
                            padding: "15px",
                            borderRadius: "10px",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                          }}
                        >
                          <img
                            src={review.userPhoto || "https://via.placeholder.com/50"}
                            alt="User"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: "bold", color: "#333" }}>{review.userName}</span>
                              <span style={{ fontSize: "0.9rem", color: "#777" }}>
                                {formatDistanceToNow(new Date(review.reviewTime), { addSuffix: true })}
                              </span>
                            </div>

                            <div style={{ color: "#ffc107", margin: "5px 0" }}>
                              {"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}
                            </div>

                            <p style={{ margin: "0", color: "#444" }}>{review.message}</p>

                            {review.images?.length > 0 && (
                              <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                {review.images.map((img, i) => (
                                  <img key={i} src={img} alt="Review" style={{
                                    width: "100px",
                                    height: "100px",
                                    objectFit: "cover",
                                    borderRadius: "8px"
                                  }} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ marginTop: "10px" }}>No reviews found.</p>
                    )) : <></>}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {showSeatModal && seatLayout && (
          <div className="seat-modal-overlay">
            <div className="seat-modal">
              <h3>Select Seats for {selectedBus.companyName}</h3>
              <p>{seatLayout.name} ({seatLayout.category})</p>
              <div className="seat-grid">
                {seatLayout.layout.map((row, rowIndex) => (
                  <div key={rowIndex} className="seat-row">
                    {row.map((seatLabel, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`seat ${seatLabel === "" ? "empty" : "available"
                          } ${bookedSeats[seatLabel] ? "booked" : ""} ${selectedSeats.includes(seatLabel) ? "selected" : ""
                          }`}
                        onClick={() =>
                          seatLabel !== "" && handleSeatClick(seatLabel)
                        }
                      >
                        {seatLabel || " "}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="seat-legend">
                <div>
                  <span className="seat available"></span> Available
                </div>
                <div>
                  <span className="seat booked"></span> Booked
                </div>
                <div>
                  <span className="seat selected"></span> Selected
                </div>
              </div>
              <div className="seat-modal-actions">
                <button
                  onClick={() => setShowSeatModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookTicket}
                  className="book-button"
                  disabled={selectedSeats.length === 0}
                >
                  Book {selectedSeats.length} Seat
                  {selectedSeats.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyTicket;