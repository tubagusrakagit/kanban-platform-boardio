// frontend/src/components/ConfirmKickModal.jsx

const ConfirmKickModal = ({ isVisible, onClose, onConfirm }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[60]">
            <div className="bg-[#383838] p-6 rounded-xl shadow-2xl max-w-sm border border-red-600/50">
                <h3 className="text-xl font-bold text-red-400 mb-3">Konfirmasi Penghapusan</h3>
                <p className="text-gray-200 mb-6">
                    Apakah Anda yakin ingin mengeluarkan anggota ini dari proyek? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-gray-400 hover:text-white transition"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition"
                    >
                        Ya, Keluarkan
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmKickModal;