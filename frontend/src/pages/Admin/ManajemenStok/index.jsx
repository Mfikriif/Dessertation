import React, { useState } from "react";
import { Plus, Edit2, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

import { useBahanBaku } from "../../../hooks/useBahanBaku";
import { usePenggunaanBb } from "../../../hooks/usePenggunaanBb";

import AddBahanBakuModal from "../../../component/modals/AddBahanBakuModal";
import EditBahanBakuModal from "../../../component/modals/EditBahanBakuModal";
import DeleteBahanBakuModal from "../../../component/modals/DeleteBahanBakuModal";

const ManajemenStok = () => {
  const { bahanBakuList, addBahanBaku, editBahanBaku, deleteBahanBaku } =
    useBahanBaku();
  const { addPenggunaan, isLoading: isAddingPenggunaan } = usePenggunaanBb();

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBahanBaku, setSelectedBahanBaku] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Right pane state
  const [penggunaanForm, setPenggunaanForm] = useState({
    id_bahan_baku: "",
    jumlah_digunakan: "",
    catatan: "",
  });

  const handleOpenAdd = () => setIsAddOpen(true);

  const handleOpenEdit = (item) => {
    setSelectedBahanBaku(item);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedBahanBaku(item);
    setIsDeleteOpen(true);
  };

  const handlePenggunaanSubmit = async (e) => {
    e.preventDefault();
    if (!penggunaanForm.id_bahan_baku || !penggunaanForm.jumlah_digunakan) {
      toast.error("Bahan baku dan jumlah wajib diisi");
      return;
    }

    // Check if sufficient stock
    const bb = bahanBakuList.find(
      (b) => b.id_bahan_baku === penggunaanForm.id_bahan_baku,
    );
    if (!bb) return;

    if (
      parseFloat(penggunaanForm.jumlah_digunakan) > parseFloat(bb.jumlah_stok)
    ) {
      toast.error("Jumlah penggunaan melebihi stok yang tersedia");
      return;
    }

    const res = await addPenggunaan({
      ...penggunaanForm,
      catatan: penggunaanForm.catatan || "Penggunaan manual",
    });

    if (res.success) {
      setPenggunaanForm({
        id_bahan_baku: "",
        jumlah_digunakan: "",
        catatan: "",
      });
    }
  };

  const getStatus = (jumlah, minimum) => {
    const qty = parseFloat(jumlah);
    const min = parseFloat(minimum);

    if (qty < min) return "KRITIS";
    if (qty <= min * 1.5) return "MENIPIS";
    return "OPTIMAL";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "KRITIS":
        return "bg-red-500 text-white";
      case "MENIPIS":
        return "bg-orange-400 text-white";
      case "OPTIMAL":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const selectedBbForUnit = bahanBakuList.find(
    (b) => b.id_bahan_baku === penggunaanForm.id_bahan_baku,
  );

  // Stats calculation
  const stats = bahanBakuList.reduce(
    (acc, curr) => {
      const status = getStatus(curr.jumlah_stok, curr.stok_minimum);
      if (status === "KRITIS") acc.kritis++;
      else if (status === "MENIPIS") acc.menipis++;
      else acc.optimal++;
      return acc;
    },
    { kritis: 0, menipis: 0, optimal: 0 },
  );

  // Pagination calculations
  const totalItems = Array.isArray(bahanBakuList) ? bahanBakuList.length : 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const currentData = Array.isArray(bahanBakuList)
    ? bahanBakuList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Stok</h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium text-sm">Tambah Bahan Baku</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
              Stok Menipis
            </p>
            <span className="text-4xl font-bold text-gray-900">
              {String(stats.menipis).padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs font-semibold text-orange-400 text-right leading-relaxed max-w-[100px]">
            Segera tambah persediaan
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
              Stok Kritis
            </p>
            <span className="text-4xl font-bold text-red-500">
              {String(stats.kritis).padStart(2, "0")}
            </span>
          </div>
          <AlertTriangle className="w-10 h-10 text-red-500 fill-red-50" />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
              Level Optimal Stok
            </p>
            <span className="text-4xl font-bold text-gray-900">
              {String(stats.optimal).padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-400">STABIL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Table */}
        <div className="lg:col-span-2 w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-white">
            <h2 className="text-lg font-bold text-gray-900">
              Katalog Bahan Baku
            </h2>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-gray-400 font-bold tracking-wider uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 border-b border-gray-50">No</th>
                  <th className="px-6 py-4 border-b border-gray-50">Nama</th>
                  <th className="px-6 py-4 border-b border-gray-50">
                    Jumlah Stok
                  </th>
                  <th className="px-6 py-4 border-b border-gray-50">Status</th>
                  <th className="px-6 py-4 border-b border-gray-50 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => {
                  const globalIndex =
                    (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                  const status = getStatus(item.jumlah_stok, item.stok_minimum);
                  return (
                    <tr
                      key={item.id_bahan_baku}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-500">{globalIndex}.</td>
                      <td className="px-6 py-4 font-semibold text-gray-900 uppercase text-xs tracking-wide">
                        {item.nama_bahan}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-xs">
                        {item.jumlah_stok} {item.satuan?.toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${getStatusColor(item.status_stok?.toUpperCase())}`}
                        >
                          {item.status_stok?.toUpperCase()}
                        </span>
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
                      Tidak ada data bahan baku.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-gray-500 tracking-wider">
              MENAMPILKAN {currentData.length} DARI {totalItems} BAHAN BAKU
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

        {/* Right Form: Catatan Penggunaan */}
        <div className="lg:col-span-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
          <h2 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
            Catatan Penggunaan
            <br />
            Bahan Baku
          </h2>
          <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
            Catat pengurangan bahan baku untuk memperbarui sisa bahan yang
            dimiliki secara langsung
          </p>

          <form onSubmit={handlePenggunaanSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
                Pilih Bahan Baku
              </label>
              <select
                className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm font-medium focus:border-black transition-colors bg-transparent cursor-pointer"
                value={penggunaanForm.id_bahan_baku}
                onChange={(e) =>
                  setPenggunaanForm({
                    ...penggunaanForm,
                    id_bahan_baku: e.target.value,
                  })
                }
              >
                <option value="">Pilih dari katalog...</option>
                {bahanBakuList.map((bb) => (
                  <option key={bb.id_bahan_baku} value={bb.id_bahan_baku}>
                    {bb.nama_bahan} (Sisa: {bb.jumlah_stok} {bb.satuan})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
                  Jumlah
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-0 py-2 border-b border-gray-200 outline-none text-gray-900 text-sm focus:border-black transition-colors"
                  placeholder="0.00"
                  value={penggunaanForm.jumlah_digunakan}
                  onChange={(e) =>
                    setPenggunaanForm({
                      ...penggunaanForm,
                      jumlah_digunakan: e.target.value,
                    })
                  }
                />
              </div>
              <div className="w-[40%]">
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full px-0 py-2 border-b border-gray-200 text-gray-400 italic bg-transparent text-sm cursor-not-allowed"
                  placeholder="kg / L"
                  value={selectedBbForUnit ? selectedBbForUnit.satuan : ""}
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
                value={penggunaanForm.catatan}
                onChange={(e) =>
                  setPenggunaanForm({
                    ...penggunaanForm,
                    catatan: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="submit"
              disabled={isAddingPenggunaan}
              className="w-full mt-4 px-4 py-3.5 bg-black text-white font-bold tracking-wide text-xs rounded transition-colors hover:bg-gray-800 disabled:bg-gray-500"
            >
              {isAddingPenggunaan ? "MENYIMPAN..." : "SIMPAN CATATAN"}
            </button>
          </form>
        </div>
      </div>

      <AddBahanBakuModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={addBahanBaku}
      />
      <EditBahanBakuModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={selectedBahanBaku}
        onEdit={editBahanBaku}
      />
      <DeleteBahanBakuModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        bahanBaku={selectedBahanBaku}
        onDelete={deleteBahanBaku}
      />
    </div>
  );
};

export default ManajemenStok;
