import React from "react";
import { Download } from "lucide-react";

const ChartSection = ({
  chartData,
  maxChartValue,
  formatCurrency,
  isLoading,
  handleExportExcel,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Grafik Pendapatan</h2>
          <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
            {chartData.subtitle}
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 self-start disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Unduh Laporan
        </button>
      </div>

      {/* Bar Chart */}
      <div className="w-full overflow-x-auto">
        {chartData.values.length > 0 ? (
          <>
            <div
              className="flex items-end justify-between gap-1 min-w-[600px] pt-12"
              style={{ height: "320px" }}
            >
              {chartData.values.map((val, idx) => {
                const heightPercent =
                  maxChartValue > 0 ? (val / maxChartValue) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                  >
                    <div
                      className="w-full max-w-[24px] bg-gray-900 rounded-t-md transition-all duration-500 ease-out hover:bg-gray-700 cursor-pointer relative group"
                      style={{
                        height: `${Math.max(heightPercent, 2)}%`,
                        minHeight: "4px",
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {formatCurrency(val)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-3 min-w-[600px]">
              {chartData.labels.map((label, idx) => (
                <div
                  key={idx}
                  className="flex-1 text-center text-[9px] font-bold text-gray-500 tracking-wide"
                >
                  {label}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ height: "320px" }}
          >
            <p className="text-gray-400 text-sm">
              {isLoading
                ? "Memuat data grafik..."
                : "Tidak ada data untuk ditampilkan"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartSection;
