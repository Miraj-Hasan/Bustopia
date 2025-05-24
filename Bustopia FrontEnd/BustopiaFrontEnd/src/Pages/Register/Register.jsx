import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import assets from "../../assets/assets";
import { register } from "../../api/ApiCalls";

function Register() {
  const title = import.meta.env.VITE_COMPANY_TITLE;
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
  });

  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0] || null);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("user", JSON.stringify(userData));
      
      formData.append(
        "file",
        imageFile ?? new Blob([], { type: "application/octet-stream" })
      );


      const response = await register(formData);
      if (response.status === 200) {
        toast.success("Please Verify Your Email!");
        navigate("/login");
      }
    } catch (e) {
      toast.error(e.response?.data || "Registration failed");
    }
  };

  return (
    <section className="vh-100" style={{ backgroundColor: "#9A616D" }}>
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-md-10 col-lg-8 col-xl-6">
            <div className="card shadow" style={{ borderRadius: "1rem" }}>
              <div className="card-body p-4 p-lg-5 text-black">
                <form onSubmit={submitHandler}>
                  {/* Logo + Title */}
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

                  {/* Name */}
                  <div className="form-outline mb-4">
                    <label
                      htmlFor="name"
                      className="form-label"
                      style={{ color: "blue" }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control form-control-md"
                      placeholder="John Doe"
                      value={userData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email + Phone */}
                  <div className="row mb-4">
                    <div className="col-md-6">
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
                        value={userData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label
                        htmlFor="phone"
                        className="form-label"
                        style={{ color: "blue" }}
                      >
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-control form-control-md"
                        placeholder="+880 123 456 789"
                        value={userData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="form-outline mb-4">
                    <label
                      htmlFor="password"
                      className="form-label"
                      style={{ color: "blue" }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control form-control-md"
                      placeholder="*****"
                      value={userData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div className="form-outline mb-4">
                    <label
                      htmlFor="gender"
                      className="form-label"
                      style={{ color: "blue" }}
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="form-select"
                      value={userData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select your gender
                      </option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Optional Profile Image */}
                  <div className="form-outline mb-4">
                    <label
                      htmlFor="file"
                      className="form-label"
                      style={{ color: "blue" }}
                    >
                      Profile Image (optional)
                    </label>
                    <input
                      type="file"
                      id="file"
                      name="file"
                      accept="image/*"
                      className="form-control"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1 mb-3 d-flex justify-content-center">
                    <button
                      className="btn btn-primary btn-lg w-50"
                      type="submit"
                    >
                      Register
                    </button>
                  </div>

                  {/* Link to Login */}
                  <div className="text-center">
                    <p className="mb-0" style={{ color: "blue" }}>
                      Already have an account?{" "}
                      <Link to="/login">Login here</Link>
                    </p>
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

export default Register;
