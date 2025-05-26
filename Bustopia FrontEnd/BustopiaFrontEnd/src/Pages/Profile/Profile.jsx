import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { Navbar } from "../../Components/Navbar/Navbar";
import defaultProfileImage from "../../assets/default_profile.png";
import { toast } from "react-toastify";
import { updateProfileInfo } from "../../api/ApiCalls";

export function Profile() {
  const { user, setUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    gender: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false); // 🔄 spinner loading state

  useEffect(() => {
    if (user?.email) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
      });
    }
  }, [user]);

  useEffect(() => {
    //console.log(user)
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();

      const { email, ...sanitizedData } = formData;
      form.append("user", JSON.stringify(sanitizedData));

      if (imageFile) {
        form.append("file", imageFile);
      }

      const res = await updateProfileInfo(form);
      if (res.status === 200) {
        toast.success("Profile updated successfully!");
        const updatedUser = res.data;
        setUser(updatedUser);
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        //setPreviewUrl(null);
      }
    } catch (e) {
      toast.error("Profile update failed.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const effectiveImage = previewUrl || user?.image || defaultProfileImage;

return (
  <div className="d-flex">
    {/* Sidebar */}
    <div style={{ width: "250px" }}>
      <Navbar />
    </div>

    {/* Main content area with light gray background */}
    <div
      className="flex-grow-1 d-flex justify-content-center align-items-center bg-light"
      style={{ minHeight: "100vh" }}
    >
      <div className="col-md-6">
        <div className="card shadow rounded-4 border-4 bg-light">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="text-center mb-3">
                <img
                  src={effectiveImage}
                  alt="Profile"
                  className="rounded-circle"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div className="mb-4 text-center">
                <input
                  type="file"
                  className="form-control border-secondary"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-primary">Full Name</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-control border-secondary"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-primary">
                  Email (readonly)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="form-control border-secondary"
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-primary">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control border-secondary"
                  placeholder="+880..."
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-primary">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="text-center">
                <button
                  className="btn btn-primary px-5"
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
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}
