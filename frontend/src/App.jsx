// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // <-- GANTI DARI Header KE Sidebar
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // Asumsi Anda punya ini
import DashboardPage from './pages/DashboardPage';
import KanbanBoard from './pages/KanbanBoard';
import JoinProjectPage from './pages/JoinProjectPage';

const PrivateRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? children : <Navigate to="/login" />;
};

function App() {
  // Cek apakah user ada di halaman login/register
  const isAuthPage = ['/login', '/register'].includes(window.location.pathname);
  const userInfo = localStorage.getItem('userInfo');
  
  // Tentukan apakah sidebar aktif
  const showSidebar = userInfo && !isAuthPage;

  return (
    <Router>
      <div className="min-h-screen bg-[#2c2c2c] font-sans text-white">
        
        {/* RENDER SIDEBAR JIKA LOGIN */}
        {showSidebar && <Sidebar />}

        {/* KONTEN UTAMA */}
        {/* ml-64 memberikan margin kiri sebesar lebar sidebar (256px) agar konten tidak tertutup */}
        <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'ml-64' : 'ml-0'}`}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/board/:projectId" 
              element={
                <PrivateRoute>
                  <KanbanBoard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/invite/:token" 
              element={
                  <PrivateRoute>
                      <JoinProjectPage />
                  </PrivateRoute>
    } 
/>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;