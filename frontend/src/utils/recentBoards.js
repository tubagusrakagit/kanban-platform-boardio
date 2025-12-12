// frontend/src/utils/recentBoards.js
const RECENT_BOARDS_KEY = 'recentBoards';
const MAX_RECENT_BOARDS = 5;

// Mendapatkan daftar board terbaru
export const getRecentBoards = () => {
    const json = localStorage.getItem(RECENT_BOARDS_KEY);
    return json ? JSON.parse(json) : [];
};

// Menambahkan board ke riwayat akses
export const addRecentBoard = (projectId, projectName) => {
    if (!projectId || !projectName) return;

    let recentBoards = getRecentBoards();
    
    // 1. Hapus jika board sudah ada
    recentBoards = recentBoards.filter(board => board.id !== projectId);

    // 2. Tambahkan board baru
    const newBoard = { id: projectId, name: projectName, accessedAt: Date.now() };
    recentBoards.unshift(newBoard);

    // 3. Batasi jumlah
    recentBoards = recentBoards.slice(0, MAX_RECENT_BOARDS);

    // 4. Simpan kembali
    localStorage.setItem(RECENT_BOARDS_KEY, JSON.stringify(recentBoards));
};

// --- PASTIKAN BAGIAN INI ADA! ---
export const clearRecentBoards = () => {
    localStorage.removeItem(RECENT_BOARDS_KEY);
};