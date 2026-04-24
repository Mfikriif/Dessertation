import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { laporanService } from "../services/laporanService";

export const useLaporan = () => {
  // Data for summary cards
  const [ringkasan, setRingkasan] = useState({
    total_transaksi: 0,
    total_pendapatan: 0,
  });

  // Data for transaction history table
  const [riwayatList, setRiwayatList] = useState([]);

  // Data for chart (daily breakdown)
  const [chartDetail, setChartDetail] = useState([]);

  // Outlet name (when outlet is selected)
  const [namaOutlet, setNamaOutlet] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch laporan bulanan (bulan + tahun only, no outlet)
  // Uses /bulanan for ringkasan+riwayat, /bulanan-detail for chart
  const fetchLaporanBulanan = useCallback(async (bulan, tahun, page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      setNamaOutlet("");

      // Fetch summary + riwayat (handle 404 independently)
      try {
        const laporanRes = await laporanService.getLaporanBulanan(bulan, tahun, { page, limit });
        const laporanData = laporanRes.data?.laporan || {};
        setRingkasan({
          total_transaksi: laporanData.ringkasan?.total_transaksi || 0,
          total_pendapatan: laporanData.ringkasan?.total_pendapatan || 0,
        });
        setRiwayatList(laporanData.riwayat || []);
      } catch (err) {
        // 404 = no data, just reset
        setRingkasan({ total_transaksi: 0, total_pendapatan: 0 });
        setRiwayatList([]);
        if (err?.response?.status !== 404) {
          console.error("Error fetching laporan bulanan:", err);
        }
      }

      // Fetch chart detail (handle 404 independently)
      try {
        const detailRes = await laporanService.getDetailBulanan(bulan, tahun);
        setChartDetail(detailRes.data?.laporan || []);
      } catch (err) {
        setChartDetail([]);
        if (err?.response?.status !== 404) {
          console.error("Error fetching detail bulanan:", err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch laporan bulanan per outlet (bulan + tahun + outlet)
  // Uses /bulanan-detail/outlet which returns ringkasan, grafik, riwayat
  const fetchLaporanBulananOutlet = useCallback(
    async (bulan, tahun, idOutlet, page = 1, limit = 10) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await laporanService.getDetailBulananOutlet(
          bulan,
          tahun,
          idOutlet,
          { page, limit },
        );

        const data = response.data || {};
        setNamaOutlet(data.namaOutlet || "");
        setRingkasan({
          total_transaksi: data.data?.ringkasan?.total_transaksi || 0,
          total_pendapatan: data.data?.ringkasan?.total_pendapatan || 0,
        });
        setChartDetail(data.data?.grafik || []);
        setRiwayatList(data.data?.riwayat || []);
      } catch (err) {
        if (err?.response?.status === 404) {
          setRingkasan({ total_transaksi: 0, total_pendapatan: 0 });
          setRiwayatList([]);
          setChartDetail([]);
          setNamaOutlet("");
        } else {
          setError(err);
          console.error("Error fetching laporan bulanan outlet:", err);
          toast.error("Gagal mengambil laporan outlet");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Keep fetchTransaksiById for detail modal
  const fetchTransaksiById = useCallback(async (id) => {
    try {
      const response = await laporanService.getTransaksiById(id);
      return response.data?.data || null;
    } catch (err) {
      console.error("Error fetching transaksi detail:", err);
      toast.error("Gagal mengambil detail transaksi");
      return null;
    }
  }, []);

  return {
    ringkasan,
    riwayatList,
    chartDetail,
    namaOutlet,
    isLoading,
    error,
    fetchLaporanBulanan,
    fetchLaporanBulananOutlet,
    fetchTransaksiById,
  };
};
