import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { fetchBusInfo, getReviewsByBusId } from "../../Api/ApiCalls";
import { Navbar } from "../../Components/Navbar/Navbar";
import { UserContext } from "../../Context/UserContext";
import { formatDistanceToNow } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BusInfo = () => {
  const { busid } = useParams();
  const [busInfo, setBusInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const [reviews, setReviews] = useState([]);

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
                            className={`rounded-circle d-flex align-items-center justify-content-center fw-bold text-white ${
                              i === 0
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
                            className={`seat d-flex justify-content-center align-items-center border rounded me-1 ${
                              seat === "_"
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