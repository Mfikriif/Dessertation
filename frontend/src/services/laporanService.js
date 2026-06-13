import API from "../config/api";
import { withPolling } from "./pollingService";

export const laporanService = {
  // OLD APIs (kept for backward compatibility)
  getLaporanHarian: async (params = {}) => {
    return await API.get("/laporan/harian", { params });
  },

  getTopProdukHarian: async (params = {}) => {
    return await API.get("/laporan/top-produk", { params });
  },

  getAllTransaksi: async (params = {}) => {
    return await API.get("/transaksi", { params });
  },

  // Laporan bulanan (ringkasan + riwayat dengan detail_pembelian) — bulan & tahun only
  getLaporanBulanan: async (bulan, tahun, params = {}) => {
    return await API.get(`/laporan/bulanan/${bulan}/${tahun}`, { params });
  },

  // Detail bulanan (per-day breakdown for chart) — bulan & tahun only
  getDetailBulanan: async (bulan, tahun, params = {}) => {
    return await API.get(`/laporan/bulanan-detail/${bulan}/${tahun}`, { params });
  },

  // Detail bulanan per outlet (ringkasan + grafik + riwayat dengan detail_pembelian) — bulan, tahun, outlet
  getDetailBulananOutlet: async (bulan, tahun, idOutlet, params = {}) => {
    return await API.get(
      `/laporan/bulanan-detail/outlet/${bulan}/${tahun}/${idOutlet}`,
      { params },
    );
  },

  // Laporan tahunan (ringkasan + 3 top outlet)
  getLaporanTahunan: async (tahun, params = {}) => {
    return await API.get(`/laporan/tahunan/${tahun}`, { params });
  },

  // Detail tahunan (per-month breakdown for chart)
  getDetailTahunan: async (tahun) => {
    return await API.get(`/laporan/tahunan-detail/${tahun}`);
  },

  // Detail tahunan per outlet (per-month breakdown for chart with outlet)
  getDetailTahunanOutlet: async (tahun, idOutlet, params = {}) => {
    return await API.get(
      `/laporan/tahunan-detail/outlet/${tahun}/${idOutlet}`,
      { params },
    );
  },

  // Export Excel Laporan Bulanan
  exportLaporanBulanan: async (bulan, tahun, idOutlet = null, params = {}) => {
    let url = `/laporan/export-laporan/bulanan/${bulan}/${tahun}`;
    if (idOutlet) url += `/${idOutlet}`;
    return await API.get(url, { responseType: "blob", params });
  },

  // Export Excel Laporan Tahunan
  exportLaporanTahunan: async (tahun, idOutlet = null) => {
    let url = `/laporan/export-laporan/tahunan/${tahun}`;
    if (idOutlet) url += `/${idOutlet}`;
    return await API.get(url, { responseType: "blob" });
  },
};

// Menambahkan metode polling dengan interval 5 detik untuk GET data laporan
laporanService.pollLaporanHarian = withPolling(laporanService.getLaporanHarian, 5000);
laporanService.pollTopProdukHarian = withPolling(laporanService.getTopProdukHarian, 5000);
laporanService.pollAllTransaksi = withPolling(laporanService.getAllTransaksi, 5000);
laporanService.pollLaporanBulanan = withPolling(laporanService.getLaporanBulanan, 5000);
laporanService.pollDetailBulanan = withPolling(laporanService.getDetailBulanan, 5000);
laporanService.pollDetailBulananOutlet = withPolling(laporanService.getDetailBulananOutlet, 5000);
laporanService.pollLaporanTahunan = withPolling(laporanService.getLaporanTahunan, 5000);
laporanService.pollDetailTahunan = withPolling(laporanService.getDetailTahunan, 5000);
laporanService.pollDetailTahunanOutlet = withPolling(laporanService.getDetailTahunanOutlet, 5000);
