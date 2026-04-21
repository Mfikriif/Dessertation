import { useState, useEffect } from "react";
import { X, Store, MapPin, Loader2 } from "lucide-react";

const EditOutletModal = ({ isOpen, onClose, onEdit, initialData }) => {
  const [formData, setFormData] = useState({
    nama_outlet: "",
    alamat: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_outlet: initialData.nama_outlet || "",
        alamat: initialData.alamat || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!initialData) return;
    setIsSubmitting(true);
    try {
      await onEdit(initialData.id_outlet, formData);
      onClose();
    } catch (error) {
      console.error("Gagal mengedit outlet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">EDIT OUTLET</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          <form id="editOutletForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Nama Outlet */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Outlet</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="nama_outlet"
                    value={formData.nama_outlet}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm"
                    placeholder="Masukkan nama outlet"
                  />
                </div>
              </div>

              {/* Alamat */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Alamat</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm resize-none"
                    placeholder="Masukkan alamat outlet"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-colors disabled:opacity-50"
          >
            BATAL
          </button>
          <button
            type="submit"
            form="editOutletForm"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 font-medium text-sm transition-colors flex items-center justify-center min-w-[100px] shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIMPAN"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOutletModal;
