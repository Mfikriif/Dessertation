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
    pengeluaranList,
    chartDetail,
    namaOutlet,
    topOutlets,
    paginasi,
    isLoading,
    fetchLaporanBulanan,
    fetchLaporanBulananOutlet,
    fetchLaporanTahunan,
    fetchLaporanTahunanOutlet,
    exportExcel,
  } = useLaporan();
  const { dataLabaRugi, isLoading: isLabaRugiLoading, fetchLabaRugi } = useLabaRugi();
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

  // Server-side pagination
  const ITEMS_PER_PAGE = 7;

  // Fetch data on mount
  useEffect(() => {
    handleLihatLaporan();
  }, []);

  const handleLihatLaporan = (page = 1) => {
    if (selectedBulan === "") {
      // Tahunan
      if (selectedOutlet) {
        fetchLaporanTahunanOutlet(selectedTahun, selectedOutlet);
      } else {
        fetchLaporanTahunan(selectedTahun);
      }
    } else {
      // Bulanan
      if (selectedOutlet) {
        fetchLaporanBulananOutlet(
          selectedBulan,
          selectedTahun,
          selectedOutlet,
          page,
          ITEMS_PER_PAGE,
        );
      } else {
        fetchLaporanBulanan(selectedBulan, selectedTahun, page, ITEMS_PER_PAGE);
      }
    }

    // Fetch Laba Rugi Data
    const outletFilter = selectedOutlet === "" ? "all" : selectedOutlet;
    const bulanFilter = selectedBulan === "" ? "all" : selectedBulan;
    fetchLabaRugi(bulanFilter, selectedTahun, outletFilter);
  };

  const handleExportExcel = () => {
    exportExcel(selectedBulan, selectedTahun, selectedOutlet);
  };

  // Server-side pagination: pindah halaman = fetch ulang dari API
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

  const chartData = useMemo(() => {
    if (!chartDetail || chartDetail.length === 0) {
      return {
        labels: [],
        values: [],
        subtitle: `Tidak ada data untuk periode yang dipilih`,
      };
    }

    let labels = [];
    let values = [];

    if (selectedBulan === "") {
      const monthMap = {
        1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "Mei", 6: "Jun",
        7: "Jul", 8: "Agu", 9: "Sep", 10: "Okt", 11: "Nov", 12: "Des"
      };
      labels = chartDetail.map((item) => monthMap[item.bulan] || item.bulan);
      values = chartDetail.map((item) => parseFloat(item.total_pendapatan) || 0);
    } else {
      labels = chartDetail.map((item) => {
        const d = new Date(item.tanggal_transaksi);
        return String(d.getDate());
      });
      values = chartDetail.map(
        (item) => parseFloat(item.total_pendapatan) || 0,
      );
    }

    const outletLabel = namaOutlet ? ` - ${namaOutlet}` : " - Semua Outlet";
    const periodeLabel = selectedBulan === "" ? `Tahun ${selectedTahun}` : `${selectedBulan}/${selectedTahun}`;

    return {
      labels,
      values,
      subtitle: `Data periode ${periodeLabel}${outletLabel}`,
    };
  }, [chartDetail, selectedBulan, selectedTahun, namaOutlet]);

  const maxChartValue = Math.max(...(chartData.values.length > 0 ? chartData.values : [1]), 1);

  // Server-side pagination values
  const currentPage = paginasi.halaman_saat_ini;
  const totalPages = paginasi.total_halaman;
  const totalItems = paginasi.total_riwayat;
  const currentData = riwayatList;

  // Helpers
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

  const selectedBulanLabel = selectedBulan === "" 
    ? "" 
    : (BULAN_LIST.find((b) => b.value === selectedBulan)?.label || selectedBulan);

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
        selectedBulan={selectedBulan}
        setSelectedBulan={setSelectedBulan}
        selectedTahun={selectedTahun}
        setSelectedTahun={setSelectedTahun}
        selectedOutlet={selectedOutlet}
        setSelectedOutlet={setSelectedOutlet}
        handleLihatLaporan={handleLihatLaporan}
        isLoading={isLoading}
        outlet={outlet}
        BULAN_LIST={BULAN_LIST}
        yearOptions={yearOptions}
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
          selectedBulan={selectedBulan}
          selectedOutlet={selectedOutlet}
          selectedTahun={selectedTahun}
          topOutlets={topOutlets}
          namaOutlet={namaOutlet}
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
          selectedBulanLabel={selectedBulanLabel}
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
