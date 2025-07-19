import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get("status"); // custom param we'll pass from backend redirect

    if (status === "success") {
      toast.success("✅ Payment successful!");
    } else if (status === "fail") {
      toast.error("❌ Payment failed.");
    } else if (status === "cancel") {
      toast.warn("⚠️ Payment canceled.");
    } else {
      toast.info("ℹ️ Unknown payment status.");
    }

    const timer = setTimeout(() => {
      navigate("/buy-ticket");
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [location, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Redirecting back to Buy Ticket page...</h2>
    </div>
  );
};

export default PaymentResult;
