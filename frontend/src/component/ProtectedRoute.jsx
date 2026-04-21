import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  
  if (!token || !userStr) {
    // Belum login, lempar ke halaman login
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Periksa jika role spesifik diwajibkan namun role user saat ini tidak cocok
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/not-found" replace />;
    }
  } catch (error) {
    // Jika penyimpanan lokal rusak, paksa login ulang
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // Jika aman, render child routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
