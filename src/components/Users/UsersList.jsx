import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, User, Shield, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { faker } from '@faker-js/faker';
import { useAuth } from '../../context/AuthContext';

const UsersList = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Dados mock para usuários
  const users = Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    type: faker.helpers.arrayElement(['admin', 'assistente', 'profissional']),
    specialty: faker.helpers.arrayElement(['Psicologia', 'Fisioterapia', 'Terapia Ocupacional', 'Fonoaudiologia']),
    phone: faker.phone.number(),
    createdDate: faker.date.recent({ days: 365 }),
    lastLogin: faker.date.recent({ days: 7 }),
    status: faker.helpers.arrayElement(['Ativo', 'Inativo']),
    patients: faker.number.int({ min: 0, max: 25 }),
    sessions: faker.number.int({ min: 0, max: 150 })
  }));

  const userTypes = ['Todos', 'admin', 'assistente', 'profissional'];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || selectedType === 'Todos' || u.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'assistente': return 'bg-blue-100 text-blue-800';
      case 'profissional': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'admin': return Shield;
      case 'assistente': return UserCheck;
      case 'profissional': return User;
      default: return User;
    }
  };

  const getStatusColor = (status) => {
    return status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'admin': return 'Administrador';
      case 'assistente': return 'Assistente';
      case 'profissional': return 'Profissional';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários do sistema</p>
        </div>
        {hasPermission('create') && user?.type === 'admin' && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            Novo Usuário
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
              placeholder="Buscar usuários..."
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
            {userTypes.map(type => (
              <option key={type} value={type === 'Todos' ? '' : type}>
                {type === 'Todos' ? type : getTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((userData) => {
                const TypeIcon = getTypeIcon(userData.type);
                return (
                  <tr key={userData.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {userData.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                          <div className="text-sm text-gray-500">{userData.email}</div>
                          <div className="text-sm text-gray-500">{userData.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TypeIcon size={16} className="text-gray-400" />
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(userData.type)}`}>
                          {getTypeLabel(userData.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userData.type === 'profissional' ? userData.specialty : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(userData.status)}`}>
                        {userData.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <p>{userData.patients} pacientes</p>
                        <p className="text-gray-500">{userData.sessions} sessões</p>
                        <p className="text-xs text-gray-400">
                          Último login: {format(userData.lastLogin, 'dd/MM HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {hasPermission('update') && user?.type === 'admin' && (
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
          <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.type === 'admin').length}</p>
          <p className="text-sm text-gray-600">Administradores</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.type === 'assistente').length}</p>
          <p className="text-sm text-gray-600">Assistentes</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.type === 'profissional').length}</p>
          <p className="text-sm text-gray-600">Profissionais</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'Ativo').length}</p>
          <p className="text-sm text-gray-600">Usuários Ativos</p>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
