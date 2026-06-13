import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { laporanService } from "../services/laporanService";

// Helper: parse detail_pembelian dari MySQL JSON string ke Array JS
const parseRiwayat = (riwayatList) => {
  if (!Array.isArray(riwayatList)) return [];
  return riwayatList.map((trx) => {
    let detail = [];
    try {
      detail =
        typeof trx.detail_pembelian === "string"
          ? JSON.parse(trx.detail_pembelian)
          : trx.detail_pembelian;
    } catch (err) {
      detail = [];
    }
    return {
      ...trx,
      detail_pembelian: detail || [],
    };
  });
};

export const useLaporan = () => {
  // Data for summary cards
  const [ringkasan, setRingkasan] = useState({
    total_transaksi: 0,
    total_pendapatan: 0,
    total_pengeluaran: 0,
  });

  // Data for transaction history table (sudah terpaginasi dari server)
  const [riwayatList, setRiwayatList] = useState([]);

  // Data for expenditure list
  const [pengeluaranList, setPengeluaranList] = useState([]);

  // Server-side pagination info
  const [paginasi, setPaginasi] = useState({
    halaman_saat_ini: 1,
    batas_per_halaman: 7,
    total_riwayat: 0,
    total_halaman: 0,
  });

  // Data for chart (daily breakdown)
  const [chartDetail, setChartDetail] = useState([]);

  // Outlet name (when outlet is selected)
  const [namaOutlet, setNamaOutlet] = useState("");

  // Top 3 Outlets (for tahunan view without outlet)
  const [topOutlets, setTopOutlets] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch laporan bulanan (bulan + tahun only, no outlet)
  // Uses /bulanan for ringkasan+riwayat, /bulanan-detail for chart
  const fetchLaporanBulanan = useCallback(async (bulan, tahun, page = 1, limit = 7, start_date = "", end_date = "") => {
    try {
      setIsLoading(true);
      setError(null);
      setNamaOutlet("");

      // Fetch summary + riwayat (handle 404 independently)
      try {
        const laporanRes = await laporanService.getLaporanBulanan(bulan, tahun, { page, limit, start_date, end_date });
        const resData = laporanRes.data || {};
        const laporanData = resData.laporan || {};

        setRingkasan({
          total_transaksi: laporanData.ringkasan?.total_transaksi || 0,
          total_pendapatan: laporanData.ringkasan?.total_pendapatan || 0,
          total_pengeluaran: laporanData.ringkasan?.total_pengeluaran || 0,
        });
        // Parse detail_pembelian dari setiap riwayat
        setRiwayatList(parseRiwayat(laporanData.riwayat));
        setPengeluaranList(laporanData.pengeluaran || []);
        setPaginasi({
          halaman_saat_ini: resData.halaman_saat_ini || page,
          batas_per_halaman: resData.batas_per_halaman || limit,
          total_riwayat: resData.total_riwayat || 0,
          total_halaman: resData.total_halaman || 0,
        });
      } catch (err) {
        // 404 = no data, just reset
        setRingkasan({ total_transaksi: 0, total_pendapatan: 0, total_pengeluaran: 0 });
        setRiwayatList([]);
        setPengeluaranList([]);
        setPaginasi({ halaman_saat_ini: 1, batas_per_halaman: limit, total_riwayat: 0, total_halaman: 0 });
        if (err?.response?.status !== 404) {
          console.error("Error fetching laporan bulanan:", err);
        }
      }

      // Fetch chart detail (handle 404 independently)
      try {
        const detailRes = await laporanService.getDetailBulanan(bulan, tahun, { start_date, end_date });
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
    async (bulan, tahun, idOutlet, page = 1, limit = 7, start_date = "", end_date = "") => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await laporanService.getDetailBulananOutlet(
          bulan,
          tahun,
          idOutlet,
          { page, limit, start_date, end_date },
        );

        const data = response.data || {};
        const pagInfo = data.paginasi_riwayat || {};

        setNamaOutlet(data.namaOutlet || "");
        setRingkasan({
          total_transaksi: data.data?.ringkasan?.total_transaksi || 0,
          total_pendapatan: data.data?.ringkasan?.total_pendapatan || 0,
          total_pengeluaran: data.data?.ringkasan?.total_pengeluaran || 0,
        });
        setChartDetail(data.data?.grafik || []);
        // Riwayat dari API outlet sudah termasuk detail_pembelian
        setRiwayatList(data.data?.riwayat || []);
        setPengeluaranList([]);
        setPaginasi({
          halaman_saat_ini: pagInfo.halaman_saat_ini || page,
          batas_per_halaman: pagInfo.batas_per_halaman || limit,
          total_riwayat: pagInfo.total_riwayat || 0,
          total_halaman: pagInfo.total_halaman || 0,
        });
      } catch (err) {
        if (err?.response?.status === 404) {
          setRingkasan({ total_transaksi: 0, total_pendapatan: 0, total_pengeluaran: 0 });
          setRiwayatList([]);
          setPengeluaranList([]);
          setChartDetail([]);
          setNamaOutlet("");
          setPaginasi({ halaman_saat_ini: 1, batas_per_halaman: limit, total_riwayat: 0, total_halaman: 0 });
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

  const fetchLaporanTahunan = useCallback(async (tahun) => {
    try {
      setIsLoading(true);
      setError(null);
      setNamaOutlet("");

      // Fetch summary & top 3 outlets
      try {
        const laporanRes = await laporanService.getLaporanTahunan(tahun);
        const resData = laporanRes.data || {};
        const laporanData = resData.laporan || {};
        
        setRingkasan({
          total_transaksi: laporanData.ringkasan?.total_transaksi || 0,
          total_pendapatan: laporanData.ringkasan?.total_pendapatan || 0,
          total_pengeluaran: laporanData.ringkasan?.total_pengeluaran || 0,
        });
        setTopOutlets(laporanData.detail_outlet || []);
        
        // No paginasi / riwayat for tahunan
        setRiwayatList([]);
        setPengeluaranList([]);
        setPaginasi({ halaman_saat_ini: 1, batas_per_halaman: 7, total_riwayat: 0, total_halaman: 0 });
      } catch (err) {
        setRingkasan({ total_transaksi: 0, total_pendapatan: 0, total_pengeluaran: 0 });
        setTopOutlets([]);
        setRiwayatList([]);
        setPengeluaranList([]);
        setPaginasi({ halaman_saat_ini: 1, batas_per_halaman: 7, total_riwayat: 0, total_halaman: 0 });
      }

      // Fetch chart detail
      try {
        const detailRes = await laporanService.getDetailTahunan(tahun);
        setChartDetail(detailRes.data?.laporan || []);
      } catch (err) {
        setChartDetail([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLaporanTahunanOutlet = useCallback(async (tahun, idOutlet) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch monthly data for outlet
      const response = await laporanService.getDetailTahunanOutlet(tahun, idOutlet);
      const data = response.data || {};
      
      setNamaOutlet(data.namaOutlet || "");
      setChartDetail(data.laporan || []);
      
      // Calculate ringkasan from chartDetail
      let total_transaksi = 0;
      let total_pendapatan = 0;
      (data.laporan || []).forEach((item) => {
         total_transaksi += item.jumlah_transaksi;
         // convert to float in case total_pendapatan is string
         total_pendapatan += parseFloat(item.total_pendapatan) || 0;
      });

      setRingkasan({ total_transaksi, total_pendapatan, total_pengeluaran: 0 });
      setTopOutlets([]);
      setRiwayatList([]);
      setPengeluaranList([]);
      setPaginasi({ halaman_saat_ini: 1, batas_per_halaman: 7, total_riwayat: 0, total_halaman: 0 });
    } catch (err) {
      setRingkasan({ total_transaksi: 0, total_pendapatan: 0, total_pengeluaran: 0 });
      setRiwayatList([]);
      setPengeluaranList([]);
      setChartDetail([]);
      setTopOutlets([]);
      setNamaOutlet("");
      setPaginasi({ halaman_saat_ini: 1, batas_per_halaman: 7, total_riwayat: 0, total_halaman: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportExcel = useCallback(async (bulan, tahun, idOutlet, start_date = "", end_date = "") => {
    try {
      setIsLoading(true);
      let response;
      if (bulan === "") {
        response = await laporanService.exportLaporanTahunan(tahun, idOutlet, { start_date, end_date });
      } else {
        response = await laporanService.exportLaporanBulanan(bulan, tahun, idOutlet, { start_date, end_date });
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "laporan.xlsx";
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Berhasil mengunduh laporan");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh laporan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    ringkasan,
    riwayatList,
    pengeluaranList,
    chartDetail,
    namaOutlet,
    topOutlets,
    paginasi,
    isLoading,
    error,
    fetchLaporanBulanan,
    fetchLaporanBulananOutlet,
    fetchLaporanTahunan,
    fetchLaporanTahunanOutlet,
    exportExcel,
  };
};
