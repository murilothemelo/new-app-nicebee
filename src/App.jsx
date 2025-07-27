import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import PatientList from './components/Patients/PatientList';
import AgendaView from './components/Agenda/AgendaView';
import EvolutionsList from './components/Evolutions/EvolutionsList';
import ReportsList from './components/Reports/ReportsList';
import CommunityView from './components/Community/CommunityView';
import MedicalPlansList from './components/MedicalPlans/MedicalPlansList';
import TherapyTypesList from './components/TherapyTypes/TherapyTypesList';
import CompanionsList from './components/Companions/CompanionsList';
import UsersList from './components/Users/UsersList';
import ProfileSettings from './components/Profile/ProfileSettings';
import MedicalRecords from './components/Records/MedicalRecords';

// Componente de proteção de rotas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="pacientes" element={<PatientList />} />
          <Route path="prontuario" element={<MedicalRecords />} />
          <Route path="agenda" element={<AgendaView />} />
          <Route path="evolucoes" element={<EvolutionsList />} />
          <Route path="relatorios" element={<ReportsList />} />
          <Route path="comunidade" element={<CommunityView />} />
          <Route path="planos" element={<MedicalPlansList />} />
          <Route path="tipos-terapia" element={<TherapyTypesList />} />
          <Route path="acompanhantes" element={<CompanionsList />} />
          <Route path="usuarios" element={<UsersList />} />
          <Route path="perfil" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
