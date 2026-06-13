import React from "react";

const FilterSection = ({
  selectedOutlet,
  setSelectedOutlet,
  handleLihatLaporan,
  isLoading,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  outlet,
}) => {
  const setThisMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    setStartDate(`${y}-${m}-01`);
    setEndDate(`${y}-${m}-${String(lastDay).padStart(2, "0")}`);
  };

  const setThisYear = () => {
    const y = new Date().getFullYear();
    setStartDate(`${y}-01-01`);
    setEndDate(`${y}-12-31`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Tanggal Mulai */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm font-medium focus:border-black transition-colors bg-transparent cursor-pointer"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* Tanggal Akhir */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
            Tanggal Akhir (Opsional)
          </label>
          <input
            type="date"
            className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm font-medium focus:border-black transition-colors bg-transparent cursor-pointer"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
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

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={setThisMonth}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-xs rounded-lg transition-colors hover:bg-gray-200"
          >
            Bulan Ini
          </button>
          <button
            onClick={setThisYear}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-xs rounded-lg transition-colors hover:bg-gray-200"
          >
            Tahun Ini
          </button>
        </div>
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
