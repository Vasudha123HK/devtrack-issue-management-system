import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Issues } from './pages/Issues';
import { CreateIssue } from './pages/CreateIssue';
import { EditIssue } from './pages/EditIssue';
import { IssueDetails } from './pages/IssueDetails';
import { Users } from './pages/Users';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth Layout Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected App Layout Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/new" element={<CreateIssue />} />
          <Route path="/issues/:id" element={<IssueDetails />} />
          <Route path="/issues/:id/edit" element={<EditIssue />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Protected Routes */}
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />

          {/* 404 Fallback inside workspace layout */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
