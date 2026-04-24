import React, { useState } from "react";
import { Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import { usePengeluaran } from "../../../hooks/usePengeluaran";

import EditPengeluaranModal from "../../../component/modals/EditPengeluaranModal";
import DeletePengeluaranModal from "../../../component/modals/DeletePengeluaranModal";

const CatatanOperasional = () => {
  const {
    pengeluaranList,
    isLoading,
    addPengeluaran,
    editPengeluaran,
    deletePengeluaran,
  } = usePengeluaran();

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPengeluaran, setSelectedPengeluaran] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Right pane form state
  const [form, setForm] = useState({
    tanggal: "",
    biaya: "",
    deskripsi: "",
  });

  const handleOpenEdit = (item) => {
    setSelectedPengeluaran(item);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedPengeluaran(item);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal || !form.biaya || !form.deskripsi.trim()) {
      return;
    }

    const res = await addPengeluaran({
      tanggal: form.tanggal,
      biaya: parseFloat(form.biaya),
      deskripsi: form.deskripsi,
    });

    if (res.success) {
      setForm({ tanggal: "", biaya: "", deskripsi: "" });
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "RP 0";
    return `RP ${num.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  // Pagination calculations
  const totalItems = Array.isArray(pengeluaranList) ? pengeluaranList.length : 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const currentData = Array.isArray(pengeluaranList)
    ? pengeluaranList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Catatan Pengeluaran
          <br />
          Operasional
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Table */}
        <div className="lg:col-span-2 w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-white">
            <h2 className="text-lg font-bold text-gray-900">
              List Pengeluaran
            </h2>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 border-b border-gray-50">No</th>
                  <th className="px-6 py-4 border-b border-gray-50">Tanggal</th>
                  <th className="px-6 py-4 border-b border-gray-50">
                    Keterangan
                  </th>
                  <th className="px-6 py-4 border-b border-gray-50">Nominal</th>
                  <th className="px-6 py-4 border-b border-gray-50 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => {
                  const globalIndex =
                    (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                  return (
                    <tr
                      key={item.id_pengeluaran}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-500">{globalIndex}.</td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-xs">
                        {formatDate(item.tanggal)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 uppercase text-xs tracking-wide">
                        {item.deskripsi}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-xs">
                        {formatCurrency(item.biaya)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-gray-500 hover:text-black border border-gray-200 hover:border-gray-300 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-1.5 text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {currentData.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {isLoading
                        ? "Memuat data..."
                        : "Tidak ada data pengeluaran."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-gray-500 tracking-wider">
              MENAMPILKAN {currentData.length} DARI {totalItems} PENGELUARAN
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (pageNum) =>
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1),
                )
                .map((pageNum, index, array) => (
                  <div key={pageNum} className="flex items-center gap-1">
                    {index > 0 && array[index - 1] !== pageNum - 1 && (
                      <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  </div>
                ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Form: Catat Pengeluaran Operasional */}
        <div className="lg:col-span-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
          <h2 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
            Catat Pengeluaran
            <br />
            Operasional
          </h2>
          <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
            Catat pengeluaran operasional agar semua kegiatan pembelian dapat di
            analisis.
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
                Masukan Tanggal
              </label>
              <input
                type="date"
                className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm font-medium focus:border-black transition-colors bg-transparent cursor-pointer"
                value={form.tanggal}
                onChange={(e) =>
                  setForm({ ...form, tanggal: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
                Nominal
              </label>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                  RP
                </span>
                <input
                  type="number"
                  step="1"
                  className="w-full pl-8 pr-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm font-medium focus:border-black transition-colors bg-transparent"
                  placeholder="14000"
                  value={form.biaya}
                  onChange={(e) =>
                    setForm({ ...form, biaya: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm focus:border-black transition-colors placeholder-gray-300"
                placeholder="Contoh: BATCH-A02"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 px-4 py-3.5 bg-black text-white font-bold tracking-wide text-xs rounded transition-colors hover:bg-gray-800 disabled:bg-gray-500"
            >
              {isLoading ? "MENYIMPAN..." : "SIMPAN CATATAN"}
            </button>
          </form>
        </div>
      </div>

      <EditPengeluaranModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={selectedPengeluaran}
        onEdit={editPengeluaran}
      />
      <DeletePengeluaranModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        pengeluaran={selectedPengeluaran}
        onDelete={deletePengeluaran}
      />
    </div>
  );
};

export default CatatanOperasional;
