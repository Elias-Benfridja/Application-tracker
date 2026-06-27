import type React from "react";
import { Navigate } from "react-router-dom";
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const access_token = localStorage.getItem("access_token");
  if (access_token) {
    return <>{children}</>;
  }
  return <Navigate to="/login" />;
}
export default ProtectedRoute;