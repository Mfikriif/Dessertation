import React, { useState, useEffect, useMemo } from "react";
import { useLaporan } from "../../../hooks/useLaporan";
import { useOutlet } from "../../../hooks/useOutlet";
import DetailTransaksiModal from "../../../component/modals/DetailTransaksiModal";
import FilterSection from "./components/FilterSection";
import ChartSection from "./components/ChartSection";
import TableSection from "./components/TableSection";
import LabaRugiCards from "./components/LabaRugiCards";
import LabaRugiTable from "./components/LabaRugiTable";
import { useLabaRugi } from "../../../hooks/useLabaRugi";

const Laporan = () => {
  const {
    ringkasan,
    riwayatList,
    pengeluaranList,
    chartDetail,
    namaOutlet,
    topOutlets,
    paginasi,
    isLoading,
    fetchLaporanBulanan,
    fetchLaporanBulananOutlet,
    exportExcel,
  } = useLaporan();
  const {
    dataLabaRugi,
    isLoading: isLabaRugiLoading,
    fetchLabaRugi,
  } = useLabaRugi();
  const { outlet } = useOutlet();

  const now = new Date();
  const currentYear = String(now.getFullYear());
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

  // Filter state — berbasis tanggal kalender
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Detail modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  // Server-side pagination
  const ITEMS_PER_PAGE = 7;

  // Derive bulan & tahun dari startDate (atau default bulan ini)
  const getDerivedPeriode = (sd) => {
    const d = sd ? new Date(sd) : now;
    const bulan = String(d.getMonth() + 1).padStart(2, "0");
    const tahun = String(d.getFullYear());
    return { bulan, tahun };
  };

  // Fetch data on mount (default: bulan ini)
  useEffect(() => {
    const { bulan, tahun } = getDerivedPeriode("");
    fetchLaporanBulanan(bulan, tahun, 1, ITEMS_PER_PAGE, "", "");
    fetchLabaRugi(bulan, tahun, "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLihatLaporan = (page = 1) => {
    const { bulan, tahun } = getDerivedPeriode(startDate);
    const outletFilter = selectedOutlet === "" ? "all" : selectedOutlet;

    if (selectedOutlet) {
      fetchLaporanBulananOutlet(
        bulan,
        tahun,
        selectedOutlet,
        page,
        ITEMS_PER_PAGE,
        startDate,
        endDate,
      );
    } else {
      fetchLaporanBulanan(bulan, tahun, page, ITEMS_PER_PAGE, startDate, endDate);
    }

    fetchLabaRugi(bulan, tahun, outletFilter, startDate || null, endDate || null);
  };

  const handleExportExcel = () => {
    const { bulan, tahun } = getDerivedPeriode(startDate);
    exportExcel(bulan, tahun, selectedOutlet, startDate, endDate);
  };

  // Pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > paginasi.total_halaman || isLoading) return;
    handleLihatLaporan(newPage);
  };

  const handleLihatDetail = (transaksi) => {
    setSelectedTransaksi({
      id_transaksi: transaksi.id_transaksi,
      tanggal: transaksi.waktu_transaksi,
      total_harga: transaksi.total_harga,
      metode_bayar: transaksi.metode_bayar,
      items: transaksi.detail_pembelian || [],
    });
    setIsDetailOpen(true);
  };

  // Chart
  const chartData = useMemo(() => {
    if (!chartDetail || chartDetail.length === 0) {
      return {
        labels: [],
        values: [],
        subtitle: "Tidak ada data untuk periode yang dipilih",
      };
    }

    const labels = chartDetail.map((item) => {
      if (item.tanggal_transaksi) {
        const d = new Date(item.tanggal_transaksi);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }
      if (item.bulan) {
        const monthMap = {
          1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "Mei", 6: "Jun",
          7: "Jul", 8: "Agu", 9: "Sep", 10: "Okt", 11: "Nov", 12: "Des",
        };
        return monthMap[item.bulan] || String(item.bulan);
      }
      return "";
    });

    const values = chartDetail.map((item) => parseFloat(item.total_pendapatan) || 0);

    const outletLabel = namaOutlet ? ` — ${namaOutlet}` : " — Semua Outlet";
    let periodeLabel;
    if (startDate && endDate) {
      periodeLabel = `${startDate} s.d. ${endDate}`;
    } else if (startDate) {
      periodeLabel = startDate;
    } else {
      const { bulan, tahun } = getDerivedPeriode("");
      periodeLabel = `${bulan}/${tahun}`;
    }

    return {
      labels,
      values,
      subtitle: `Data periode ${periodeLabel}${outletLabel}`,
    };
  }, [chartDetail, namaOutlet, startDate, endDate]);

  const maxChartValue = Math.max(
    ...(chartData.values.length > 0 ? chartData.values : [1]),
    1,
  );

  const currentPage = paginasi.halaman_saat_ini;
  const totalPages = paginasi.total_halaman;
  const totalItems = paginasi.total_riwayat;
  const currentData = riwayatList;

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "Rp 0";
    return `Rp ${num.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
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
      case "cash": return "bg-green-50 text-green-700 border-green-200";
      case "transfer": return "bg-blue-50 text-blue-700 border-blue-200";
      case "qris": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Label periode yang ditampilkan di tabel
  const periodeLabel = startDate && endDate
    ? `${startDate} s.d. ${endDate}`
    : startDate
    ? startDate
    : `${currentMonth}/${currentYear}`;

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

      <FilterSection
        selectedOutlet={selectedOutlet}
        setSelectedOutlet={setSelectedOutlet}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        handleLihatLaporan={handleLihatLaporan}
        isLoading={isLoading}
        outlet={outlet}
      />

      <LabaRugiCards
        dataLabaRugi={dataLabaRugi}
        isLoading={isLabaRugiLoading}
        outletFilter={selectedOutlet === "" ? "all" : selectedOutlet}
        ringkasan={ringkasan}
      />

      <ChartSection
        chartData={chartData}
        maxChartValue={maxChartValue}
        formatCurrency={formatCurrency}
        isLoading={isLoading}
        handleExportExcel={handleExportExcel}
      />

      <LabaRugiTable
        dataLabaRugi={dataLabaRugi}
        isLoading={isLabaRugiLoading}
      />

      <TableSection
        selectedOutlet={selectedOutlet}
        namaOutlet={namaOutlet}
        topOutlets={topOutlets}
        chartDetail={chartDetail}
        currentData={currentData}
        pengeluaranList={pengeluaranList}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        handlePageChange={handlePageChange}
        handleLihatDetail={handleLihatDetail}
        isLoading={isLoading}
        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        formatCurrency={formatCurrency}
        formatWaktu={formatWaktu}
        getMetodeBadgeClass={getMetodeBadgeClass}
        periodeLabel={periodeLabel}
      />

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
