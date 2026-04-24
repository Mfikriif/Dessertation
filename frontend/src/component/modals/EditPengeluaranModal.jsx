import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

const EditPengeluaranModal = ({ isOpen, onClose, onEdit, initialData }) => {
  const [formData, setFormData] = useState({
    tanggal: "",
    biaya: "",
    deskripsi: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        tanggal: initialData.tanggal
          ? new Date(initialData.tanggal).toISOString().split("T")[0]
          : "",
        biaya: initialData.biaya || "",
        deskripsi: initialData.deskripsi || "",
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.tanggal) newErrors.tanggal = "Tanggal wajib diisi";
    if (!formData.biaya) newErrors.biaya = "Nominal wajib diisi";
    if (!formData.deskripsi.trim())
      newErrors.deskripsi = "Keterangan wajib diisi";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const result = await onEdit(initialData.id_pengeluaran, {
      tanggal: formData.tanggal,
      biaya: parseFloat(formData.biaya),
      deskripsi: formData.deskripsi,
    });
    if (result.success) {
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
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-colors text-sm ${
                      errors.tanggal
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                  />
                </div>
                {errors.tanggal && (
                  <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>
                )}
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
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-colors text-sm ${
                      errors.biaya
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                    placeholder="30.000"
                    value={formData.biaya}
                    onChange={(e) =>
                      setFormData({ ...formData, biaya: e.target.value })
                    }
                  />
                </div>
                {errors.biaya && (
                  <p className="text-red-500 text-xs mt-1">{errors.biaya}</p>
                )}
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Keterangan
              </label>
              <textarea
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-colors text-sm resize-none ${
                  errors.deskripsi
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-900"
                }`}
                placeholder="BELI GULA PASIR 10 KG"
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
              />
              {errors.deskripsi && (
                <p className="text-red-500 text-xs mt-1">{errors.deskripsi}</p>
              )}
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
