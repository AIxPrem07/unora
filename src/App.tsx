import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';



// Pages
import Home from './pages/dashboard/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Profile from './pages/dashboard/Profile';
import Capture from './pages/dashboard/Capture';
import Albums from './pages/dashboard/Albums';
import Explore from './pages/dashboard/Explore';
import Saved from './pages/dashboard/Saved';
import Notifications from './pages/dashboard/Notifications';

// Simple Route Guard Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen w-screen bg-[#F6F0D7] flex items-center justify-center">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/profile/:id?" element={<Profile />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/capture" element={<ProtectedRoute><Capture /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/albums" element={<ProtectedRoute><Albums /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}