import React, { useState } from 'react';
import { Send, Search, User, MessageCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { faker } from '@faker-js/faker';
import { useAuth } from '../../context/AuthContext';

const CommunityView = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [newComment, setNewComment] = useState('');

  // Dados mock para comentários da comunidade
  const comments = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    patientName: faker.person.fullName(),
    patientId: faker.number.int({ min: 1, max: 100 }),
    authorName: faker.person.fullName(),
    authorType: faker.helpers.arrayElement(['admin', 'assistente', 'profissional']),
    message: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
    date: faker.date.recent({ days: 30 }),
    isUrgent: faker.datatype.boolean(),
    category: faker.helpers.arrayElement(['Evolução', 'Observação', 'Dúvida', 'Alerta'])
  }));

  const patients = [...new Set(comments.map(c => c.patientName))];

  const filteredComments = comments.filter(comment => {
    if (user?.type === 'profissional') {
      // Profissional vê apenas comentários de seus pacientes
      return true; // Aqui seria filtrado pelos pacientes do profissional
    }
    if (selectedPatient) {
      return comment.patientName === selectedPatient;
    }
    return true;
  });

  const getAuthorColor = (type) => {
    switch (type) {
      case 'admin': return 'bg-red-500';
      case 'assistente': return 'bg-blue-500';
      case 'profissional': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Evolução': return 'bg-blue-100 text-blue-800';
      case 'Observação': return 'bg-green-100 text-green-800';
      case 'Dúvida': return 'bg-yellow-100 text-yellow-800';
      case 'Alerta': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      // Aqui seria feita a chamada para a API
      console.log('Novo comentário:', newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comunidade do Paciente</h1>
          <p className="text-gray-600">Discussões e comentários sobre pacientes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar discussões..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          {user?.type !== 'profissional' && (
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
          )}
        </div>
      </div>

      {/* New Comment Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Comentário</h3>
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Selecionar paciente</option>
              {patients.map(patient => (
                <option key={patient} value={patient}>{patient}</option>
              ))}
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Categoria</option>
              <option value="Evolução">Evolução</option>
              <option value="Observação">Observação</option>
              <option value="Dúvida">Dúvida</option>
              <option value="Alerta">Alerta</option>
            </select>
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva seu comentário..."
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">Marcar como urgente</span>
            </label>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Send size={16} />
              Publicar
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map(comment => (
          <div key={comment.id} className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${comment.isUrgent ? 'border-l-4 border-l-red-500' : ''}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 ${getAuthorColor(comment.authorType)} rounded-full flex items-center justify-center text-white font-bold`}>
                {comment.authorName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">{comment.authorName}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(comment.category)}`}>
                      {comment.category}
                    </span>
                    {comment.isUrgent && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        URGENTE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>{format(comment.date, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <User size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Paciente: {comment.patientName}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{comment.message}</p>
                <div className="flex items-center gap-4 mt-4">
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm">
                    <MessageCircle size={16} />
                    Responder
                  </button>
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
          <span className="font-medium">{filteredComments.length}</span> resultados
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

export default CommunityView;
