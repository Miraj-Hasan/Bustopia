import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { sendResetEmail } from "../../Api/ApiCalls";
import assets from "../../assets/assets";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // ⬅️ loading state
  const title = import.meta.env.VITE_COMPANY_TITLE;

  async function submitHandler(e) {
    e.preventDefault();
    setLoading(true); // start spinner
    try {
      const response = await sendResetEmail(email);
      if (response.status === 200) {
        toast.success("Password Reset Link sent to " + email);
      }
    } catch (e) {
      toast.error(e.response?.data || "Something went wrong");
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
                  <div className="text-center ">
                    <img
                      src={assets.logo}
                      height={200}
                      width={200}
                      className="me-2"
                      alt="logo"
                    />
                    
                  </div>

                  {/* Email */}
                  <div className="row mb-4">
                    <div className="mb-2">
                      <label
                        htmlFor="email"
                        className="form-label"
                        style={{ color: "blue" }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control form-control-md"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
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
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </div>

                  {/* Back to login */}
                  <p
                    className="mb-2 pb-lg-2 text-center mt-2"
                    style={{ color: "#393f81" }}
                  >
                    Go back to{" "}
                    <Link to="/login" style={{ color: "#393f81" }}>
                      Login
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;
