import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  Package,
  ClipboardList,
  FileText,
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { authService } from "../../services/authService";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track open state of dropdown menus
  const [openMenus, setOpenMenus] = useState({
    "Data Master": location.pathname.includes("/admin/data-master")
  });

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { 
      name: "Data Master", 
      icon: Database, 
      path: "/admin/data-master",
      subItems: [
        { name: "Produk", path: "/admin/data-master/produk" },
        { name: "Kategori", path: "/admin/data-master/kategori" },
        { name: "Pengguna", path: "/admin/data-master/pengguna" },
        { name: "Outlet", path: "/admin/data-master/outlet" },
      ]
    },
    { name: "Manajemen Stok", icon: Package, path: "/admin/manajemen-stok" },
    {
      name: "Catatan Operasional",
      icon: ClipboardList,
      path: "/admin/catatan-operasional",
    },
    { name: "Laporan", icon: FileText, path: "/admin/laporan" },
  ];

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Dessertation<span className="text-orange-500">.</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
          Admin Outlet System
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <div className="flex flex-col mb-1">
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                    location.pathname.includes(item.path)
                      ? "bg-white text-gray-900 font-semibold shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {openMenus[item.name] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* Submenus */}
                {openMenus[item.name] && (
                  <div className="flex flex-col pl-11 pr-2 mt-1.5 space-y-1">
                    {item.subItems.map((sub) => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        className={({ isActive }) =>
                          `text-sm py-2 px-3 rounded-md transition-colors ${
                            isActive
                              ? "text-gray-900 font-medium bg-gray-50"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          }`
                        }
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white text-gray-900 font-semibold shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full text-gray-400 hover:text-gray-600 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 rotate-180" />
          <span className="text-sm font-medium">Keluar Sistem</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
