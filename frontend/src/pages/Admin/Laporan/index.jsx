import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { useLaporan } from "../../../hooks/useLaporan";
import { useOutlet } from "../../../hooks/useOutlet";
import DetailTransaksiModal from "../../../component/modals/DetailTransaksiModal";

const BULAN_LIST = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const Laporan = () => {
  const {
    ringkasan,
    riwayatList,
    chartDetail,
    namaOutlet,
    isLoading,
    fetchLaporanBulanan,
    fetchLaporanBulananOutlet,
    fetchTransaksiById,
  } = useLaporan();
  const { outlet } = useOutlet();

  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentYear = String(now.getFullYear());

  // Filter state
  const [selectedBulan, setSelectedBulan] = useState(currentMonth);
  const [selectedTahun, setSelectedTahun] = useState(currentYear);
  const [selectedOutlet, setSelectedOutlet] = useState("");

  // Detail modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Fetch data on mount
  useEffect(() => {
    handleLihatLaporan();
  }, []);

  const handleLihatLaporan = () => {
    setCurrentPage(1);

    if (selectedOutlet) {
      // Bulan + Tahun + Outlet → use API bulanan-detail/outlet
      fetchLaporanBulananOutlet(
        selectedBulan,
        selectedTahun,
        selectedOutlet,
        1,
        100,
      );
    } else {
      // Bulan + Tahun only → use API bulanan + bulanan-detail
      fetchLaporanBulanan(selectedBulan, selectedTahun, 1, 100);
    }
  };

  const handleLihatDetail = async (transaksi) => {
    // Transaksi from API already includes items
    if (transaksi.items && transaksi.items.length > 0) {
      setSelectedTransaksi(transaksi);
      setIsDetailOpen(true);
    } else {
      const detail = await fetchTransaksiById(transaksi.id_transaksi);
      if (detail) {
        setSelectedTransaksi(detail);
        setIsDetailOpen(true);
      }
    }
  };

  // Build chart data from chartDetail
  // chartDetail is an array of { tanggal_transaksi, jumlah_transaksi, total_pendapatan }
  // one entry per day in the month
  const chartData = useMemo(() => {
    if (!chartDetail || chartDetail.length === 0) {
      return {
        labels: [],
        values: [],
        subtitle: `Tidak ada data untuk periode ${selectedBulan}/${selectedTahun}`,
      };
    }

    // Per-tanggal: show each day's revenue
    const labels = chartDetail.map((item) => {
      const d = new Date(item.tanggal_transaksi);
      return String(d.getDate());
    });
    const values = chartDetail.map(
      (item) => parseFloat(item.total_pendapatan) || 0,
    );

    const outletLabel = namaOutlet ? ` - ${namaOutlet}` : " - Semua Outlet";

    return {
      labels,
      values,
      subtitle: `Data periode ${selectedBulan}/${selectedTahun}${outletLabel}`,
    };
  }, [chartDetail, selectedBulan, selectedTahun, namaOutlet]);

  const maxChartValue = Math.max(...(chartData.values.length > 0 ? chartData.values : [1]), 1);

  // Pagination for transaction table
  const totalItems = riwayatList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const currentData = riwayatList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Helpers
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "RP 0";
    return `RP ${num.toLocaleString("id-ID")}`;
  };

  const formatWaktu = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes} WIB`;
  };

  const getMetodeBadgeClass = (metode) => {
    switch (metode?.toLowerCase()) {
      case "cash":
        return "bg-green-50 text-green-700 border-green-200";
      case "transfer":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "qris":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const yearOptions = [];
  for (let y = 2024; y <= parseInt(currentYear) + 1; y++) {
    yearOptions.push(String(y));
  }

  // Find selected month label for summary card
  const selectedBulanLabel =
    BULAN_LIST.find((b) => b.value === selectedBulan)?.label || selectedBulan;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          Ringkasan Laporan
          <br />
          Pendapatan
        </h1>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-2 leading-relaxed">
          Pantau performa pendapatan harian, mingguan,
          <br />
          dan analisis transaksi secara menyeluruh.
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Bulan */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
              Masukkan Bulan
            </label>
            <select
              className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm font-medium focus:border-black transition-colors bg-transparent cursor-pointer"
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
            >
              {BULAN_LIST.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
              Masukkan Tahun
            </label>
            <select
              className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm font-medium focus:border-black transition-colors bg-transparent cursor-pointer"
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Cabang / Outlet */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
              Masukkan Cabang
            </label>
            <select
              className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm font-medium focus:border-black transition-colors bg-transparent cursor-pointer"
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
            >
              <option value="">Semua Outlet</option>
              {Array.isArray(outlet) &&
                outlet.map((o) => (
                  <option key={o.id_outlet} value={o.id_outlet}>
                    {o.nama_outlet}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleLihatLaporan}
            disabled={isLoading}
            className="px-8 py-3 bg-black text-white font-bold tracking-wide text-xs rounded-lg transition-colors hover:bg-gray-800 disabled:bg-gray-500 min-w-[200px]"
          >
            {isLoading ? "MEMUAT..." : "Lihat Laporan"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
              Total Pendapatan {selectedBulanLabel} {selectedTahun}
            </p>
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(ringkasan.total_pendapatan)}
            </span>
          </div>
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
              Total Transaksi {selectedBulanLabel} {selectedTahun}
            </p>
            <span className="text-4xl font-bold text-gray-900">
              {String(ringkasan.total_transaksi).padStart(2, "0")}
            </span>
          </div>
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
            <Receipt className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Grafik Pendapatan
            </h2>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
              {chartData.subtitle}
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 self-start">
            <Download className="w-4 h-4" />
            Unduh Laporan
          </button>
        </div>

        {/* Bar Chart */}
        <div className="w-full overflow-x-auto">
          {chartData.values.length > 0 ? (
            <>
              <div
                className="flex items-end justify-between gap-1 min-w-[600px]"
                style={{ height: "280px" }}
              >
                {chartData.values.map((val, idx) => {
                  const heightPercent =
                    maxChartValue > 0 ? (val / maxChartValue) * 100 : 0;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full"
                    >
                      <div
                        className="w-full max-w-[24px] bg-gray-900 rounded-t-md transition-all duration-500 ease-out hover:bg-gray-700 cursor-pointer relative group"
                        style={{
                          height: `${Math.max(heightPercent, 2)}%`,
                          minHeight: "4px",
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {formatCurrency(val)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between mt-3 min-w-[600px]">
                {chartData.labels.map((label, idx) => (
                  <div
                    key={idx}
                    className="flex-1 text-center text-[9px] font-bold text-gray-500 tracking-wide"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center" style={{ height: "280px" }}>
              <p className="text-gray-400 text-sm">
                {isLoading ? "Memuat data grafik..." : "Tidak ada data untuk ditampilkan"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-white">
          <h2 className="text-lg font-bold text-gray-900">
            Riwayat Transaksi
          </h2>
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
                <th className="px-6 py-4 border-b border-gray-50">
                  ID Transaksi
                </th>
                <th className="px-6 py-4 border-b border-gray-50">
                  Metode Pembayaran
                </th>
                <th className="px-6 py-4 border-b border-gray-50">
                  Total Harga
                </th>
                <th className="px-6 py-4 border-b border-gray-50 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => {
                const globalIndex =
                  (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
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
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
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
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (pageNum) =>
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 &&
                      pageNum <= currentPage + 1),
                )
                .map((pageNum, index, array) => (
                  <div key={pageNum} className="flex items-center gap-1">
                    {index > 0 && array[index - 1] !== pageNum - 1 && (
                      <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => setCurrentPage(pageNum)}
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
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages),
                  )
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailTransaksiModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTransaksi(null);
        }}
        transaksi={selectedTransaksi}
      />
    </div>
  );
};

export default Laporan;
