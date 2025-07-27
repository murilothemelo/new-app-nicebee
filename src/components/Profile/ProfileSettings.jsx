import React, { useState } from 'react';
import { Save, Camera, Lock, User, Mail, Phone, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.specialty || '',
    specialty: user?.specialty || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [pdfSettings, setPdfSettings] = useState({
    clinicName: 'Clínica Terapêutica',
    clinicAddress: 'Rua das Flores, 123 - Centro',
    logoUrl: '',
    showDescription: true,
    showObservations: true,
    showProfessional: true,
    showDate: true,
    showSignature: true,
    headerColor: '#3B82F6',
    fontFamily: 'Arial',
    fontSize: '12'
  });

  const handlePersonalSubmit = (e) => {
    e.preventDefault();
    // Aqui seria feita a chamada para a API
    console.log('Dados pessoais atualizados:', formData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    // Aqui seria feita a chamada para a API
    console.log('Senha alterada');
  };

  const handlePdfSubmit = (e) => {
    e.preventDefault();
    // Aqui seria feita a chamada para a API
    console.log('Configurações PDF salvas:', pdfSettings);
  };

  const tabs = [
    { id: 'personal', label: 'Dados Pessoais', icon: User },
    { id: 'password', label: 'Alterar Senha', icon: Lock },
    ...(user?.type === 'admin' ? [{ id: 'pdf', label: 'Config. PDF', icon: Settings }] : [])
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e configurações</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
              user?.type === 'admin' ? 'bg-red-100 text-red-800' :
              user?.type === 'assistente' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user?.type === 'admin' ? 'Administrador' :
               user?.type === 'assistente' ? 'Assistente' : 
               `Profissional - ${user?.specialty}`}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Data Tab */}
          {activeTab === 'personal' && (
            <form onSubmit={handlePersonalSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {user?.type === 'profissional' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especialidade
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecionar especialidade</option>
                      <option value="Psicologia">Psicologia</option>
                      <option value="Fisioterapia">Fisioterapia</option>
                      <option value="Terapia Ocupacional">Terapia Ocupacional</option>
                      <option value="Fonoaudiologia">Fonoaudiologia</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} />
                  Salvar Alterações
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} />
                  Alterar Senha
                </button>
              </div>
            </form>
          )}

          {/* PDF Configuration Tab (Admin only) */}
          {activeTab === 'pdf' && user?.type === 'admin' && (
            <form onSubmit={handlePdfSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Cabeçalho</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Clínica
                    </label>
                    <input
                      type="text"
                      value={pdfSettings.clinicName}
                      onChange={(e) => setPdfSettings({...pdfSettings, clinicName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço
                    </label>
                    <textarea
                      value={pdfSettings.clinicAddress}
                      onChange={(e) => setPdfSettings({...pdfSettings, clinicAddress: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo da Clínica
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Campos do Relatório</h3>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'showDescription', label: 'Descrição' },
                      { key: 'showObservations', label: 'Observações' },
                      { key: 'showProfessional', label: 'Profissional' },
                      { key: 'showDate', label: 'Data' },
                      { key: 'showSignature', label: 'Assinatura' }
                    ].map(field => (
                      <label key={field.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={pdfSettings[field.key]}
                          onChange={(e) => setPdfSettings({...pdfSettings, [field.key]: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{field.label}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor do Cabeçalho
                    </label>
                    <input
                      type="color"
                      value={pdfSettings.headerColor}
                      onChange={(e) => setPdfSettings({...pdfSettings, headerColor: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fonte
                    </label>
                    <select
                      value={pdfSettings.fontFamily}
                      onChange={(e) => setPdfSettings({...pdfSettings, fontFamily: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Helvetica">Helvetica</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} />
                  Salvar Configurações
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
