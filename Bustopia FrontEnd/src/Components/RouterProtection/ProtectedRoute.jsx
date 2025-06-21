import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const storedUser = sessionStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
