import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Tasks } from './pages/Tasks';
import { Settings } from './pages/Settings';
import { AuthProvider, useAuth } from './components/AuthContext';
import { TimerProvider } from './context/TimerContext';
import './index.css';

import { TimeEntries } from './pages/TimeEntries';

import { Reports } from './pages/Reports';
import { Calendar } from './pages/Calendar';
import { Workload } from './pages/Workload';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', marginTop: '10vh' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>{title}</h1>
    <p style={{ color: 'var(--color-text-secondary)' }}>This module is currently under construction and will be available in the next phase.</p>
  </div>
);

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="time-entries" element={<TimeEntries />} />
        <Route path="settings" element={<Settings />} />
        
        <Route path="calendar" element={<Calendar />} />
        <Route path="workload" element={<Workload />} />
        <Route path="reports" element={<Reports />} />
        <Route path="projects" element={<PlaceholderPage title="Projects" />} />
        <Route path="clients" element={<PlaceholderPage title="Clients" />} />
        <Route path="team" element={<PlaceholderPage title="Team" />} />
        <Route path="workload" element={<PlaceholderPage title="Workload" />} />
        <Route path="capacity" element={<PlaceholderPage title="Capacity" />} />
        <Route path="performance" element={<PlaceholderPage title="Performance" />} />
        <Route path="estimates" element={<PlaceholderPage title="Estimates" />} />
        <Route path="trends" element={<PlaceholderPage title="Trends" />} />
        <Route path="integrations" element={<PlaceholderPage title="Integrations" />} />
      </Route>
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TimerProvider>
          <AppContent />
        </TimerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
