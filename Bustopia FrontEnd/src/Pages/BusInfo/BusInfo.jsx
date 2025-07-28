import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { fetchBusInfo, getReviewsByBusId, getSeatLayout, getBookedSeats } from "../../Api/ApiCalls";
import { Navbar } from "../../Components/Navbar/Navbar";
import { UserContext } from "../../Context/UserContext";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BusInfo = () => {
  const { busid } = useParams();
  const [busInfo, setBusInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const [reviews, setReviews] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [date, setDate] = useState("");
  const [selectedSeatLayout, setSelectedSeatLayout] = useState(null);
  const [bookedSeats, setBookedSeats] = useState({});
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [seatLoading, setSeatLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBusInfo(busid);
        setBusInfo(data);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [busid]);

  // Fetch reviews for this bus
  useEffect(() => {
    if (!busid) return;
    const fetchReviews = async () => {
      try {
        const response = await getReviewsByBusId(busid);
        setReviews(response.data || []);
      } catch (err) {
        setReviews([]);
      }
    };
    fetchReviews();
  }, [busid]);

  // Update destination options based on selected source
  useEffect(() => {
    if (!source || !busInfo?.route?.stops) {
      setDestination("");
      setDestinationOptions([]);
      return;
    }

    const stops = busInfo.route.stops;
    const sourceIndex = stops.indexOf(source);

    if (sourceIndex !== -1 && sourceIndex < stops.length - 1) {
      const newDestOptions = stops.slice(sourceIndex + 1);
      setDestination("");
      setDestinationOptions(newDestOptions);
    } else {
      setDestinationOptions([]);
    }
  }, [source, busInfo]);


  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 14);
    return max.toISOString().split("T")[0];
  };

  const handleSelectSeats = async () => {
    if (!user) {
      setError("Please log in to select seats.");
      navigate("/login");
      return;
    }

    setSeatLoading(true);
    try {
      const [layoutResponse, bookedResponse] = await Promise.all([
        getSeatLayout(busid),
        getBookedSeats(busid, date),
      ]);
      setSelectedSeatLayout(layoutResponse.data);
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

    const stops = busInfo.route?.stops || [];
    const priceMap = busInfo.priceMappings || [];
    const timeMap = busInfo.timeMappings || [];

    const sourceIndex = stops.indexOf(source);
    const destinationIndex = stops.indexOf(destination);

    if (sourceIndex === -1 || destinationIndex === -1 || sourceIndex >= destinationIndex) {
      setError("Invalid source or destination selection.");
      return;
    }

    // 🕒 1. Calculate departure time by summing time durations from start → source
    let totalDurationToSource = 0;
    for (let i = 0; i < sourceIndex; i++) {
      const from = stops[i];
      const to = stops[i + 1];

      const timeObj = timeMap.find(
        (t) => (t.stop1 === from && t.stop2 === to) || (t.stop1 === to && t.stop2 === from)
      );

      totalDurationToSource += Number(timeObj?.duration || 0);
    }

    const baseTime = new Date(`1970-01-01T${busInfo.startTime}Z`);
    const departureTimeDate = new Date(baseTime.getTime() + totalDurationToSource * 60000);
    const departureTime = departureTimeDate.toISOString().slice(11, 16); // "HH:mm"

    // 💰 2. Calculate price from source → destination by summing segment prices
    let totalPrice = 0;
    for (let i = sourceIndex; i < destinationIndex; i++) {
      const from = stops[i];
      const to = stops[i + 1];

      const priceObj = priceMap.find(
        (p) => (p.stop1 === from && p.stop2 === to) || (p.stop1 === to && p.stop2 === from)
      );

      totalPrice += Number(priceObj?.price || 0);
    }

    const bookingData = {
      userId: user.id,
      busId: busid,
      source,
      destination,
      date,
      time: departureTime,
      seats: selectedSeats,
      price: totalPrice * selectedSeats.length,
    };

    setShowSeatModal(false);
    setSelectedSeats([]);
    navigate("/payment", { state: { booking: bookingData } });
  };



  if (loading) {
    return (
      <>
        <Navbar />
        <div
          className="main-content"
          style={{
            marginLeft: "250px",
            backgroundColor: "#f8f9fa",
            minHeight: "100vh",
          }}
        >
          <div className="container-fluid py-4">
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "60vh" }}
            >
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading bus information...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div
          className="main-content"
          style={{
            marginLeft: "250px",
            backgroundColor: "#f8f9fa",
            minHeight: "100vh",
          }}
        >
          <div className="container-fluid py-4">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error!</h4>
              <p className="mb-0">
                Failed to load bus information: {error.message}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const {
    companyName,
    category,
    licenseNo,
    startTime,
    photo,
    route,
    seatLayout,
    priceMappings,
    timeMappings,
  } = busInfo;

  const buildTimeline = () => {
    const timeline = [];
    const stops = route?.stops || [];

    for (let i = 0; i < stops.length - 1; i++) {
      const from = stops[i];
      const to = stops[i + 1];

      const priceObj = priceMappings.find(
        (p) =>
          (p.stop1 === from && p.stop2 === to) ||
          (p.stop1 === to && p.stop2 === from)
      );

      const timeObj = timeMappings.find(
        (t) =>
          (t.stop1 === from && t.stop2 === to) ||
          (t.stop1 === to && t.stop2 === from)
      );

      timeline.push({
        from,
        to,
        price: priceObj?.price ?? "N/A",
        duration: timeObj?.duration ?? "N/A",
      });
    }

    return timeline;
  };

  // for testing

  const timelineSegments = buildTimeline();

  return (
    <>
      <Navbar />
      <div
        className="main-content"
        style={{
          marginLeft: "250px",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <div className="container-fluid py-4">
          {/* Header Section */}
          <div className="row mb-4">
            <div className="col-lg-8">
              <div className="mb-4">
                <h1 className="display-4 fw-bold text-primary mb-2">
                  {companyName} - <span className="text-dark">{busid}</span>
                </h1>

                <span className="badge bg-secondary fs-6 mb-3">{category}</span>

                <div className="row g-3 mt-3">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h6 className="card-title text-muted mb-2">
                          <i className="bi bi-card-text me-2"></i>License Number
                        </h6>
                        <p className="card-text fw-semibold fs-5">
                          {licenseNo}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <h6 className="card-title text-muted mb-2">
                          <i className="bi bi-clock me-2"></i>Start Time
                        </h6>
                        <p className="card-text fw-semibold fs-5">
                          {startTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 my-4">
              {photo && (
                <div className="text-center">
                  <img
                    src={`${API_BASE_URL}/${photo}`}
                    alt="Bus"
                    className="img-fluid rounded-4 shadow"
                    style={{
                      maxHeight: "340px",
                      objectFit: "cover",
                      border: "4px solid #dee2e6",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}

          {/* Buy Ticket Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-danger text-white">
                  <h3 className="card-title mb-0">
                    <i className="bi bi-ticket-perforated me-2"></i>Buy Ticket
                  </h3>
                </div>
                <div className="card-body">
                  <form className="row g-3">
                    {/* Source Dropdown */}
                    <div className="col-md-4">
                      <label htmlFor="source" className="form-label fw-semibold">
                        Source
                      </label>
                      <select
                        id="source"
                        className="form-select"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                      >
                        <option value="">Select Source</option>
                        {route?.stops.slice(0, -1).map((stop, i) => (
                          <option key={i} value={stop}>
                            {stop}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Destination Dropdown */}
                    <div className="col-md-4">
                      <label htmlFor="destination" className="form-label fw-semibold">
                        Destination
                      </label>
                      <select
                        id="destination"
                        className="form-select"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        disabled={!source}
                      >
                        <option value="">Select Destination</option>
                        {destinationOptions.map((stop, i) => (
                          <option key={i} value={stop}>
                            {stop}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Picker */}
                    <div className="col-md-4">
                      <label htmlFor="date" className="form-label fw-semibold">
                        Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={getTodayDate()}
                        max={getMaxDate()}
                      />
                    </div>

                    {/* Select Seats Button */}
                    <div className="col-12 text-end">
                      <button
                        type="button"
                        className="btn btn-success px-4"
                        onClick={handleSelectSeats}
                        disabled={!source || !destination || !date || source === destination}
                      >
                        <i className="bi bi-eye me-1"></i>Select Seats
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {showSeatModal && selectedSeatLayout && (
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
                  Select Seats for {busInfo.companyName} - {busid}
                </h3>
                <p>
                  {selectedSeatLayout.name} ({selectedSeatLayout.category})
                </p>
                <div
                  className="seat-grid"
                  style={{ display: "grid", gap: "10px", marginBottom: "20px" }}
                >
                  {selectedSeatLayout.layout.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="seat-row"
                      style={{ display: "flex", gap: "10px" }}
                    >
                      {row.map((seatLabel, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`seat ${seatLabel === "" ? "empty" : "available"
                            } ${bookedSeats[seatLabel] ? "booked" : ""} ${selectedSeats.includes(seatLabel) ? "selected" : ""
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
                            background: bookedSeats[seatLabel]
                              ? "#dc3545"
                              : selectedSeats.includes(seatLabel)
                                ? "#28a745"
                                : seatLabel === ""
                                  ? "#f8f9fa"
                                  : "#fff",
                          }}
                        >
                          {seatLabel || " "}
                        </div>
                      ))}
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
                        background: "#fff",
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
                        background: "#dc3545",
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
                        background: "#28a745",
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


          <div className="row g-4">
            {/* Route Stops */}
            <div className="col-lg-6">
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h3 className="card-title mb-0">
                    <i className="bi bi-geo-alt me-2"></i>Route Stops
                  </h3>
                </div>
                <div className="card-body">
                  <div className="route-stops">
                    {route?.stops.map((stop, i) => (
                      <div key={i} className="d-flex align-items-center mb-3">
                        <div className="stop-indicator me-3">
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center fw-bold text-white ${i === 0
                              ? "bg-success"
                              : i === route.stops.length - 1
                                ? "bg-danger"
                                : "bg-secondary"
                              }`}
                            style={{
                              width: "32px",
                              height: "32px",
                              fontSize: "14px",
                            }}
                          >
                            {i + 1}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-semibold">{stop}</p>
                          {i === 0 && (
                            <small className="text-success">
                              Starting Point
                            </small>
                          )}
                          {i === route.stops.length - 1 && (
                            <small className="text-danger">
                              Final Destination
                            </small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Layout */}
            <div className="col-lg-6">
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-info text-white">
                  <h3 className="card-title mb-0">
                    <i className="bi bi-grid-3x3-gap me-2"></i>Seat Layout
                  </h3>
                </div>
                <div className="card-body text-center">
                  <div className="mb-3">
                    <h5 className="fw-bold">{seatLayout?.name}</h5>
                    <span className="badge bg-light text-dark">
                      {seatLayout?.category}
                    </span>
                  </div>

                  <div className="seat-layout-container d-inline-block p-4 bg-light rounded-3 border">
                    <div className="mb-2 text-muted small">
                      <i className="bi bi-arrow-up"></i> Front
                    </div>
                    {seatLayout?.layout.map((row, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="d-flex justify-content-center mb-2"
                      >
                        {row.map((seat, seatIndex) => (
                          <div
                            key={seatIndex}
                            className={`seat d-flex justify-content-center align-items-center border rounded me-1 ${seat === "_"
                              ? "bg-secondary bg-opacity-25"
                              : "bg-white shadow-sm"
                              }`}
                            style={{
                              width: "35px",
                              height: "35px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {seat !== "_" ? seat : ""}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-warning text-dark">
                  <h3 className="card-title mb-0">
                    <i className="bi bi-clock-history me-2"></i>Journey Timeline
                  </h3>
                </div>
                <div className="card-body">
                  {timelineSegments.length > 0 ? (
                    <div className="timeline-container">
                      {timelineSegments.map((seg, i) => (
                        <div
                          key={i}
                          className="timeline-segment mb-4 p-3 bg-light rounded-3"
                        >
                          <div className="row align-items-center">
                            <div className="col-md-3 text-center">
                              <div className="fw-bold text-primary fs-6">
                                {seg.from}
                              </div>
                            </div>
                            <div className="col-md-6 text-center">
                              <div className="d-flex justify-content-center align-items-center">
                                <div className="flex-grow-1 border-top border-2 border-primary mx-3"></div>
                                <div className="bg-white border border-primary rounded-pill px-3 py-1">
                                  <small className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {seg.duration} min
                                  </small>
                                  <span className="mx-2">|</span>
                                  <small className="text-success fw-bold">
                                    <i className="bi bi-currency-dollar me-1"></i>
                                    ৳{seg.price}
                                  </small>
                                </div>
                                <div className="flex-grow-1 border-top border-2 border-primary mx-3"></div>
                              </div>
                            </div>
                            <div className="col-md-3 text-center">
                              <div className="fw-bold text-primary fs-6">
                                {seg.to}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-info-circle fs-1 mb-3"></i>
                      <p>No timeline information available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Review Section */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <h3 className="card-title mb-0">
                    <i className="bi bi-chat-dots me-2"></i>Reviews
                  </h3>
                </div>
                <div className="card-body">
                  {/* List of reviews */}
                  {reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "15px",
                          marginBottom: "15px",
                          backgroundColor: "#f8f9fa",
                          padding: "15px",
                          borderRadius: "10px",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
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
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-info-circle fs-1 mb-3"></i>
                      <p>No reviews found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BusInfo;