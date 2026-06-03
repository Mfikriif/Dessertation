import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Banknote,
  Database,
  Package,
  Tags,
  Store,
} from "lucide-react";
import StatCard from "../../component/ui/StatCard";
import ActivityItem from "../../component/ui/ActivityItem";
import { dashboardService } from "../../services/dashboardService";
import { laporanService } from "../../services/laporanService";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const isFewDays = chartData.length < 10;

  useEffect(() => {
    // Fungsi pembantu untuk memproses data chart
    const processChartData = (apiData) => {
      let maxVal = 0;
      const processedChart = apiData.map((item) => {
        const day = item.tanggal_transaksi.split("-")[2];
        const val = parseFloat(item.total_pendapatan) || 0;
        if (val > maxVal) maxVal = val;
        return { day, val };
      });
      const scaleMax = maxVal > 0 ? maxVal * 1.2 : 100;
      return processedChart.map((item) => ({
        ...item,
        valPercentage: maxVal > 0 ? (item.val / scaleMax) * 100 : 0,
      }));
    };

    setLoading(true);

    // Mulai polling untuk dashboard info
    const stopPollingInfo = dashboardService.pollDashboardInfo((err, res) => {
      if (!err && res?.data?.data && res.data.data.length > 0) {
        setDashboardData(res.data.data[0]);
      }
      setLoading(false);
    });

    // Mulai polling untuk chart performa
    const stopPollingChart = dashboardService.pollPerformaBulanIni((err, res) => {
      if (err) {
        if (err.response && err.response.status === 404) {
          setChartData([]);
        }
      } else {
        const apiData = res.data?.data || [];
        setChartData(processChartData(apiData));
      }
    });

    return () => {
      stopPollingInfo();
      stopPollingChart();
    };
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number || 0);
  };

  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun yang lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan yang lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari yang lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam yang lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit yang lalu";
    return Math.floor(seconds) + " detik yang lalu";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in zoom-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Ringkasan Performa Dessertation
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Aktifitas dan performa keseluruhan outlet
        </p>
      </div>

      {/* Stat Cards */}
      <div className="flex flex-wrap justify-start gap-6">
        <StatCard
          title="Total Pendapatan"
          amount={formatRupiah(dashboardData?.pendapatan)}
          subtitle="Bulan ini"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Total Pengeluaran"
          amount={formatRupiah(dashboardData?.pengeluaran)}
          subtitle="Bulan ini"
          icon={<Banknote className="w-5 h-5" />}
        />
        <StatCard
          title="Stok Kurang"
          amount={`${dashboardData?.total_bahanbaku || 0} Item`}
          subtitle="Bahan Baku"
          icon={<Database className="w-5 h-5" />}
          alert={dashboardData?.total_bahanbaku > 0}
        />
        <StatCard
          title="Total Produk"
          amount={`${dashboardData?.total_produk || 0} Item`}
          subtitle="Tersedia"
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          title="Kategori Produk"
          amount={`${dashboardData?.total_kategori || 0} Kategori`}
          subtitle="Aktif"
          icon={<Tags className="w-5 h-5" />}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Performa Bulan Ini
          </h2>

          <div className={`flex-1 flex items-end ${isFewDays ? "justify-start gap-4 sm:gap-6" : "justify-between gap-1"} px-2 sm:px-4 pt-6 pb-4 relative min-h-[240px] overflow-x-auto`}>
            {/* Horizontal Grid lines mock */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-t border-gray-100"></div>
              ))}
              <div className="w-full border-t-2 border-gray-100"></div>
            </div>

            {/* Bars */}
            {chartData.map((data) => (
              <div
                key={data.day}
                className={`flex flex-col items-center gap-4 z-10 ${isFewDays ? "w-12 sm:w-16 flex-none" : "w-full"} relative group`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                  <div className="bg-gray-900 text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {formatRupiah(data.val)}
                  </div>
                  {/* Tooltip arrow */}
                  <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-1"></div>
                </div>

                <div className="h-[160px] w-2 sm:w-3 md:w-6 flex flex-col justify-end group cursor-pointer">
                  <div
                    className="w-full bg-gray-100 rounded-t-sm transition-all duration-300 group-hover:bg-gray-200"
                    style={{ height: `${100 - data.valPercentage}%` }}
                  ></div>
                  <div
                    className="w-full bg-black rounded-b-sm transition-all duration-300 group-hover:bg-gray-800"
                    style={{ height: `${data.valPercentage}%` }}
                  ></div>
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-gray-400">
                  {data.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Area */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Aktivitas Rumah Produksi
          </h2>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {dashboardData?.catatan_penggunaan && dashboardData.catatan_penggunaan.length > 0 ? (
              dashboardData.catatan_penggunaan.slice(0, 3).map((item, index) => (
                <ActivityItem
                  key={index}
                  title={`Memakai ${item.nama_bahan} ${item.jumlah_digunakan} ${item.satuan}`}
                  time={timeAgo(item.created_at)}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">Belum ada aktivitas.</p>
            )}
          </div>

          <button 
            onClick={() => setShowActivityModal(true)}
            className="w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
          >
            Lihat Detail Aktivitas
          </button>
        </div>
      </div>

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Detail Aktivitas</h2>
              <button 
                onClick={() => setShowActivityModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {dashboardData?.catatan_penggunaan && dashboardData.catatan_penggunaan.length > 0 ? (
                dashboardData.catatan_penggunaan.map((item, index) => (
                  <ActivityItem
                    key={index}
                    title={`Memakai ${item.nama_bahan} ${item.jumlah_digunakan} ${item.satuan}`}
                    time={timeAgo(item.created_at)}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center">Tidak ada aktivitas untuk ditampilkan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
