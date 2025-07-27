import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Heart, Clock, Users } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { useAuth } from '../../context/AuthContext';

const TherapyTypesList = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Dados mock para tipos de terapia
  const therapyTypes = [
    {
      id: 1,
      name: 'Psicoterapia Individual',
      category: 'Psicologia',
      duration: 50,
      description: 'Atendimento psicológico individualizado focado nas necessidades específicas do paciente.',
      color: 'bg-blue-500',
      activePatients: 45,
      totalSessions: 234
    },
    {
      id: 2,
      name: 'Terapia de Grupo',
      category: 'Psicologia',
      duration: 90,
      description: 'Sessões em grupo para desenvolvimento de habilidades sociais e compartilhamento de experiências.',
      color: 'bg-green-500',
      activePatients: 18,
      totalSessions: 67
    },
    {
      id: 3,
      name: 'Fisioterapia Respiratória',
      category: 'Fisioterapia',
      duration: 60,
      description: 'Tratamento focado na melhoria da função respiratória e capacidade pulmonar.',
      color: 'bg-red-500',
      activePatients: 32,
      totalSessions: 156
    },
    {
      id: 4,
      name: 'Fisioterapia Motora',
      category: 'Fisioterapia',
      duration: 45,
      description: 'Reabilitação e fortalecimento do sistema musculoesquelético.',
      color: 'bg-orange-500',
      activePatients: 28,
      totalSessions: 189
    },
    {
      id: 5,
      name: 'Terapia Ocupacional Infantil',
      category: 'Terapia Ocupacional',
      duration: 45,
      description: 'Desenvolvimento de habilidades funcionais e autonomia em crianças.',
      color: 'bg-purple-500',
      activePatients: 24,
      totalSessions: 142
    },
    {
      id: 6,
      name: 'Fonoaudiologia Clínica',
      category: 'Fonoaudiologia',
      duration: 40,
      description: 'Avaliação e tratamento de distúrbios da comunicação e deglutição.',
      color: 'bg-pink-500',
      activePatients: 19,
      totalSessions: 98
    },
    {
      id: 7,
      name: 'Audiologia',
      category: 'Fonoaudiologia',
      duration: 30,
      description: 'Avaliação auditiva e adaptação de aparelhos auditivos.',
      color: 'bg-indigo-500',
      activePatients: 15,
      totalSessions: 67
    }
  ];

  const categories = ['Todas', 'Psicologia', 'Fisioterapia', 'Terapia Ocupacional', 'Fonoaudiologia'];
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredTypes = therapyTypes.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'Todas' || type.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Terapia</h1>
          <p className="text-gray-600">Gerencie as modalidades terapêuticas oferecidas</p>
        </div>
        {hasPermission('create') && user?.type !== 'profissional' && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            Novo Tipo
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
              placeholder="Buscar tipos de terapia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category === 'Todas' ? '' : category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Therapy Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTypes.map(type => (
          <div key={type.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center`}>
                <Heart className="w-6 h-6 text-white" />
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

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
            
            <div className="flex items-center gap-4 mb-3">
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                {type.category}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock size={14} />
                <span>{type.duration} min</span>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{type.description}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users size={14} className="text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900">{type.activePatients}</p>
                <p className="text-xs text-gray-600">Pacientes Ativos</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Heart size={14} className="text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900">{type.totalSessions}</p>
                <p className="text-xs text-gray-600">Total de Sessões</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas por Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {categories.slice(1).map(category => {
            const categoryTypes = therapyTypes.filter(t => t.category === category);
            const totalPatients = categoryTypes.reduce((sum, t) => sum + t.activePatients, 0);
            const totalSessions = categoryTypes.reduce((sum, t) => sum + t.totalSessions, 0);
            
            return (
              <div key={category} className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{categoryTypes.length}</p>
                    <p className="text-xs text-gray-600">Tipos</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-600">{totalPatients}</p>
                    <p className="text-xs text-gray-600">Pacientes</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-purple-600">{totalSessions}</p>
                    <p className="text-xs text-gray-600">Sessões</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TherapyTypesList;
