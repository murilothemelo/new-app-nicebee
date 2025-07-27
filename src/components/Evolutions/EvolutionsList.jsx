import React, { useState } from 'react';
import { Plus, Search, FileText, User, Calendar, Edit, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { faker } from '@faker-js/faker';
import { useAuth } from '../../context/AuthContext';

const EvolutionsList = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');

  // Dados mock para evoluções
  const evolutions = Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    patientName: faker.person.fullName(),
    patientId: faker.number.int({ min: 1, max: 100 }),
    professionalName: user?.type === 'profissional' ? user.name : faker.person.fullName(),
    therapyType: faker.helpers.arrayElement(['Psicoterapia Individual', 'Fisioterapia', 'Terapia Ocupacional', 'Fonoaudiologia']),
    date: faker.date.recent({ days: 30 }),
    sessionNumber: faker.number.int({ min: 1, max: 50 }),
    description: faker.lorem.paragraphs(2),
    objectives: faker.lorem.sentences(3),
    observations: faker.lorem.paragraph(),
    nextSession: faker.lorem.sentence(),
    attachments: faker.number.int({ min: 0, max: 3 })
  }));

  const patients = [...new Set(evolutions.map(e => e.patientName))];

  const filteredEvolutions = evolutions.filter(evolution => {
    const matchesSearch = evolution.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evolution.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatient = !selectedPatient || evolution.patientName === selectedPatient;
    return matchesSearch && matchesPatient;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evoluções</h1>
          <p className="text-gray-600">Registros de evolução dos pacientes</p>
        </div>
        {hasPermission('create') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            Nova Evolução
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar evoluções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os pacientes</option>
            {patients.map(patient => (
              <option key={patient} value={patient}>{patient}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Evolutions List */}
      <div className="space-y-4">
        {filteredEvolutions.map(evolution => (
          <div key={evolution.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {evolution.patientName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{evolution.patientName}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{evolution.professionalName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={16} />
                        <span>{evolution.therapyType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{format(evolution.date, 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        Sessão #{evolution.sessionNumber}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Descrição da Sessão:</h4>
                      <p className="text-gray-700 text-sm line-clamp-3">{evolution.description}</p>
                    </div>
                    {evolution.observations && (
                      <div className="mt-3">
                        <h4 className="font-medium text-gray-900 mb-1">Observações:</h4>
                        <p className="text-gray-700 text-sm">{evolution.observations}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {evolution.attachments > 0 && (
                  <span className="text-xs text-gray-500 mb-2">
                    {evolution.attachments} anexo(s)
                  </span>
                )}
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Eye size={16} />
                  </button>
                  {hasPermission('update') && (
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                      <Edit size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium">1</span> a <span className="font-medium">10</span> de{' '}
          <span className="font-medium">{filteredEvolutions.length}</span> resultados
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            Anterior
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvolutionsList;
