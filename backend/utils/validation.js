const validator = require('validator');

// Validações comuns
const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePassword = (password) => {
  // Mínimo 8 caracteres, pelo menos 1 letra e 1 número
  return password && password.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)/.test(password);
};

const validatePhone = (phone) => {
  // Formato brasileiro básico
  return phone && /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/.test(phone);
};

const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return validator.escape(input.trim());
};

const validateDate = (date) => {
  return validator.isISO8601(date);
};

const validateEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateCPF,
  sanitizeInput,
  validateDate,
  validateEnum
};