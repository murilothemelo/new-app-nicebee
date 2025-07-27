import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, Phone, Mail, User } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { useAuth } from '../../context/AuthContext';

const CompanionsList = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Dados mock para acompanhantes
  const companions = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    relationship: faker.helpers.arrayElement(['Pai', 'Mãe', 'Avô', 'Avó', 'Tio', 'Tia', 'Irmão', 'Irmã', 'Cuidador']),
    patientName: faker.person.fullName(),
    patientId: faker.number.int({ min: 1, max: 100 }),
    emergencyContact: faker.datatype.boolean(),
    notes: faker.lorem.sentence(),
    createdDate: faker.date.recent({ days: 180 })
  }));

  const filteredCompanions = companions.filter(companion =>
    companion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    companion.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    companion.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Acompanhantes Terapêuticos</h1>
          <p className="text-gray-600">Gerencie os acompanhantes dos pacientes</p>
        </div>
        {hasPermission('create') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            Novo Acompanhante
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar acompanhantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Companions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanions.map(companion => (
          <div key={companion.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {companion.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{companion.name}</h3>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {companion.relationship}
                  </span>
                  {companion.emergencyContact && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full ml-1">
                      Emergência
                    </span>
                  )}
                </div>
              </div>
              {hasPermission('update') && (
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                <span>Paciente: <span className="font-medium">{companion.patientName}</span></span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>{companion.phone}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} />
                <span className="truncate">{companion.email}</span>
              </div>

              {companion.notes && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Observações:</span> {companion.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo dos Acompanhantes</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{companions.length}</p>
            <p className="text-sm text-gray-600">Total de Acompanhantes</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{companions.filter(c => c.emergencyContact).length}</p>
            <p className="text-sm text-gray-600">Contatos de Emergência</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <User className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{[...new Set(companions.map(c => c.patientId))].length}</p>
            <p className="text-sm text-gray-600">Pacientes com Acompanhante</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Object.values(companions.reduce((acc, c) => {
                acc[c.relationship] = (acc[c.relationship] || 0) + 1;
                return acc;
              }, {})).reduce((a, b) => Math.max(a, b), 0)}
            </p>
            <p className="text-sm text-gray-600">Relação Mais Comum</p>
          </div>
        </div>
      </div>

      {/* Relationship Statistics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Parentesco</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(companions.reduce((acc, companion) => {
            acc[companion.relationship] = (acc[companion.relationship] || 0) + 1;
            return acc;
          }, {})).map(([relationship, count]) => (
            <div key={relationship} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600">{relationship}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanionsList;
