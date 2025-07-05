import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ticket = location.state?.ticket;

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

  if (!ticket) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <h2>No Ticket Found</h2>
          <p>Please select a ticket to proceed with payment.</p>
          <button className="back-button" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = () => {
    alert("Payment successful! Your ticket is confirmed.");
    navigate("/"); // Redirect to homepage or a success page
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Complete Your Payment</h2>
        <div className="ticket-info">
          <div className="ticket-info-item">
            <span className="label">Ticket Code:</span>
            <span className="value">{ticket.ticketCode}</span>
          </div>
          <div className="ticket-info-item">
            <span className="label">Bus:</span>
            <span className="value">
              {ticket.bus?.companyName || "N/A"} ({ticket.bus?.category || "N/A"})
            </span>
          </div>
          <div className="ticket-info-item">
            <span className="label">Route:</span>
            <span className="value">
              {ticket.source} → {ticket.destination}
            </span>
          </div>
          <div className="ticket-info-item">
            <span className="label">Seats:</span>
            <span className="value">
              {ticket.seats?.length > 0 ? ticket.seats.join(", ") : "N/A"}
            </span>
          </div>
          <div className="ticket-info-item">
            <span className="label">Date & Time:</span>
            <span className="value">
              {formatDateTime(ticket.date, ticket.scheduledTime)}
            </span>
          </div>
          <div className="ticket-info-item">
            <span className="label">Price:</span>
            <span className="value">{ticket.price} BDT</span>
          </div>
          <div className="ticket-info-item">
            <span className="label">Status:</span>
            <span className="value">{ticket.status}</span>
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