const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/auth');
const logger = require('../../config/logger');
const dbFile = path.join(__dirname, '../../db.json');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    const user = data.usersList.find(u => u.name === username);
    
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });
    if (user.status === 'Bloqueado') return res.status(403).json({ error: 'Usuário bloqueado.' });

    const profile = data.profilesList.find(p => p.id === user.role);
    if (profile && profile.status === 'Inativo') {
      return res.status(403).json({ error: `O perfil "${profile.name}" está inativo.` });
    }

    if (!user.password) return res.status(401).json({ error: 'Conta sem senha.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json({ user: userResponse, token });
  } catch (error) {
    logger.error('Erro na autenticação: ', error);
    res.status(500).json({ error: 'Erro no servidor de autenticação.' });
  }
};

const getPublicUsers = (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    const publicUsers = (data.usersList || []).map(u => ({ id: u.id, name: u.name, role: u.role, email: u.email }));
    res.json(publicUsers);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao obter usuários públicos.' });
  }
};

module.exports = { login, getPublicUsers };
