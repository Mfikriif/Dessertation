import React from "react";
import { X } from "lucide-react";

const DetailTransaksiModal = ({ isOpen, onClose, transaksi }) => {
  if (!isOpen || !transaksi) return null;

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "RP 0";
    return `RP ${num.toLocaleString("id-ID")}`;
  };

  const formatWaktu = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes} WIB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const getMetodeBadgeClass = (metode) => {
    switch (metode?.toLowerCase()) {
      case "cash":
        return "bg-green-50 text-green-700 border-green-200";
      case "transfer":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "qris":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            DETAIL TRANSAKSI
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Transaksi */}
        <div className="p-6 border-b border-gray-50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              ID Transaksi
            </span>
            <span className="text-xs font-mono font-medium text-gray-700">
              {transaksi.id_transaksi?.substring(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Tanggal
            </span>
            <span className="text-xs font-medium text-gray-700">
              {formatDate(transaksi.tanggal)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Waktu
            </span>
            <span className="text-xs font-medium text-gray-700">
              {formatWaktu(transaksi.tanggal)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Metode Pembayaran
            </span>
            <span
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border ${getMetodeBadgeClass(transaksi.metode_bayar)}`}
            >
              {transaksi.metode_bayar?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Detail Items */}
        <div className="p-6">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3">
            Rincian Item
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-400 font-bold tracking-wider uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3 pr-4">Nama Produk</th>
                  <th className="pb-3 px-4 text-center">Qty</th>
                  <th className="pb-3 pl-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transaksi.items?.map((item, idx) => (
                  <tr key={item.id_detail || idx}>
                    <td className="py-3 pr-4 font-medium text-gray-900 text-xs">
                      {item.nama_produk}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 text-xs">
                      {item.jumlah}
                    </td>
                    <td className="py-3 pl-4 text-right text-gray-600 text-xs font-medium">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Total
            </span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(transaksi.total_harga)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-900 text-white font-bold tracking-wide text-xs rounded-lg transition-colors hover:bg-gray-800"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailTransaksiModal;
