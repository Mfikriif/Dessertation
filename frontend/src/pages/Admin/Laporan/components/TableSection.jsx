import React from "react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

const TableSection = ({
  selectedBulan,
  selectedOutlet,
  selectedTahun,
  topOutlets,
  namaOutlet,
  chartDetail,
  currentData,
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
  selectedBulanLabel,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {selectedBulan === "" ? (
        !selectedOutlet ? (
          // Table for Top 3 Outlets (Tahunan, Semua Outlet)
          <>
            <div className="p-6 border-b border-gray-50 bg-white">
              <h2 className="text-lg font-bold text-gray-900">Top 3 Outlet</h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Outlet dengan pendapatan tertinggi pada tahun {selectedTahun}
              </p>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 border-b border-gray-50">Peringkat</th>
                    <th className="px-6 py-4 border-b border-gray-50">Nama Outlet</th>
                    <th className="px-6 py-4 border-b border-gray-50">Total Transaksi</th>
                    <th className="px-6 py-4 border-b border-gray-50">Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {topOutlets.length > 0 ? (
                    topOutlets.slice(0, 3).map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-500 font-bold">#{index + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{item.nama_outlet}</td>
                        <td className="px-6 py-4 text-gray-600">{item.jumlah_transaksi}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {formatCurrency(item.total_pendapatan)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        {isLoading
                          ? "Memuat data outlet..."
                          : "Tidak ada data outlet untuk tahun ini."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          // Table for Monthly Data (Tahunan, Per Outlet)
          <>
            <div className="p-6 border-b border-gray-50 bg-white">
              <h2 className="text-lg font-bold text-gray-900">Ringkasan Bulanan</h2>
              <p className="text-[13px] text-gray-500 mt-1">
                Ringkasan transaksi per bulan tahun {selectedTahun}
                {namaOutlet ? ` — ${namaOutlet}` : ""}
              </p>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 border-b border-gray-50">Bulan</th>
                    <th className="px-6 py-4 border-b border-gray-50">Total Transaksi</th>
                    <th className="px-6 py-4 border-b border-gray-50">Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {chartDetail.length > 0 ? (
                    chartDetail.map((item, index) => {
                      const monthMap = {
                        1: "Januari", 2: "Februari", 3: "Maret", 4: "April", 5: "Mei", 6: "Juni",
                        7: "Juli", 8: "Agustus", 9: "September", 10: "Oktober", 11: "November", 12: "Desember"
                      };
                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {monthMap[item.bulan] || item.bulan}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{item.jumlah_transaksi}</td>
                          <td className="px-6 py-4 text-gray-600 font-medium">
                            {formatCurrency(item.total_pendapatan)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                        {isLoading
                          ? "Memuat data bulanan..."
                          : "Tidak ada data bulanan untuk tahun ini."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : (
        // Transaction Table (Bulanan)
        <>
          <div className="p-6 border-b border-gray-50 bg-white">
            <h2 className="text-lg font-bold text-gray-900">Riwayat Transaksi</h2>
            <p className="text-[13px] text-gray-500 mt-1">
              Daftar transaksi periode {selectedBulanLabel} {selectedTahun}
              {namaOutlet ? ` — ${namaOutlet}` : ""}
            </p>
          </div>

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
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border ${getMetodeBadgeClass(
                            item.metode_bayar
                          )}`}
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
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
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
      )}
    </div>
  );
};

export default TableSection;
