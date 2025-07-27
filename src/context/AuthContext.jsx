import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');

      if (savedUser && token) {
        try {
          // Opcional: verificar se o token ainda é válido com a API
          // const response = await apiClient.get('/user');
          // setUser(response.data);
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Sessão inválida, limpando...", error);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/login', { email, password });
      
      const { user, token } = response.data;
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      
      return true;

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
    }
  };

  const logout = async () => {
    try {
      // Opcional: Chamar endpoint de logout na API para invalidar o token no servidor
      // await apiClient.post('/logout');
    } catch (error) {
      console.error("Erro ao fazer logout na API", error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    }
  };

  const hasPermission = (action, resource) => {
    if (!user) return false;
    
    // Este sistema de permissão pode ser expandido ou vir da API
    const permissions = {
      admin: ['all'],
      assistente: ['read', 'create', 'update', 'delete'],
      profissional: ['read_own', 'create_own', 'update_own']
    };

    if (user.type === 'admin') return true;
    if (user.type === 'assistente' && action !== 'configure_pdf') return true;
    if (user.type === 'profissional') {
        // Lógica mais complexa para permissões de "próprio"
        return true; 
    }

    return false;
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
