import React from "react";
import { TrendingUp, Receipt, TrendingDown, Wallet } from "lucide-react";

const LabaRugiCards = ({ dataLabaRugi, isLoading, outletFilter, ringkasan }) => {
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "Rp 0";
    return `Rp ${num.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
  };

  if (isLoading || !dataLabaRugi) {
    return (
      <div className="flex justify-center items-center h-32">
        <span className="text-gray-500 font-medium animate-pulse">Memuat ringkasan...</span>
      </div>
    );
  }

  const { pendapatan, total_pengeluaran, laba_rugi_bersih, proporsi } = dataLabaRugi;

  return (
    <div className="space-y-4">
      {outletFilter !== "all" && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>
            <strong>Informasi:</strong> Karena memfilter Outlet Spesifik, Beban Produksi (HPP) & Operasional dibagi proporsional sebesar <strong>{(proporsi * 100).toFixed(2)}%</strong> (berdasarkan kontribusi pendapatan outlet).
          </p>
        </div>
      )}

      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Pendapatan KPI */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
              Total Pendapatan
            </p>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(pendapatan)}
            </span>
          </div>
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Total Transaksi KPI */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
              Total Transaksi
            </p>
            <span className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat("id-ID", { minimumIntegerDigits: 2 }).format(Number(ringkasan?.total_transaksi || 0))}
            </span>
          </div>
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Pengeluaran KPI */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
              Total Pengeluaran
            </p>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(total_pengeluaran)}
            </span>
          </div>
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Laba/Rugi KPI */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
              Laba Bersih
            </p>
            <span className={`text-2xl font-bold ${laba_rugi_bersih >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(laba_rugi_bersih)}
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default LabaRugiCards;
