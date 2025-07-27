import React, { useState } from 'react';
import { Plus, Search, Download, FileText, Calendar, User, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { faker } from '@faker-js/faker';
import { useAuth } from '../../context/AuthContext';

const ReportsList = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Dados mock para relatórios
  const reports = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: faker.helpers.arrayElement([
      'Relatório de Evolução Mensal',
      'Avaliação Psicológica',
      'Relatório Fisioterapêutico',
      'Laudo Fonoaudiológico',
      'Relatório de Terapia Ocupacional'
    ]),
    patientName: faker.person.fullName(),
    professionalName: user?.type === 'profissional' ? user.name : faker.person.fullName(),
    type: faker.helpers.arrayElement(['Evolução', 'Avaliação', 'Laudo', 'Relatório Mensal']),
    createdDate: faker.date.recent({ days: 30 }),
    period: `${format(faker.date.recent({ days: 60 }), 'MM/yyyy')} - ${format(faker.date.recent({ days: 30 }), 'MM/yyyy')}`,
    status: faker.helpers.arrayElement(['Rascunho', 'Finalizado', 'Enviado']),
    pages: faker.number.int({ min: 1, max: 15 })
  }));

  const reportTypes = ['Todos', 'Evolução', 'Avaliação', 'Laudo', 'Relatório Mensal'];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || selectedType === 'Todos' || report.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Rascunho': return 'bg-yellow-100 text-yellow-800';
      case 'Finalizado': return 'bg-green-100 text-green-800';
      case 'Enviado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Gerencie relatórios e laudos dos pacientes</p>
        </div>
        <div className="flex gap-2">
          {user?.type === 'admin' && (
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors">
              <Settings size={20} />
              Configurar PDF
            </button>
          )}
          {hasPermission('create') && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <Plus size={20} />
              Novo Relatório
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar relatórios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {reportTypes.map(type => (
              <option key={type} value={type === 'Todos' ? '' : type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                {report.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{report.title}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                <span className="truncate">{report.patientName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>{format(report.createdDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
              <div className="text-sm text-gray-600">
                Período: {report.period}
              </div>
              <div className="text-sm text-gray-600">
                {report.pages} página(s)
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{report.professionalName}</span>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <FileText size={16} />
                </button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PDF Configuration Panel (Admin only) */}
      {user?.type === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração de Relatórios PDF</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Cabeçalho</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo da Clínica</label>
                  <input type="file" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Clínica</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue="Clínica Terapêutica" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="2" defaultValue="Rua das Flores, 123 - Centro" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Campos do Relatório</h4>
              <div className="space-y-2">
                {['Descrição', 'Observações', 'Profissional', 'Data', 'Assinatura'].map(field => (
                  <label key={field} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">{field}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Salvar Configurações
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsList;
