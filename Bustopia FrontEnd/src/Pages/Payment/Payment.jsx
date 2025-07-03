import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ticket = location.state?.ticket;

  if (!ticket) {
    return (
      <div className="payment-container">
        <h2>No ticket found</h2>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  const handlePayment = () => {
    alert("Payment successful");
    navigate("/"); // Redirect to homepage or success page
  };

  return (
    <div className="payment-container">
      <h2>Payment</h2>
      <div className="ticket-info">
        <p><strong>Ticket Code:</strong> {ticket.ticketCode}</p>
        <p><strong>Bus:</strong> {ticket.bus?.companyName} ({ticket.bus?.category})</p>
        <p><strong>Route:</strong> {ticket.source} → {ticket.destination}</p>
        <p><strong>Date:</strong> {ticket.date}</p>
        <p><strong>Departure Time:</strong> {ticket.scheduledTime}</p>
        <p><strong>Price:</strong> {ticket.price} BDT</p>
        <p><strong>Status:</strong> {ticket.status}</p>
      </div>
      <button className="pay-button" onClick={handlePayment}>
        Pay Now
      </button>
    </div>
  );
};

export default Payment;
