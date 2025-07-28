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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BuyTicket = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    date: "",
    category: "",
    min_budget: "0",
    max_budget: "2000",
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

      if (reviewIndex === busId) {
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

  useEffect(() => {
    if (!formData.source) {
      setAvailableDestinations([]);
      setFormData((prev) => ({ ...prev, destination: "" }));
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
    if (bookedSeats[seatLabel]) return;
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

    const bookingData = {
      userId: user.id,
      busId: selectedBus.busId,
      source: formData.source,
      destination: formData.destination,
      date: formData.date,
      time: selectedBus.departureTime,
      seats: selectedSeats,
      price: selectedBus.price * selectedSeats.length,
    };

    setShowSeatModal(false);
    setSelectedSeats([]);
    navigate("/payment", { state: { booking: bookingData } });
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
      <div
        className="buy-ticket-container"
        style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "600",
            marginBottom: "30px",
            color: "#333",
          }}
        >
          Book Your Bus Ticket
        </h2>

        <form
          onSubmit={handleSearchBuses}
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div className="form-group">
              <label
                htmlFor="source"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                From:
              </label>
              <select
                id="source"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
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
              <label
                htmlFor="destination"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                To:
              </label>
              <select
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                required
                disabled={
                  !formData.source || availableDestinations.length === 0
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
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
              <label
                htmlFor="date"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Date:
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={getTodayDate()}
                max={getMaxDate()}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
            }}
          >
            <div className="form-group">
              <label
                htmlFor="coach_type"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Coach Type:
              </label>
              <select
                id="coach_type"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Any</option>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </div>

            <div className="form-group">
              <label
                htmlFor="min_budget"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Minimum Budget:
              </label>
              <input
                type="number"
                id="min_budget"
                name="min_budget"
                placeholder="Minimum ticket price"
                value={formData.min_budget}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="max_budget"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Maximum Budget:
              </label>
              <input
                type="number"
                id="max_budget"
                name="max_budget"
                placeholder="Maximum ticket price"
                value={formData.max_budget}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="search-button"
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            Search Buses
          </button>
        </form>

        {error && (
          <p style={{ color: "#dc3545", marginTop: "15px" }}>{error}</p>
        )}
        {success && (
          <p style={{ color: "#28a745", marginTop: "15px" }}>{success}</p>
        )}
        {loading && (
          <p style={{ color: "#777", marginTop: "15px" }}>
            Searching for buses...
          </p>
        )}

        {!loading && hasSearched && buses.length === 0 && (
          <p style={{ color: "#777", marginTop: "15px" }}>
            No bus found for the selected day.
          </p>
        )}

        {buses.length > 0 && !loading && (
          <div className="bus-results" style={{ marginTop: "30px" }}>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              Available Buses ({buses.length})
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {buses
                .slice()
                .sort((a, b) => a.departureTime.localeCompare(b.departureTime))
                .map((bus) => (
                  <li
                    key={bus.busId}
                    className="bus-item"
                    style={{
                      background: "#fff",
                      padding: "20px",
                      marginBottom: "15px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 10px",
                        fontWeight: "600",
                        fontSize: "1.2rem",
                      }}
                    >
                      {bus.companyName} - {bus.busId} ({bus.category})
                    </p>
                    <p style={{ margin: "0 0 10px" }}>
                      Available Seats: {bus.availableSeats}
                    </p>
                    <p style={{ margin: "0 0 10px" }}>
                      Route:{" "}
                      {bus.route?.stops?.join(" → ") || "No route available"}
                    </p>
                    <p style={{ margin: "0 0 10px" }}>
                      Departure:{" "}
                      {formatFullDateTime(formData.date, bus.departureTime)}
                    </p>
                    <p style={{ margin: "0 0 10px" }}>Price: {bus.price} ৳</p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleSelectSeats(bus)}
                        className="book-button"
                        disabled={seatLoading}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#28a745",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          width: "120px", // Fixed width for consistent size
                          height: "40px",
                          textAlign: "center", // Center text for better appearance
                        }}
                      >
                        {seatLoading && selectedBus?.busId === bus.busId
                          ? "Loading..."
                          : "Select Seats"}
                      </button>
                      <button
                        className="book-button"
                        onClick={() => fetchReviews(bus.busId)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          width: "120px", // Same width as other buttons
                          height: "40px",
                          textAlign: "center",
                        }}
                      >
                        Reviews
                      </button>
                      <button
                        className="book-button"
                        onClick={() =>
                          window.open(`/bus/${bus.busId}`, "_blank")
                        }
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          width: "120px", // Same width as other buttons
                          height: "40px",
                          textAlign: "center",
                        }}
                      >
                        View Details
                      </button>
                    </div>

                    {showReviews && reviewIndex === bus.busId ? (
                      reviews.length > 0 ? (
                        reviews.map((review, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "15px",
                              marginTop: "15px",
                              backgroundColor: "#f8f9fa",
                              padding: "15px",
                              borderRadius: "10px",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                            }}
                          >
                            <img
                              src={
                                review.userPhoto ||
                                "https://via.placeholder.com/50"
                              }
                              alt="User"
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{ fontWeight: "bold", color: "#333" }}
                                >
                                  {review.userName}
                                </span>
                                <span
                                  style={{ fontSize: "0.9rem", color: "#777" }}
                                >
                                  {formatDistanceToNow(
                                    new Date(review.reviewTime),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                              <div
                                style={{ color: "#ffc107", margin: "5px 0" }}
                              >
                                {"★".repeat(review.stars)}
                                {"☆".repeat(5 - review.stars)}
                              </div>
                              <p style={{ margin: "0", color: "#444" }}>
                                {review.message}
                              </p>
                              {review.images?.length > 0 && (
                                <div
                                  style={{
                                    marginTop: "10px",
                                    display: "flex",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {review.images.map((img, i) => (
                                    <img
                                      key={i}
                                      src={img}
                                      alt="Review"
                                      style={{
                                        width: "100px",
                                        height: "100px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ marginTop: "10px" }}>No reviews found.</p>
                      )
                    ) : null}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {showSeatModal && seatLayout && (
          <div
            className="seat-modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              className="seat-modal"
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "8px",
                maxWidth: "600px",
                width: "90%",
              }}
            >
              <h3 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>
                Select Seats for {selectedBus.companyName} - {selectedBus.busId}
              </h3>
              <p>
                {seatLayout.name} ({seatLayout.category})
              </p>
              <div
                className="seat-grid"
                style={{ display: "grid", gap: "10px", marginBottom: "20px" }}
              >
                {seatLayout.layout.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="seat-row"
                    style={{ display: "flex", gap: "10px" }}
                  >
                    {row.map((seatLabel, colIndex) => {
                      // Determine seat background color
                      let seatBackground;
                      if (seatLabel === "") {
                        seatBackground = "#f8f9fa"; // Empty seat
                      } else if (bookedSeats[seatLabel]) {
                        seatBackground = "#dc3545"; // Booked seat (red)
                      } else if (selectedSeats.includes(seatLabel)) {
                        seatBackground = "#007bff"; // Selected seat (blue)
                      } else {
                        seatBackground = "#28a745"; // Available seat (green)
                      }

                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`seat ${
                            seatLabel === "" ? "empty" : "available"
                          } ${bookedSeats[seatLabel] ? "booked" : ""} ${
                            selectedSeats.includes(seatLabel) ? "selected" : ""
                          }`}
                          onClick={() =>
                            seatLabel !== "" && handleSeatClick(seatLabel)
                          }
                          style={{
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            cursor:
                              seatLabel !== "" && !bookedSeats[seatLabel]
                                ? "pointer"
                                : "not-allowed",
                            background: seatBackground,
                            color: seatLabel === "" ? "#666" : "#fff", // Text color
                          }}
                        >
                          {seatLabel || " "}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div
                className="seat-legend"
                style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
              >
                <div>
                  <span
                    className="seat available"
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      background: "#28a745", // Green for available
                      border: "1px solid #ccc",
                      marginRight: "5px",
                    }}
                  ></span>
                  Available
                </div>
                <div>
                  <span
                    className="seat booked"
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      background: "#dc3545", // Red for booked
                      border: "1px solid #ccc",
                      marginRight: "5px",
                    }}
                  ></span>
                  Booked
                </div>
                <div>
                  <span
                    className="seat selected"
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      background: "#007bff", // Blue for selected
                      border: "1px solid #ccc",
                      marginRight: "5px",
                    }}
                  ></span>
                  Selected
                </div>
              </div>
              <div
                className="seat-modal-actions"
                style={{ display: "flex", gap: "10px" }}
              >
                <button
                  onClick={() => setShowSeatModal(false)}
                  className="cancel-button"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookTicket}
                  className="book-button"
                  disabled={selectedSeats.length === 0}
                  style={{
                    padding: "8px 16px",
                    backgroundColor:
                      selectedSeats.length === 0 ? "#ccc" : "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor:
                      selectedSeats.length === 0 ? "not-allowed" : "pointer",
                  }}
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
