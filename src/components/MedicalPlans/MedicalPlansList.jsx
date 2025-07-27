import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, CreditCard, Phone, Mail } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { useAuth } from '../../context/AuthContext';

const MedicalPlansList = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Dados mock para planos médicos
  const plans = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    name: faker.company.name() + ' Saúde',
    values: {
      psicologia: faker.number.float({ min: 80, max: 200, fractionDigits: 2 }),
      fisioterapia: faker.number.float({ min: 60, max: 150, fractionDigits: 2 }),
      terapiaOcupacional: faker.number.float({ min: 70, max: 180, fractionDigits: 2 }),
      fonoaudiologia: faker.number.float({ min: 65, max: 160, fractionDigits: 2 })
    },
    phone: faker.phone.number(),
    email: faker.internet.email(),
    startDate: faker.date.past({ years: 2 }),
    status: faker.helpers.arrayElement(['Ativo', 'Inativo', 'Suspenso']),
    coverage: faker.helpers.arrayElement(['Nacional', 'Regional', 'Local']),
    patients: faker.number.int({ min: 5, max: 50 })
  }));

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Inativo': return 'bg-red-100 text-red-800';
      case 'Suspenso': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planos Médicos</h1>
          <p className="text-gray-600">Gerencie convênios e planos de saúde</p>
        </div>
        {hasPermission('create') && user?.type !== 'profissional' && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            Novo Plano
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar planos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                    {plan.status}
                  </span>
                </div>
              </div>
              {hasPermission('update') && user?.type !== 'profissional' && (
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
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500">Psicologia</p>
                  <p className="text-sm font-semibold text-gray-900">R$ {plan.values.psicologia.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500">Fisioterapia</p>
                  <p className="text-sm font-semibold text-gray-900">R$ {plan.values.fisioterapia.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500">T. Ocupacional</p>
                  <p className="text-sm font-semibold text-gray-900">R$ {plan.values.terapiaOcupacional.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-500">Fonoaudiologia</p>
                  <p className="text-sm font-semibold text-gray-900">R$ {plan.values.fonoaudiologia.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Phone size={14} />
                  <span>{plan.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Mail size={14} />
                  <span>{plan.email}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Cobertura: {plan.coverage}</span>
                  <span className="text-gray-500">{plan.patients} pacientes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo dos Planos</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{plans.filter(p => p.status === 'Ativo').length}</p>
            <p className="text-sm text-gray-600">Planos Ativos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{plans.filter(p => p.status === 'Inativo').length}</p>
            <p className="text-sm text-gray-600">Planos Inativos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{plans.reduce((sum, p) => sum + p.patients, 0)}</p>
            <p className="text-sm text-gray-600">Total de Pacientes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              R$ {(plans.reduce((sum, p) => sum + p.values.psicologia, 0) / plans.length).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Valor Médio (Psicologia)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalPlansList;
