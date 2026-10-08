import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import StaffLoginPage from '@/pages/auth/StaffLoginPage';

import StudentDashboard from '@/pages/StudentDashboard';
import ReportItemPage from '@/pages/ReportItemPage';
import FindItemsPage from '@/pages/FindItemsPage';
import ItemDetailsPage from '@/pages/ItemDetailsPage';
import MyReportsPage from '@/pages/MyReportsPage';
import MyClaimsPage from '@/pages/MyClaimsPage';
import ProfilePage from '@/pages/ProfilePage';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminItemsPage from '@/pages/admin/AdminItemsPage';
import AdminClaimsPage from '@/pages/admin/AdminClaimsPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminActionsPage from '@/pages/admin/AdminActionsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/staff-login" element={<StaffLoginPage />} />
          <Route path="/find-items" element={<FindItemsPage />} />
          <Route path="/items/:id" element={<ItemDetailsPage />} />

          {/* Student routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/report-lost" element={
            <ProtectedRoute><ReportItemPage itemType="lost" /></ProtectedRoute>
          } />
          <Route path="/report-found" element={
            <ProtectedRoute><ReportItemPage itemType="found" /></ProtectedRoute>
          } />
          <Route path="/my-reports" element={
            <ProtectedRoute><MyReportsPage /></ProtectedRoute>
          } />
          <Route path="/my-claims" element={
            <ProtectedRoute><MyClaimsPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/items" element={
            <ProtectedRoute adminOnly><AdminItemsPage /></ProtectedRoute>
          } />
          <Route path="/admin/claims" element={
            <ProtectedRoute adminOnly><AdminClaimsPage /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>
          } />
          <Route path="/admin/actions" element={
            <ProtectedRoute adminOnly><AdminActionsPage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
