import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] p-4 text-center">
      <div className="w-24 h-24 text-pink-500 mb-6 bg-pink-100 p-5 rounded-full flex items-center justify-center">
        <AlertCircle className="w-full h-full" strokeWidth={1.5} />
      </div>
      
      <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">
        Halaman Tidak Ditemukan / Akses Ditolak
      </h2>
      
      <p className="text-gray-500 max-w-sm mb-8">
        Maaf, Anda mencoba mengakses rute yang tidak ada atau Anda tidak memiliki izin (hak akses) untuk melihat halaman ini.
      </p>

      <div className="flex gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        
        <Link 
          to="/login"
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors shadow-md"
        >
          <Home size={18} />
          Menu Utama
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
