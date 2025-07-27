import React, { useState } from 'react';
import { Upload, Download, Eye, Trash2, Search, Filter, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { faker } from '@faker-js/faker';
import { useAuth } from '../../context/AuthContext';

const MedicalRecords = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');

  // Dados mock para prontuário eletrônico
  const records = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    patientName: faker.person.fullName(),
    patientId: faker.number.int({ min: 1, max: 100 }),
    documentName: faker.helpers.arrayElement([
      'Laudo Psicológico',
      'Avaliação Fisioterapêutica',
      'Relatório de Evolução',
      'Exames Médicos',
      'Prescrição Médica',
      'Atestado',
      'Receituário'
    ]),
    type: faker.helpers.arrayElement(['documento', 'laudo', 'avaliacao', 'outro']),
    description: faker.lorem.sentence(),
    professionalName: user?.type === 'profissional' ? user.name : faker.person.fullName(),
    uploadDate: faker.date.recent({ days: 90 }),
    fileSize: faker.number.float({ min: 0.1, max: 5.0, fractionDigits: 1 }),
    fileExtension: faker.helpers.arrayElement(['pdf', 'doc', 'jpg', 'png'])
  }));

  const documentTypes = ['Todos', 'documento', 'laudo', 'avaliacao', 'outro'];
  const patients = [...new Set(records.map(r => r.patientName))];

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || selectedType === 'Todos' || record.type === selectedType;
    const matchesPatient = !selectedPatient || record.patientName === selectedPatient;
    
    // Filtro por permissão do profissional
    if (user?.type === 'profissional') {
      // Aqui seria verificado se o documento pertence aos pacientes do profissional
      return matchesSearch && matchesType && matchesPatient;
    }
    
    return matchesSearch && matchesType && matchesPatient;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'documento': return 'bg-blue-100 text-blue-800';
      case 'laudo': return 'bg-green-100 text-green-800';
      case 'avaliacao': return 'bg-yellow-100 text-yellow-800';
      case 'outro': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'documento': return 'Documento';
      case 'laudo': return 'Laudo';
      case 'avaliacao': return 'Avaliação';
      case 'outro': return 'Outro';
      default: return type;
    }
  };

  const getFileIcon = (extension) => {
    switch (extension.toLowerCase()) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      default: return '📎';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prontuário Eletrônico</h1>
          <p className="text-gray-600">Gerencie documentos e arquivos dos pacientes</p>
        </div>
        {hasPermission('create') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Upload size={20} />
            Upload Documento
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar documentos..."
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
            {documentTypes.map(type => (
              <option key={type} value={type === 'Todos' ? '' : type}>
                {type === 'Todos' ? type : getTypeLabel(type)}
              </option>
            ))}
          </select>

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

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-dashed">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Adicionar Documento</h3>
          <p className="text-gray-600 mb-4">Arraste e solte arquivos aqui ou clique para selecionar</p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Selecionar Arquivo
            </button>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">Tipo de documento</option>
              <option value="documento">Documento</option>
              <option value="laudo">Laudo</option>
              <option value="avaliacao">Avaliação</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map(record => (
          <div key={record.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getFileIcon(record.fileExtension)}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{record.documentName}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(record.type)}`}>
                    {getTypeLabel(record.type)}
                  </span>
                </div>
              </div>
              {hasPermission('delete') && (
                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Paciente:</span> {record.patientName}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Profissional:</span> {record.professionalName}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">{record.description}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{format(record.uploadDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
              <span>{record.fileSize} MB</span>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-100">
                <Eye size={16} />
                Visualizar
              </button>
              <button className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-green-100">
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas do Prontuário</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{records.length}</p>
            <p className="text-sm text-gray-600">Total de Documentos</p>
          </div>
          
          {documentTypes.slice(1).map(type => (
            <div key={type} className="text-center">
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {records.filter(r => r.type === type).length}
              </p>
              <p className="text-sm text-gray-600">{getTypeLabel(type)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
