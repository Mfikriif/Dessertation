import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

const EditPengeluaranModal = ({ isOpen, onClose, onEdit, initialData }) => {
  const [formData, setFormData] = useState({
    kategori: "Biaya Operasional",
    tanggal: "",
    biaya: "",
    deskripsi: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        kategori: initialData.kategori || "Biaya Operasional",
        tanggal: initialData.tanggal
          ? new Date(initialData.tanggal).toISOString().split("T")[0]
          : "",
        biaya: initialData.biaya || "",
        deskripsi: initialData.deskripsi || "",
      });
      setErrorMsg("");
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const result = await onEdit(initialData.id_pengeluaran, {
      kategori: formData.kategori,
      tanggal: formData.tanggal,
      biaya: parseFloat(formData.biaya),
      deskripsi: formData.deskripsi,
    });
    if (result && !result.success) {
      setErrorMsg(result.error?.response?.data?.message || "Gagal mengedit pengeluaran");
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6 tracking-tight">
            EDIT CATATAN OPERASIONAL
          </h2>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tanggal
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-colors text-sm border-gray-200 focus:border-gray-900"
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nominal
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-400 text-sm font-medium">
                      RP
                    </span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-colors text-sm border-gray-200 focus:border-gray-900"
                    placeholder="30.000"
                    value={formData.biaya}
                    onChange={(e) =>
                      setFormData({ ...formData, biaya: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Kategori
              </label>
              <select
                className="w-full px-4 py-2.5 border rounded-xl outline-none transition-colors text-sm border-gray-200 focus:border-gray-900 appearance-none bg-white cursor-pointer"
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({ ...formData, kategori: e.target.value })
                }
              >
                <option value="Biaya Operasional">Biaya Operasional</option>
                <option value="Gaji Karyawan">Gaji Karyawan</option>
                <option value="Beban Penyusutan">Beban Penyusutan</option>
                <option value="Biaya Pengemasan">Biaya Pengemasan</option>
                <option value="Biaya Pemasaran">Biaya Pemasaran</option>
                <option value="Lain-lain">Lain-lain</option>
              </select>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Keterangan
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-2.5 border rounded-xl outline-none transition-colors text-sm resize-none border-gray-200 focus:border-gray-900"
                placeholder="BELI GULA PASIR 10 KG"
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="submit"
                className="px-8 py-2.5 text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors font-medium text-sm"
              >
                SIMPAN
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm"
              >
                BATAL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPengeluaranModal;
