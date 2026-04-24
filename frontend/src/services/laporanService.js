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

  getTransaksiById: async (id) => {
    return await API.get(`/transaksi/${id}`);
  },

  // NEW APIs
  // Laporan bulanan (ringkasan + riwayat) — bulan & tahun only
  getLaporanBulanan: async (bulan, tahun, params = {}) => {
    return await API.get(`/laporan/bulanan/${bulan}/${tahun}`, { params });
  },

  // Detail bulanan (per-day breakdown for chart) — bulan & tahun only
  getDetailBulanan: async (bulan, tahun) => {
    return await API.get(`/laporan/bulanan-detail/${bulan}/${tahun}`);
  },

  // Detail bulanan per outlet (ringkasan + grafik + riwayat) — bulan, tahun, outlet
  getDetailBulananOutlet: async (bulan, tahun, idOutlet, params = {}) => {
    return await API.get(
      `/laporan/bulanan-detail/outlet/${bulan}/${tahun}/${idOutlet}`,
      { params },
    );
  },
};
