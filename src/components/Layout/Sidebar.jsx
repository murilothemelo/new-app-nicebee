import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Calendar, 
  FileText, 
  MessageSquare, 
  CreditCard,
  Heart,
  UserCheck,
  Settings,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/', 
      permission: 'read' 
    },
    { 
      icon: Users, 
      label: 'Pacientes', 
      path: '/pacientes', 
      permission: 'read' 
    },
    { 
      icon: FolderOpen, 
      label: 'Prontuário', 
      path: '/prontuario', 
      permission: 'read' 
    },
    { 
      icon: Calendar, 
      label: 'Agenda', 
      path: '/agenda', 
      permission: 'read' 
    },
    { 
      icon: FileText, 
      label: 'Evoluções', 
      path: '/evolucoes', 
      permission: 'read' 
    },
    { 
      icon: FileText, 
      label: 'Relatórios', 
      path: '/relatorios', 
      permission: 'read' 
    },
    { 
      icon: MessageSquare, 
      label: 'Comunidade', 
      path: '/comunidade', 
      permission: 'read' 
    },
    { 
      icon: CreditCard, 
      label: 'Planos Médicos', 
      path: '/planos', 
      permission: 'read',
      adminOnly: true 
    },
    { 
      icon: Heart, 
      label: 'Tipos de Terapia', 
      path: '/tipos-terapia', 
      permission: 'read',
      adminOnly: true 
    },
    { 
      icon: UserCheck, 
      label: 'Acompanhantes', 
      path: '/acompanhantes', 
      permission: 'read' 
    },
    { 
      icon: UserPlus, 
      label: 'Usuários', 
      path: '/usuarios', 
      permission: 'create',
      adminOnly: true 
    }
  ];

  const filteredItems = menuItems.filter(item => {
    if (item.adminOnly && user?.type === 'profissional') return false;
    return hasPermission(item.permission);
  });

  return (
    <>
      {/* Overlay móvel */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Clínica Terapêutica</h2>
            <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
              user?.type === 'admin' ? 'bg-red-100 text-red-800' :
              user?.type === 'assistente' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user?.type === 'admin' ? 'Administrador' :
               user?.type === 'assistente' ? 'Assistente' : 'Profissional'}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {filteredItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <NavLink
              to="/perfil"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 hover:text-gray-900 mb-2"
            >
              <Settings size={20} />
              <span className="font-medium">Perfil</span>
            </NavLink>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut size={20} />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
