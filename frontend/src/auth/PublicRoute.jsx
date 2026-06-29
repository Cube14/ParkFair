import { Navigate } from "react-router-dom";

import { useAuth }
from "../context/AuthContext";

function PublicRoute({
  children,
}) {
  const {
    loading,
    isAuthenticated,
  } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/resident"
        replace
      />
    );
  }

  return children;
}

export default PublicRoute;