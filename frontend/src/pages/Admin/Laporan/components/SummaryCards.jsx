import React from "react";
import { TrendingUp, Receipt } from "lucide-react";

const SummaryCards = ({ ringkasan, selectedBulanLabel, selectedTahun, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
            Total Pendapatan {selectedBulanLabel} {selectedTahun}
          </p>
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(ringkasan.total_pendapatan)}
          </span>
        </div>
        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
            Total Transaksi {selectedBulanLabel} {selectedTahun}
          </p>
          <span className="text-4xl font-bold text-gray-900">
            {new Intl.NumberFormat("id-ID", { minimumIntegerDigits: 2 }).format(Number(ringkasan.total_transaksi || 0))}
          </span>
        </div>
        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
          <Receipt className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
