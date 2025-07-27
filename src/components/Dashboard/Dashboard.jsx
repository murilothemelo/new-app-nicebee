import React from 'react';
import { Users, Calendar, FileText, Heart, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  // Dados mock - substituir por dados reais da API
  const getStatsForUser = () => {
    if (user?.type === 'profissional') {
      return [
        { title: 'Meus Pacientes', value: '12', icon: Users, color: 'bg-blue-500' },
        { title: 'Consultas Hoje', value: '5', icon: Calendar, color: 'bg-green-500' },
        { title: 'Evoluções Pendentes', value: '3', icon: FileText, color: 'bg-yellow-500' },
        { title: 'Próxima Consulta', value: '14:30', icon: Clock, color: 'bg-purple-500' }
      ];
    } else {
      return [
        { title: 'Total de Pacientes', value: '87', icon: Users, color: 'bg-blue-500' },
        { title: 'Consultas Hoje', value: '23', icon: Calendar, color: 'bg-green-500' },
        { title: 'Profissionais Ativos', value: '8', icon: Heart, color: 'bg-red-500' },
        { title: 'Taxa de Ocupação', value: '92%', icon: TrendingUp, color: 'bg-purple-500' }
      ];
    }
  };

  const stats = getStatsForUser();

  const recentActivities = [
    { id: 1, action: 'Nova evolução registrada', patient: 'Maria Santos', time: '2h atrás', type: 'evolution' },
    { id: 2, action: 'Consulta agendada', patient: 'João Silva', time: '3h atrás', type: 'appointment' },
    { id: 3, action: 'Documento adicionado', patient: 'Ana Costa', time: '5h atrás', type: 'document' },
    { id: 4, action: 'Relatório gerado', patient: 'Carlos Oliveira', time: '1 dia atrás', type: 'report' }
  ];

  const upcomingAppointments = [
    { id: 1, patient: 'Maria Santos', time: '14:30', therapy: 'Psicoterapia Individual' },
    { id: 2, patient: 'João Silva', time: '15:30', therapy: 'Fisioterapia' },
    { id: 3, patient: 'Ana Costa', time: '16:00', therapy: 'Terapia Ocupacional' },
    { id: 4, patient: 'Carlos Oliveira', time: '17:00', therapy: 'Fonoaudiologia' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bom dia, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          Aqui está um resumo das suas atividades de hoje.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'evolution' ? 'bg-blue-500' :
                  activity.type === 'appointment' ? 'bg-green-500' :
                  activity.type === 'document' ? 'bg-yellow-500' : 'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.patient}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Consultas</h3>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{appointment.patient}</p>
                  <p className="text-xs text-gray-600">{appointment.therapy}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">{appointment.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
