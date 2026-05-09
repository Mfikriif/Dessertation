import React from "react";

const FilterSection = ({
  selectedBulan,
  setSelectedBulan,
  selectedTahun,
  setSelectedTahun,
  selectedOutlet,
  setSelectedOutlet,
  handleLihatLaporan,
  isLoading,
  outlet,
  BULAN_LIST,
  yearOptions,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Bulan */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
            Masukkan Bulan
          </label>
          <select
            className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm font-medium focus:border-black transition-colors bg-transparent cursor-pointer"
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
          >
            <option value="">Sepanjang Tahun</option>
            {BULAN_LIST.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tahun */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
            Masukkan Tahun
          </label>
          <select
            className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm font-medium focus:border-black transition-colors bg-transparent cursor-pointer"
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Cabang / Outlet */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
            Masukkan Cabang
          </label>
          <select
            className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm font-medium focus:border-black transition-colors bg-transparent cursor-pointer"
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
          >
            <option value="">Semua Outlet</option>
            {Array.isArray(outlet) &&
              outlet.map((o) => (
                <option key={o.id_outlet} value={o.id_outlet}>
                  {o.nama_outlet}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleLihatLaporan}
          disabled={isLoading}
          className="px-8 py-3 bg-black text-white font-bold tracking-wide text-xs rounded-lg transition-colors hover:bg-gray-800 disabled:bg-gray-500 min-w-[200px]"
        >
          {isLoading ? "MEMUAT..." : "Lihat Laporan"}
        </button>
      </div>
    </div>
  );
};

export default FilterSection;
