import {
  Filter,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProduk } from "../../../hooks/useProduk";

const ProductList = () => {
  const { produk } = useProduk();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Data Master
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola Data Master Produk, Kategori, Pengguna, Outlet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            FILTER
          </button>
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 font-medium text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            TAMBAH PRODUK
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">NO</th>
                <th className="px-6 py-4 font-medium tracking-wider">NAMA</th>
                <th className="px-6 py-4 font-medium tracking-wider">
                  KATEGORI
                </th>
                <th className="px-6 py-4 font-medium tracking-wider">
                  DESKRIPSI
                </th>
                <th className="px-6 py-4 font-medium tracking-wider">HARGA</th>
                <th className="px-6 py-4 font-medium tracking-wider text-center">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(produk) ? (
                produk.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-500">{index + 1}.</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.nama_produk}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center text-xs font-medium text-gray-600">
                        {item.nama_kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.deskripsi}</td>
                    <td className="px-6 py-4">{item.harga}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md border border-gray-200 hover:border-transparent transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md border border-gray-200 hover:border-transparent transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-gray-500 tracking-wider">
            MENAMPILKAN 7 DARI 50 PRODUK
          </span>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-black text-white text-xs font-medium">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 text-xs font-medium transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 text-xs font-medium transition-colors">
              3
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">
              ...
            </span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 text-xs font-medium transition-colors">
              32
            </button>
            <button className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
