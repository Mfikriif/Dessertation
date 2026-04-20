import { useState } from "react";
import {
  Filter,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Mail,
} from "lucide-react";
import { usePengguna } from "../../../hooks/usePengguna";
import AddUserModal from "../../../component/modals/AddUserModal";
import EditUserModal from "../../../component/modals/EditUserModal";
import DeleteUserModal from "../../../component/modals/DeleteUserModal";

const UserList = () => {
  const { pengguna, addPengguna, editPengguna, deletePengguna } = usePengguna();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDeleteUser, setSelectedDeleteUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  const totalItems = Array.isArray(pengguna) ? pengguna.length : 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const currentData = Array.isArray(pengguna)
    ? pengguna.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];

  const handleAddPengguna = async (data) => {
    const result = await addPengguna(data);
    if (!result.success) throw result.error;
  };

  const handleEditClick = (usr) => {
    setSelectedUser(usr);
    setIsEditModalOpen(true);
  };

  const handleEditPengguna = async (id, data) => {
    const result = await editPengguna(id, data);
    if (!result.success) throw result.error;
  };

  const handleDeleteClick = (usr) => {
    setSelectedDeleteUser(usr);
    setIsDeleteModalOpen(true);
  };

  const handleDeletePengguna = async (id) => {
    const result = await deletePengguna(id);
    if (!result.success) throw result.error;
  };

  console.log(handleEditPengguna.id);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Data Pengguna
          </h1>
          <p className="text-gray-500 mt-1">Kelola akses dan peran staff.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            TAMBAH PENGGUNA
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider w-20">
                  NO
                </th>
                <th className="px-6 py-4 font-medium tracking-wider">
                  NAMA PENGGUNA
                </th>
                <th className="px-6 py-4 font-medium tracking-wider">EMAIL</th>
                <th className="px-6 py-4 font-medium tracking-wider">ROLE</th>
                <th className="px-6 py-4 font-medium tracking-wider text-center w-32">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.length > 0 ? (
                currentData.map((item, index) => {
                  const globalIndex =
                    (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                  return (
                    <tr
                      key={item.id_pengguna || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-500">
                        {globalIndex}.
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {item.nama}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {item.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                              item.role === "admin"
                                ? "bg-indigo-100 text-indigo-700"
                                : item.role === "staff_admin"
                                  ? "bg-purple-100 text-purple-700"
                                  : item.role === "staff_produksi"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {item.role
                              ? item.role.replace("_", " ").toUpperCase()
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md border border-gray-200 hover:border-transparent transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {/* Protect admin from deleting themselves roughly, though UI is simple */}
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md border border-gray-200 hover:border-transparent transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    Tidak ada data pengguna
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-gray-500 tracking-wider">
            MENAMPILKAN {currentData.length} DARI {totalItems} PENGGUNA
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

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPengguna}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onEdit={handleEditPengguna}
        initialData={selectedUser}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDeleteUser(null);
        }}
        onDelete={handleDeletePengguna}
        userData={selectedDeleteUser}
      />
    </div>
  );
};

export default UserList;
