import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

const DeleteUserModal = ({ isOpen, onClose, onDelete, userData }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!userData) return;
    setIsDeleting(true);
    try {
      await onDelete(userData.id_pengguna);
      onClose();
    } catch (error) {
      console.error("Gagal menghapus pengguna:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col items-center text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
          HAPUS PENGGUNA
        </h2>
        
        <div className="w-24 h-24 mb-6 text-red-500">
          <AlertTriangle className="w-full h-full" strokeWidth={1.5} />
        </div>

        <p className="text-lg font-bold text-gray-900 uppercase">
          APAKAH ANDA YAKIN INGIN MENGHAPUS {userData?.nama}?
        </p>

        <p className="text-gray-400 mt-2 text-sm">
          Aksi ini tidak dapat dibatalkan. Data pengguna yang dihapus akan permanen hilang dari sistem.
        </p>

        <div className="flex items-center justify-center gap-4 mt-8 w-full">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-8 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm transition-colors flex items-center justify-center shadow-sm disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "HAPUS"}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-8 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors disabled:opacity-50"
          >
            BATAL
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
