import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MyTickets from './pages/employee/MyTickets';
import TicketDetail from './pages/employee/TicketDetail';
import MyPerformance from './pages/employee/MyPerformance';
import Leaderboard from './pages/employee/Leaderboard';
import Dashboard from './pages/admin/Dashboard';
import CreateTicket from './pages/admin/CreateTicket';
import Departments from './pages/admin/Departments';
import Employees from './pages/admin/Employees';
import AllTickets from './pages/admin/AllTickets';
import AIReports from './pages/admin/AIReports';

import { useState } from 'react';

const AppShell = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return children; // Login/Register render with no chrome

  return (
    <>
      <Navbar onMobileMenuToggle={() => setMobileOpen((prev) => !prev)} />
      <div className="app-body">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <main className="app-content" key={location.pathname}>
          {children}
        </main>
      </div>
    </>
  );
};


// Admins land on the Dashboard; employees land on their quick-links Home
const RoleHome = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <Dashboard /> : <Home />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance"
              element={
                <ProtectedRoute>
                  <MyPerformance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-ticket"
              element={
                <ProtectedRoute adminOnly>
                  <CreateTicket />
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <ProtectedRoute adminOnly>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute adminOnly>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-tickets"
              element={
                <ProtectedRoute adminOnly>
                  <AllTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-reports"
              element={
                <ProtectedRoute adminOnly>
                  <AIReports />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
        <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
