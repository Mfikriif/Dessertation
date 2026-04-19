import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import ProductList from "./pages/Admin/DataMaster/ProductList";
import CategoryList from "./pages/Admin/DataMaster/CategoryList";
import UserList from "./pages/Admin/DataMaster/UserList";
import OutletList from "./pages/Admin/DataMaster/OutletList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Data Master Routes */}
          <Route path="data-master">
            <Route path="produk" element={<ProductList />} />
            <Route path="kategori" element={<CategoryList />} />
            <Route path="pengguna" element={<UserList />} />
            <Route path="outlet" element={<OutletList />} />
            <Route index element={<Navigate to="/admin/data-master/produk" replace />} />
          </Route>

          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
