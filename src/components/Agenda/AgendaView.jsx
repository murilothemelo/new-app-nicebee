import React, { useState } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, User } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { faker } from '@faker-js/faker';
import { useAuth } from '../../context/AuthContext';

const AgendaView = () => {
  const { user, hasPermission } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');

  // Dados mock para agenda
  const appointments = Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    patientName: faker.person.fullName(),
    patientId: faker.number.int({ min: 1, max: 100 }),
    professionalName: user?.type === 'profissional' ? user.name : faker.person.fullName(),
    professionalId: user?.type === 'profissional' ? user.id : faker.number.int({ min: 1, max: 10 }),
    therapyType: faker.helpers.arrayElement(['Psicoterapia Individual', 'Fisioterapia', 'Terapia Ocupacional', 'Fonoaudiologia', 'Terapia de Grupo']),
    date: faker.date.between({ from: addDays(new Date(), -3), to: addDays(new Date(), 10) }),
    startTime: faker.helpers.arrayElement(['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']),
    duration: 60,
    status: faker.helpers.arrayElement(['Agendado', 'Confirmado', 'Cancelado', 'Concluído']),
    frequency: faker.helpers.arrayElement(['Única', 'Semanal', 'Quinzenal', 'Mensal']),
    notes: faker.lorem.sentence()
  }));

  const weekStart = startOfWeek(currentDate, { locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const getStatusColor = (status) => {
    switch (status) {
      case 'Agendado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Confirmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
      case 'Concluído': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAppointmentsForDay = (date) => {
    return appointments.filter(apt => isSameDay(apt.date, date));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Gerencie os agendamentos da clínica</p>
        </div>
        {hasPermission('create') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            Novo Agendamento
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              ← Anterior
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {format(weekStart, 'dd/MM', { locale: ptBR })} - {format(addDays(weekStart, 6), 'dd/MM/yyyy', { locale: ptBR })}
            </h3>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              Próximo →
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Dia
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 gap-0">
          {/* Headers */}
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-4 border-b border-r border-gray-200 bg-gray-50">
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500 uppercase">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className={`text-lg font-semibold mt-1 ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            </div>
          ))}

          {/* Time slots */}
          {Array.from({ length: 10 }, (_, hour) => {
            const timeSlot = `${8 + hour}:00`;
            return weekDays.map(day => {
              const dayAppointments = getAppointmentsForDay(day).filter(apt => apt.startTime === timeSlot);
              return (
                <div key={`${day.toISOString()}-${timeSlot}`} className="p-2 border-b border-r border-gray-200 min-h-[80px] relative">
                  <div className="text-xs text-gray-500 mb-1">{timeSlot}</div>
                  {dayAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className={`p-2 rounded text-xs border ${getStatusColor(appointment.status)} mb-1 cursor-pointer hover:shadow-sm`}
                    >
                      <div className="font-medium truncate">{appointment.patientName}</div>
                      <div className="truncate">{appointment.therapyType}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <User size={10} />
                        <span className="truncate">{appointment.professionalName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Agendamentos</h3>
        <div className="space-y-3">
          {appointments.slice(0, 5).map(appointment => (
            <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {appointment.patientName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{appointment.patientName}</p>
                  <p className="text-sm text-gray-600">{appointment.therapyType}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {format(appointment.date, 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    <Clock size={14} className="text-gray-400 ml-2" />
                    <span className="text-xs text-gray-500">{appointment.startTime}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
                {hasPermission('update') && (
                  <div className="flex gap-1">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit size={16} />
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgendaView;
