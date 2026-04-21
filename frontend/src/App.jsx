import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Auth/Login";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import ProductList from "./pages/Admin/DataMaster/ProductList";
import CategoryList from "./pages/Admin/DataMaster/CategoryList";
import UserList from "./pages/Admin/DataMaster/UserList";
import OutletList from "./pages/Admin/DataMaster/OutletList";
import ManajemenStok from "./pages/Admin/ManajemenStok";
import ProtectedRoute from "./component/ProtectedRoute";
import NotFound from "./pages/NotFound";
import DashboardKasir from "./pages/Kasir/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/not-found" element={<NotFound />} />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />

          {/* Data Master Routes */}
          <Route path="data-master">
            <Route path="produk" element={<ProductList />} />
            <Route path="kategori" element={<CategoryList />} />
            <Route path="pengguna" element={<UserList />} />
            <Route path="outlet" element={<OutletList />} />
            <Route
              index
              element={<Navigate to="/admin/data-master/produk" replace />}
            />
          </Route>

          {/* Manajemen Stok */}
          <Route path="manajemen-stok" element={<ManajemenStok />} />

          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Kasir Routes - Protected */}
        <Route
          path="/kasir"
          element={
            <ProtectedRoute allowedRoles={["kasir"]}>
              {/* <KasirLayout /> */}
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardKasir />} />
          <Route index element={<Navigate to="/kasir/dashboard" replace />} />
        </Route>

        {/* Catch all unmapped routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
