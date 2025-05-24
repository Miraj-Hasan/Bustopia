import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../Api/ApiCalls";
import assets from "../../assets/assets";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false); // ⬅️ loading state
  const navigate = useNavigate();

  const title = import.meta.env.VITE_COMPANY_TITLE;

  async function submitHandler(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords did not match!");
      return;
    }

    setLoading(true); // start spinner
    try {
      const response = await resetPassword(password, token);
      if (response.status === 200) {
        toast.success(response.data);
        navigate("/login");
      }
    } catch (e) {
      toast.error(e.response?.data || "Reset failed");
      navigate("/forgot-password");
    } finally {
      setLoading(false); // stop spinner
    }
  }

  return (
    <section className="vh-100" style={{ backgroundColor: "#9A616D" }}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-md-10 col-lg-8 col-xl-6">
            <div className="card shadow" style={{ borderRadius: "1rem" }}>
              <div className="card-body p-4 p-lg-5 text-black">
                <form onSubmit={submitHandler}>
                  {/* Logo + Name */}
                  <div className="text-center mb-5">
                    <img
                      src={assets.logo}
                      height={48}
                      width={48}
                      className="me-2"
                      alt="logo"
                    />
                    <h3 className="fw-bold mb-0" style={{ color: "blue" }}>
                      {title}
                    </h3>
                  </div>

                  {/* New Password */}
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label"
                      style={{ color: "blue" }}
                    >
                      Enter New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control form-control-md"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label
                      htmlFor="confirm_password"
                      className="form-label"
                      style={{ color: "blue" }}
                    >
                      Re-type Password
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      className="form-control form-control-md"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1 mb-3 d-flex justify-content-center">
                    <button
                      className="btn btn-primary btn-lg w-50"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;
