import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/auth/Login';
import MicrosoftCallback from './pages/auth/MicrosoftCallback';
import ForgotPassword from './pages/auth/ForgotPassword';
import EmployeeDashboard from './pages/employee/Dashboard';
import Goals from './pages/employee/Goals';
import QuarterlyUpdates from './pages/employee/QuarterlyUpdates';
import TeamDashboard from './pages/manager/TeamDashboard';
import GoalApproval from './pages/manager/GoalApproval';
import CheckinReview from './pages/manager/CheckinReview';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';
import AuditLogs from './pages/admin/AuditLogs';
import Escalations from './pages/admin/Escalations';
import Reports from './pages/admin/Reports';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-white',
              style: { borderRadius: '12px', padding: '12px 16px' },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/microsoft/callback" element={<MicrosoftCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/quarterly" element={<QuarterlyUpdates />} />

              <Route path="/manager/team" element={<ProtectedRoute roles={['manager', 'admin']}><TeamDashboard /></ProtectedRoute>} />
              <Route path="/manager/approvals" element={<ProtectedRoute roles={['manager', 'admin']}><GoalApproval /></ProtectedRoute>} />
              <Route path="/manager/checkins" element={<ProtectedRoute roles={['manager', 'admin']}><CheckinReview /></ProtectedRoute>} />

              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><Analytics /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
              <Route path="/admin/audit" element={<ProtectedRoute roles={['admin']}><AuditLogs /></ProtectedRoute>} />
              <Route path="/admin/escalations" element={<ProtectedRoute roles={['admin']}><Escalations /></ProtectedRoute>} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
