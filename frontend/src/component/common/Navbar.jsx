import React from 'react';
import { Search } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="h-20 border-b border-gray-200 bg-white/50 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      
      {/* Search Bar */}
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-transparent border-none text-gray-900 text-sm rounded-lg focus:ring-0 block w-full pl-10 p-2.5 placeholder-gray-400 outline-none"
          placeholder="Pencarian..."
        />
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 leading-none">ADMIN PUSAT</p>
          <p className="text-xs text-gray-500 mt-1">Superadmin</p>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
          alt="Admin Profile" 
          className="w-10 h-10 rounded-full border border-gray-200 object-cover"
        />
      </div>
    </div>
  );
};

export default Navbar;
