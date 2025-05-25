import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import assets from "../../assets/assets";
import { UserContext } from "../../Context/UserContext";

export default function OAuthSuccess() {
    const navigate = useNavigate();

    const backendURL = import.meta.env.VITE_API_BASE_URL;

    const {setUser} = useContext(UserContext);

    async function getUser() {
      try {
        const res = await axios.get(`${backendURL}/api/me`, {
          withCredentials: true, 
        });
        setUser(res.data);
        sessionStorage.setItem("user", JSON.stringify(res.data));
        navigate("/");
      } catch (err) {
        navigate("/login");
        console.log(err);
      }
    }

    useEffect(() => {
    const timer = setTimeout(() => {
            getUser();
        }, 300); 
        return () => clearTimeout(timer);
    }, []);

    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
        <div className="text-center">
          <img
            src={assets.logo} // optional logo
            alt="EchoRoom Logo"
            style={{ width: "100px", marginBottom: "20px" }}
          />

          <h2 className="fw-bold mb-3 text-primary">Logging you in...</h2>

          <Spinner animation="border" variant="primary" role="status" />

          <p className="text-muted mt-3">
            Please wait while we set up your profile.
          </p>
        </div>
      </div>
    );
}
