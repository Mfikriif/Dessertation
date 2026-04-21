import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const AddBahanBakuModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    nama_bahan: "",
    satuan: "",
    stok_minimum: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nama_bahan: "",
        satuan: "",
        stok_minimum: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nama_bahan.trim()) newErrors.nama_bahan = "Nama bahan baku wajib diisi";
    if (!formData.satuan) newErrors.satuan = "Satuan wajib dipilih";
    if (formData.stok_minimum === "") newErrors.stok_minimum = "Stok minimum wajib diisi";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const result = await onAdd(formData);
    if (result.success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Tambah Bahan Baku</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bahan Baku</label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-xl outline-none transition-colors ${
                errors.nama_bahan ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-gray-900"
              }`}
              value={formData.nama_bahan}
              onChange={(e) => setFormData({ ...formData, nama_bahan: e.target.value })}
              placeholder="Contoh: Kopi Arabika"
            />
            {errors.nama_bahan && <p className="text-red-500 text-xs mt-1">{errors.nama_bahan}</p>}
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
              <select
                className={`w-full px-4 py-2 border rounded-xl outline-none transition-colors ${
                  errors.satuan ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-gray-900"
                }`}
                value={formData.satuan}
                onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
              >
                <option value="">Pilih Satuan</option>
                <option value="kg">kg</option>
                <option value="gram">gram</option>
                <option value="liter">liter</option>
                <option value="ml">ml</option>
                <option value="pcs">pcs</option>
                <option value="lusin">lusin</option>
                <option value="karton">karton</option>
              </select>
              {errors.satuan && <p className="text-red-500 text-xs mt-1">{errors.satuan}</p>}
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok Minimum</label>
              <input
                type="number"
                className={`w-full px-4 py-2 border rounded-xl outline-none transition-colors ${
                  errors.stok_minimum ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-gray-900"
                }`}
                value={formData.stok_minimum}
                onChange={(e) => setFormData({ ...formData, stok_minimum: e.target.value })}
                placeholder="Misal: 5"
              />
              {errors.stok_minimum && <p className="text-red-500 text-xs mt-1">{errors.stok_minimum}</p>}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors font-medium"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBahanBakuModal;
