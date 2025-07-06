import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  try {
    const storedUser = sessionStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  } catch (error) {
    // Handle JSON parsing errors or sessionStorage issues
    return <Navigate to="/login" replace />;
  }
}
