const express = require('express');
const cors = require('cors');
const logger = require('../config/logger');

// Middlewares
const { preventInjection } = require('./middlewares/security');
const { authenticateToken } = require('./middlewares/auth');

// Controllers
const authController = require('./controllers/authController');
const dataController = require('./controllers/dataController');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(preventInjection);

// Rotas de Autenticação
app.post('/api/auth/login', authController.login);
app.get('/api/public/users', authController.getPublicUsers);

// Rotas de Dados (Protegidas)
app.get('/api/data', authenticateToken, dataController.getData);
app.post('/api/save', authenticateToken, dataController.saveData);

const PORT = process.env.PORT || 3333;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`[BRMS-FGV Backend] Modern Architecture running on http://0.0.0.0:${PORT}`);
});
