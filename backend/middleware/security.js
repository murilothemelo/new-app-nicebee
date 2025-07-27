const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limits específicos
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  5, // máximo 5 tentativas
  'Muitas tentativas de login. Tente novamente em 15 minutos.'
);

const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  100, // máximo 100 requests
  'Muitas requisições. Tente novamente em 15 minutos.'
);

const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hora
  10, // máximo 10 uploads
  'Muitos uploads. Tente novamente em 1 hora.'
);

// Configuração do Helmet
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = {
  helmetConfig,
  authLimiter,
  generalLimiter,
  uploadLimiter
};