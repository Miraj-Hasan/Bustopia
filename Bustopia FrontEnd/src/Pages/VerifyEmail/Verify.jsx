import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyEmailLink } from "../../Api/ApiCalls";

function Verify() {
  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    if (!code || !email) {
      setStatus("error");
      toast.error("Missing verification parameters.");
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmailLink(code, email);
        if (response.status === 200) {
          toast.success("Your account has been verified!");
          setStatus("success");
          setTimeout(() => navigate("/login"), 3000);
        }
      } catch (err) {
        toast.error(err?.response?.data || "Verification failed.");
        setStatus("error");
      }
    };

    verify();
  }, []);

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "70vh", textAlign: "center" }}
    >
      {status === "verifying" && (
        <>
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Verifying your account...</h4>
        </>
      )}

      {status === "success" && (
        <>
          <div className="text-success mb-3" style={{ fontSize: "3rem" }}>
            ✅
          </div>
          <h4>Account verified! Redirecting to login...</h4>
        </>
      )}

      {status === "error" && (
        <>
          <div className="text-danger mb-3" style={{ fontSize: "3rem" }}>
            ❌
          </div>
          <h4>Verification failed or expired.</h4>
        </>
      )}
    </div>
  );
}

export default Verify;
