import React, { useEffect, useState } from "react";

import {
  Navigate,
  Outlet
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { toast } from "react-toastify";

export default function ProtectedRoute({
  roles = [],
  children
}) {

  const { user, token } = useAuth();

  const [loading, setLoading] =
    useState(true);

  const [redirectPath, setRedirectPath] =
    useState(null);

  useEffect(() => {

    if (!token) {

      toast.warning(
        "Please login to access the dashboard page"
      );

      setRedirectPath("/login");

    } else if (
      roles.length > 0 &&
      !roles.includes(user?.role)
    ) {

      toast.error(
        "You are not authorized to access this page"
      );

      setRedirectPath("/");

    }

    setLoading(false);

  }, [token, user, roles]);

  // Loading State
  if (loading) {

    return (
      <div className="min-h-screen flex justify-center items-center">

        <div className="text-lg font-semibold text-gray-600">
          Loading...
        </div>

      </div>
    );
  }

  // Redirect
  if (redirectPath) {

    return (
      <Navigate
        to={redirectPath}
        replace
      />
    );
  }

  // Render Protected Content
  return children
    ? children
    : <Outlet />;
}