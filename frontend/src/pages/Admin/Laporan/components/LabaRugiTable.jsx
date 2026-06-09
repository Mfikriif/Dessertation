import React from "react";

const LabaRugiTable = ({ dataLabaRugi, isLoading }) => {
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "Rp 0";
    return `Rp ${num.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
  };

  if (isLoading || !dataLabaRugi) {
    return null; // Will be handled by Cards loading state
  }

  const { pengeluaran, total_pengeluaran, detail_bulanan } = dataLabaRugi;

  const opCategories = React.useMemo(() => {
    if (!detail_bulanan) return [];
    const catSet = new Set();
    catSet.add("Beban Penyusutan"); // Selalu tampilkan Beban Penyusutan meskipun 0
    detail_bulanan.forEach(b => {
      if (b.pengeluaran && b.pengeluaran.operasional) {
        Object.keys(b.pengeluaran.operasional).forEach(k => catSet.add(k));
      }
    });
    return Array.from(catSet);
  }, [detail_bulanan]);

  const BULAN_LABELS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-50 bg-white">
        <h2 className="text-lg font-bold text-gray-900">Rincian Beban & Pengeluaran</h2>
        <p className="text-[13px] text-gray-500 mt-1">
          Daftar rekapitulasi beban pokok dan biaya operasional
        </p>
      </div>
      
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left">
          <tbody>
            {/* Beban Pokok Group */}
            <tr className="bg-gray-50/50">
              <td colSpan="2" className="px-6 py-3 text-[11px] text-gray-400 font-bold tracking-wider uppercase border-b border-gray-50">
                Beban Pokok Penjualan (HPP)
              </td>
            </tr>
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">Biaya Bahan Baku</div>
                <div className="text-[13px] text-gray-500 mt-0.5">Pembelian bahan untuk produksi harian</div>
              </td>
              <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(pengeluaran.hpp)}</td>
            </tr>
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">Beban Produk Terbuang (Waste)</div>
                <div className="text-[13px] text-gray-500 mt-0.5">Estimasi kerugian dari sisa stok yang tidak terjual</div>
              </td>
              <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(pengeluaran.waste)}</td>
            </tr>

            {/* Beban Operasional Group */}
            <tr className="bg-gray-50/50">
              <td colSpan="2" className="px-6 py-3 text-[11px] text-gray-400 font-bold tracking-wider uppercase border-b border-gray-50">
                Beban Operasional
              </td>
            </tr>
            
            {Object.entries(pengeluaran.operasional).length > 0 ? (
              Object.entries(pengeluaran.operasional).map(([kategori, biaya]) => (
                <tr key={kategori} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{kategori}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(biaya)}</td>
                </tr>
              ))
            ) : (
              <tr className="border-b border-gray-50">
                <td colSpan="2" className="px-6 py-8 text-center text-gray-500 text-[13px]">Tidak ada catatan pengeluaran operasional.</td>
              </tr>
            )}

            {/* Total Row */}
            <tr className="bg-gray-50/50">
              <td className="px-6 py-5 font-bold text-gray-900 uppercase tracking-wider text-sm">Total Pengeluaran Keseluruhan</td>
              <td className="px-6 py-5 text-right font-bold text-gray-900 text-lg">{formatCurrency(total_pengeluaran)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabel Rincian Bulanan (Khusus Tahunan) */}
      {detail_bulanan && detail_bulanan.length > 0 && (
        <div className="mt-8 border-t border-gray-100">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-900">Rincian Laba & Rugi Per Bulan</h2>
            <p className="text-[13px] text-gray-500 mt-1">
              Daftar pendapatan dan pengeluaran spesifik setiap bulan sepanjang tahun
            </p>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 border-b border-gray-50 min-w-[120px]">Bulan</th>
                  <th className="px-6 py-4 border-b border-gray-50 text-right min-w-[150px]">Pendapatan</th>
                  <th className="px-6 py-4 border-b border-gray-50 text-right min-w-[150px]">Beban Pokok</th>
                  <th className="px-6 py-4 border-b border-gray-50 text-right min-w-[150px]">Waste</th>
                  {opCategories.map(cat => (
                    <th key={cat} className="px-6 py-4 border-b border-gray-50 text-right min-w-[150px]">{cat}</th>
                  ))}
                  <th className="px-6 py-4 border-b border-gray-50 text-right min-w-[150px]">Laba Bersih</th>
                </tr>
              </thead>
              <tbody>
                {detail_bulanan.map((bln, idx) => (
                  <tr key={bln.bulan} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{BULAN_LABELS[idx]}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600 bg-emerald-50/30">{formatCurrency(bln.pendapatan)}</td>
                    <td className="px-6 py-4 text-right font-medium text-red-600 bg-red-50/30">{formatCurrency(bln.pengeluaran.hpp)}</td>
                    <td className="px-6 py-4 text-right font-medium text-red-600 bg-red-50/30">{formatCurrency(bln.pengeluaran.waste)}</td>
                    {opCategories.map(cat => (
                      <td key={cat} className="px-6 py-4 text-right font-medium text-red-600 bg-red-50/30">
                        {formatCurrency(bln.pengeluaran.operasional[cat] || 0)}
                      </td>
                    ))}
                    <td className={`px-6 py-4 text-right font-bold bg-gray-50/50 ${bln.laba_rugi_bersih >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(bln.laba_rugi_bersih)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabaRugiTable;
