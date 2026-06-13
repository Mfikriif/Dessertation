import React, { useState, useEffect } from "react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

const TableSection = ({
  selectedOutlet,
  namaOutlet,
  topOutlets,
  chartDetail,
  currentData,
  pengeluaranList = [],
  currentPage,
  totalPages,
  totalItems,
  handlePageChange,
  handleLihatDetail,
  isLoading,
  ITEMS_PER_PAGE,
  formatCurrency,
  formatWaktu,
  getMetodeBadgeClass,
  periodeLabel,
}) => {
  const [activeTab, setActiveTab] = useState("transaksi");

  // Tab transaksi/pengeluaran hanya tampil saat tidak filter per outlet
  const showTabs = !selectedOutlet;

  // Reset tab ke transaksi jika showTabs berubah menjadi false
  useEffect(() => {
    if (!showTabs) {
      setActiveTab("transaksi");
    }
  }, [showTabs]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {activeTab === "transaksi" ? "Riwayat Transaksi" : "Riwayat Pengeluaran"}
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">
            {activeTab === "transaksi"
              ? `Daftar transaksi periode ${periodeLabel}${namaOutlet ? ` — ${namaOutlet}` : ""}`
              : `Daftar pengeluaran periode ${periodeLabel}${namaOutlet ? ` — ${namaOutlet}` : ""}`}
          </p>
        </div>
        {showTabs && (
          <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("transaksi")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "transaksi"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Transaksi
            </button>
            <button
              onClick={() => setActiveTab("pengeluaran")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "pengeluaran"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Pengeluaran
            </button>
          </div>
        )}
      </div>

      {activeTab === "transaksi" ? (
        <>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 border-b border-gray-50">No</th>
                  <th className="px-6 py-4 border-b border-gray-50">Waktu</th>
                  <th className="px-6 py-4 border-b border-gray-50">ID Transaksi</th>
                  <th className="px-6 py-4 border-b border-gray-50">Metode Pembayaran</th>
                  <th className="px-6 py-4 border-b border-gray-50">Total Harga</th>
                  <th className="px-6 py-4 border-b border-gray-50 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => {
                  const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                  return (
                    <tr
                      key={item.id_transaksi}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-500">{globalIndex}.</td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-xs">
                        {formatWaktu(item.waktu_transaksi)}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-gray-900 text-xs tracking-wide">
                        {item.id_transaksi?.toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border ${getMetodeBadgeClass(item.metode_bayar)}`}
                        >
                          {item.metode_bayar?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-xs">
                        {formatCurrency(item.total_harga)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleLihatDetail(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-black border border-gray-200 hover:border-gray-300 rounded-lg transition-colors text-xs font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Lihat Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {currentData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {isLoading
                        ? "Memuat data transaksi..."
                        : "Tidak ada transaksi pada periode ini."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-bold text-gray-500 tracking-wider">
                MENAMPILKAN {currentData.length} DARI {totalItems} TRANSAKSI
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (pageNum) =>
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1),
                  )
                  .map((pageNum, index, array) => (
                    <div key={pageNum} className="flex items-center gap-1">
                      {index > 0 && array[index - 1] !== pageNum - 1 && (
                        <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-black text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    </div>
                  ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                  className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        // Tabel Pengeluaran
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 border-b border-gray-50">No</th>
                <th className="px-6 py-4 border-b border-gray-50">Tanggal</th>
                <th className="px-6 py-4 border-b border-gray-50">Deskripsi</th>
                <th className="px-6 py-4 border-b border-gray-50">Dicatat Oleh</th>
                <th className="px-6 py-4 border-b border-gray-50">Biaya</th>
              </tr>
            </thead>
            <tbody>
              {pengeluaranList.map((item, index) => (
                <tr
                  key={item.id_pengeluaran}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-500">{index + 1}.</td>
                  <td className="px-6 py-4 text-gray-600 font-medium text-xs">{item.tanggal}</td>
                  <td className="px-6 py-4 text-gray-900 font-semibold text-xs tracking-wide">
                    {item.deskripsi || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">{item.nama_pengguna || "-"}</td>
                  <td className="px-6 py-4 text-red-600 font-bold text-xs">
                    {formatCurrency(item.biaya)}
                  </td>
                </tr>
              ))}
              {pengeluaranList.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {isLoading
                      ? "Memuat data pengeluaran..."
                      : "Tidak ada pengeluaran pada periode ini."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TableSection;
