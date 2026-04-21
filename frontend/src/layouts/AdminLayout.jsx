import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../component/common/Sidebar";
import Navbar from "../component/common/Navbar";

const AdminLayout = () => {
  return (
    <div className="flex bg-[#f3f4f6] min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
