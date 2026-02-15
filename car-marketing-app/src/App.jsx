import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuoterPage from './pages/QuoterPage';
import ConfigurationPage from './pages/ConfigurationPage';
import CRMPage from './pages/CRMPage';


export default function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center overflow-hidden">
          <div className="text-[15vw] font-black text-slate-900/5 -rotate-45 select-none whitespace-nowrap">
            DEMO VERSION
          </div>
        </div>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quoter"
            element={
              <ProtectedRoute>
                <QuoterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuration"
            element={
              <ProtectedRoute>
                <ConfigurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm"
            element={
              <ProtectedRoute>
                <CRMPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
