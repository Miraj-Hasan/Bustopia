import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Payment.css";
import { initiatePayment } from "../../Api/ApiCalls";
import { UserContext } from "../../Context/UserContext";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const booking = location.state?.booking;

  const formatDateTime = (date, time) => {
    if (!date || !time) return "N/A";
    const dateObj = new Date(date);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = dateObj.toLocaleDateString("en-US", options);
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${formattedDate}, ${hour}:${minuteStr} ${ampm}`;
  };

  const handlePayment = async () => {
    const tranId = "TXN_" + Date.now(); // Unique transaction ID

    try {
      const response = await initiatePayment({
        amount: booking.price,
        tranId: tranId,
        customerName: user.username,
        customerEmail: user.email,
        customerPhone: user.phone,
        bookingData: booking,
      });

      console.log("payment initiate response", response);

      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else {
        alert("Failed to initiate payment.");
      }
    } catch (err) {
      alert("Payment initiation failed.");
    }
  };

  if (!booking) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <h2>No Booking Found</h2>
          <p>Please select a booking to proceed with payment.</p>
          <button className="back-button" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Complete Your Payment</h2>
        <div className="ticket-info">
          <div className="ticket-info-item">
            <span className="label">Bus ID:</span>
            <span className="value">{booking.busId}</span>
          </div>
          <div className="ticket-info-item">
            <span className="label">Route:</span>
            <span className="value">
              {booking.source} → {booking.destination}
            </span>
          </div>
          <div className="ticket-info-item">
            <span className="label">Seats:</span>
            <span className="value">
              {booking.seats?.length > 0 ? booking.seats.join(", ") : "N/A"}
            </span>
          </div>
          <div className="ticket-info-item">
            <span className="label">Date & Time:</span>
            <span className="value">
              {formatDateTime(booking.date, booking.time)}
            </span>
          </div>
          <div className="ticket-info-item">
            <span className="label">Total Price:</span>
            <span className="value">{booking.price} BDT</span>
          </div>
        </div>
        <div className="payment-actions">
          <button className="cancel-button" onClick={() => navigate("/buy-ticket")}>
            Cancel
          </button>
          <button className="pay-button" onClick={handlePayment}>
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
