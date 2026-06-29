import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
  children,
  roles = [],
}) {
  const {
    loading,
    isAuthenticated,
    user,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    roles.length > 0 &&
    !roles.includes(user.role)
  ) {
    if (user.role === "ADMIN") {
      return (
        <Navigate
          to="/"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/resident"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;