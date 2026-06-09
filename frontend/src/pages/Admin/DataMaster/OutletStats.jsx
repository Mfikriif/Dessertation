import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  TrendingUp,
  Calendar,
  ShoppingBag,
  AlertCircle,
  PackageX,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import { useOutlet } from "../../../hooks/useOutlet";

const OutletStats = () => {
  const { Idoutlet } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchOutletStats } = useOutlet();

  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("terjual");

  const outletName = location.state?.outlet?.nama_outlet || "Outlet";

  useEffect(() => {
    const getStats = async () => {
      setIsStatsLoading(true);
      const data = await fetchOutletStats(Idoutlet);
      setStats(data);
      setIsStatsLoading(false);
    };
    if (Idoutlet) {
      getStats();
    }
  }, [Idoutlet]);

  const tabs = [
    { id: "stok_masuk", label: "Riwayat Stok Masuk", icon: ShoppingBag },
    { id: "terjual", label: "Terjual Hari Ini", icon: CheckCircle2 },
    { id: "tidak_terjual", label: "Tidak Terjual Hari Ini", icon: XCircle },
    { id: "evaluasi_kemarin", label: "Evaluasi Kemarin", icon: PackageX },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      {/* Page Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Statistik Outlet
              </h1>
            </div>
            <p className="text-gray-500 mt-1 flex items-center gap-2 font-medium">
              <span className="text-black bg-gray-100 px-2 py-0.5 rounded text-sm">
                {outletName}
              </span>
              — Analisis data penjualan & stok
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
        {isStatsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm text-gray-400">Memuat data statistik...</p>
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards — Row 1: Produk Terjual */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-2 mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  Jumlah Produk Terjual
                </h3>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Total produk yang berhasil terjual per hari
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Hari Ini"
                  value={stats.terjual_hari_ini}
                  icon={TrendingUp}
                  color="emerald"
                  subtitle="produk terjual"
                />
                <StatCard
                  label="Kemarin"
                  value={stats.terjual_kemarin}
                  icon={Calendar}
                  color="blue"
                  subtitle="produk terjual"
                />
                <StatCard
                  label="2 Hari Lalu"
                  value={stats.terjual_2_hari_lalu}
                  icon={Calendar}
                  color="indigo"
                  subtitle="produk terjual"
                />
                <StatCard
                  label="3 Hari Lalu"
                  value={stats.terjual_3_hari_lalu}
                  icon={Calendar}
                  color="violet"
                  subtitle="produk terjual"
                />
              </div>
            </div>

            {/* KPI Cards — Row 2: Stok & Produk Tidak Laku */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-2 mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  Stok & Produk Tidak Laku
                </h3>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Sisa stok & varian produk tanpa penjualan
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  label="Stok Tersedia"
                  value={stats.tidak_terjual}
                  icon={ShoppingBag}
                  color="amber"
                  subtitle="Total stok tersisa"
                />
                <StatCard
                  label="Zero Sales Hari Ini"
                  value={stats.jenis_produk_tidak_terjual}
                  icon={AlertCircle}
                  color="rose"
                  subtitle="Varian tanpa penjualan"
                />
                <StatCard
                  label="Zero Sales Kemarin"
                  value={stats.jenis_produk_tidak_terjual_kemarin}
                  icon={PackageX}
                  color="orange"
                  subtitle="Varian tanpa penjualan"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mt-6">
              <nav
                className="flex gap-2 overflow-x-auto pb-[-1px]"
                aria-label="Tabs"
              >
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  const count =
                    tab.id === "stok_masuk"
                      ? stats.daftar_stok_masuk?.length || 0
                      : tab.id === "terjual"
                        ? stats.daftar_produk_terjual_hari_ini?.length || 0
                        : tab.id === "tidak_terjual"
                          ? stats.daftar_produk_tidak_terjual_hari_ini
                              ?.length || 0
                          : stats.daftar_evaluasi_kemarin?.length || 0;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                        isActive
                          ? "border-black text-black"
                          : "border-transparent text-gray-400 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md ml-1 ${
                          isActive
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px] pt-4">
              {activeTab === "stok_masuk" && (
                <StokMasukTable items={stats.daftar_stok_masuk || []} />
              )}
              {activeTab === "terjual" && (
                <SoldProductsTable
                  items={stats.daftar_produk_terjual_hari_ini || []}
                />
              )}
              {activeTab === "tidak_terjual" && (
                <UnsoldProductsTable
                  items={stats.daftar_produk_tidak_terjual_hari_ini || []}
                  emptyMsg="Semua produk terjual hari ini!"
                />
              )}
              {activeTab === "evaluasi_kemarin" && (
                <EvaluasiKemarinTable
                  items={stats.daftar_evaluasi_kemarin || []}
                />
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">
            Gagal memuat data statistik.
          </div>
        )}
      </div>
    </div>
  );
};

