import API from "../config/api";

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
  getDetailBulanan: async (bulan, tahun) => {
    return await API.get(`/laporan/bulanan-detail/${bulan}/${tahun}`);
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
  exportLaporanBulanan: async (bulan, tahun, idOutlet = null) => {
    let url = `/laporan/export-laporan/bulanan/${bulan}/${tahun}`;
    if (idOutlet) url += `/${idOutlet}`;
    return await API.get(url, { responseType: "blob" });
  },

  // Export Excel Laporan Tahunan
  exportLaporanTahunan: async (tahun, idOutlet = null) => {
    let url = `/laporan/export-laporan/tahunan/${tahun}`;
    if (idOutlet) url += `/${idOutlet}`;
    return await API.get(url, { responseType: "blob" });
  },
};