/* ====== Sub-Components ====== */

const colorMap = {
  emerald: "bg-emerald-600",
  blue: "bg-blue-600",
  indigo: "bg-indigo-600",
  violet: "bg-purple-600",
  amber: "bg-amber-500",
  rose: "bg-rose-600",
  orange: "bg-orange-500",
};

const StatCard = ({ label, value, icon: Icon, color, subtitle }) => {
  const iconBg = colorMap[color] || "bg-gray-900";
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
          {label}
        </p>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {subtitle && (
          <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div
        className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  );
};

const SoldProductsTable = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3 border-2 border-dashed border-gray-100 rounded-2xl">
        <div className="p-4 bg-gray-50 rounded-full">
          <ShoppingBag className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-sm font-medium">Belum ada penjualan hari ini.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="text-[11px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50/50 border-b border-gray-50">
          <tr>
            <th className="px-5 py-4 w-16">No</th>
            <th className="px-5 py-4">Nama Produk</th>
            <th className="px-5 py-4">Kategori</th>
            <th className="px-5 py-4 text-right">Harga</th>
            <th className="px-5 py-4 text-right">Terjual</th>
            <th className="px-5 py-4 text-right">Pendapatan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {items.map((item, idx) => (
            <tr
              key={item.id_produk}
              className="hover:bg-gray-50/50 transition-colors group"
            >
              <td className="px-5 py-4 text-gray-500 text-sm">{idx + 1}.</td>
              <td className="px-5 py-4 text-gray-900 font-medium group-hover:text-black transition-colors">
                {item.nama_produk}
              </td>
              <td className="px-5 py-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium border border-gray-200/60">
                  {item.nama_kategori}
                </span>
              </td>
              <td className="px-5 py-4 text-right text-gray-500 font-medium tabular-nums">
                Rp {item.harga.toLocaleString("id-ID")}
              </td>
              <td className="px-5 py-4 text-right">
                <span className="text-sm font-bold text-gray-900">
                  {item.total_terjual}
                </span>
              </td>
              <td className="px-5 py-4 text-right text-gray-900 font-bold tabular-nums">
                Rp {item.total_pendapatan.toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UnsoldProductsTable = ({ items, emptyMsg }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3 border-2 border-dashed border-gray-100 rounded-2xl">
        <div className="p-4 bg-emerald-50 rounded-full">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="text-sm font-medium">{emptyMsg}</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="text-[11px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50/50 border-b border-gray-50">
          <tr>
            <th className="px-5 py-4 w-16">No</th>
            <th className="px-5 py-4">Nama Produk</th>
            <th className="px-5 py-4">Kategori</th>
            <th className="px-5 py-4 text-right">Harga</th>
            <th className="px-5 py-4 text-right">Sisa Stok</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {items.map((item, idx) => (
            <tr
              key={item.id_produk}
              className="hover:bg-gray-50/50 transition-colors group"
            >
              <td className="px-5 py-4 text-gray-500 text-sm">{idx + 1}.</td>
              <td className="px-5 py-4 text-gray-900 font-medium group-hover:text-black transition-colors">
                {item.nama_produk}
              </td>
              <td className="px-5 py-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium border border-gray-200/60">
                  {item.nama_kategori}
                </span>
              </td>
              <td className="px-5 py-4 text-right text-gray-500 font-medium tabular-nums">
                Rp {item.harga.toLocaleString("id-ID")}
              </td>
              <td className="px-5 py-4 text-right">
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-lg ${
                    item.sisa_stok === 0
                      ? "bg-red-100 text-red-700"
                      : item.sisa_stok <= 10
                        ? "bg-amber-100 text-amber-700"
                        : "text-gray-900"
                  }`}
                >
                  {item.sisa_stok}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EvaluasiKemarinTable = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3 border-2 border-dashed border-gray-100 rounded-2xl">
        <div className="p-4 bg-orange-50 rounded-full">
          <PackageX className="w-8 h-8 text-orange-400" />
        </div>
        <p className="text-sm font-medium">Tidak ada data evaluasi kemarin.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="text-[11px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50/50 border-b border-gray-50">
          <tr>
            <th className="px-5 py-4 w-16">No</th>
            <th className="px-5 py-4">Nama Produk</th>
            <th className="px-5 py-4">Kategori</th>
            <th className="px-5 py-4 text-right">Terjual Kemarin</th>
            <th className="px-5 py-4 text-right">Sisa Stok</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {items.map((item, idx) => (
            <tr
              key={item.id_produk}
              className="hover:bg-gray-50/50 transition-colors group"
            >
              <td className="px-5 py-4 text-gray-500 text-sm">{idx + 1}.</td>
              <td className="px-5 py-4 text-gray-900 font-medium group-hover:text-black transition-colors">
                {item.nama_produk}
              </td>
              <td className="px-5 py-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium border border-gray-200/60">
                  {item.nama_kategori}
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                <span
                  className={`text-sm font-bold ${
                    item.terjual_kemarin === 0
                      ? "text-gray-400"
                      : "text-gray-900"
                  }`}
                >
                  {item.terjual_kemarin}
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-lg ${
                    item.sisa_stok === 0
                      ? "bg-red-100 text-red-700"
                      : item.sisa_stok <= 10
                        ? "bg-amber-100 text-amber-700"
                        : "text-gray-900"
                  }`}
                >
                  {item.sisa_stok}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StokMasukTable = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3 border-2 border-dashed border-gray-100 rounded-2xl">
        <div className="p-4 bg-blue-50 rounded-full">
          <ShoppingBag className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-sm font-medium">Tidak ada data stok masuk.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="text-[11px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50/50 border-b border-gray-50">
          <tr>
            <th className="px-5 py-4 w-16">No</th>
            <th className="px-5 py-4">Nama Produk</th>
            <th className="px-5 py-4">Kategori</th>
            <th className="px-5 py-4 text-right">Harga</th>
            <th className="px-5 py-4 text-right">Total Stok Masuk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {items.map((item, idx) => (
            <tr
              key={item.id_produk}
              className="hover:bg-gray-50/50 transition-colors group"
            >
              <td className="px-5 py-4 text-gray-500 text-sm">{idx + 1}.</td>
              <td className="px-5 py-4 text-gray-900 font-medium group-hover:text-black transition-colors">
                {item.nama_produk}
              </td>
              <td className="px-5 py-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium border border-gray-200/60">
                  {item.nama_kategori}
                </span>
              </td>
              <td className="px-5 py-4 text-right text-gray-500 font-medium tabular-nums">
                Rp {item.harga.toLocaleString("id-ID")}
              </td>
              <td className="px-5 py-4 text-right">
                <span className="text-sm font-bold text-gray-900">
                  {item.total_stok}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OutletStats;
