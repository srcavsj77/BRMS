const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const dbFile = path.join(__dirname, '../../db.json');

const getData = (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    
    // Ocultar senhas por segurança
    if (data.usersList) {
      data.usersList = data.usersList.map(u => {
        const safeUser = { ...u };
        delete safeUser.password;
        return safeUser;
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao ler o banco de dados.' });
  }
};

const saveData = (req, res) => {
  try {
    const existingData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    const newData = req.body;

    // Sudo Mode Check
    let requiresSudo = false;
    if (newData.usersList && existingData.usersList) {
      if (newData.usersList.length !== existingData.usersList.length) {
        requiresSudo = true;
      } else {
        for (const newUser of newData.usersList) {
          const oldUser = existingData.usersList.find(u => u.id === newUser.id);
          if (!oldUser) {
            requiresSudo = true;
            break;
          } else {
            const passwordChanged = newUser.password && newUser.password !== '••••••••' && newUser.password !== oldUser.password;
            const propertiesChanged = newUser.name !== oldUser.name ||
                                      newUser.email !== oldUser.email ||
                                      newUser.role !== oldUser.role ||
                                      newUser.status !== oldUser.status ||
                                      newUser.funcao !== oldUser.funcao;
            
            if (passwordChanged || propertiesChanged) {
              requiresSudo = true;
              break;
            }
          }
        }
      }
    }

    if (requiresSudo) {
      const adminConfirmPassword = req.headers['x-admin-confirm-password'];
      if (!adminConfirmPassword) {
        return res.status(401).json({ error: 'Reautenticação necessária: senha do Administrador não fornecida.' });
      }

      if (!req.user || !req.user.id) {
        return res.status(403).json({ error: 'Usuário não autenticado ou inválido.' });
      }

      const loggedInAdmin = existingData.usersList.find(u => u.id === req.user.id);
      if (!loggedInAdmin || loggedInAdmin.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado: apenas administradores podem realizar esta operação.' });
      }

      const isValid = bcrypt.compareSync(adminConfirmPassword, loggedInAdmin.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Senha de confirmação do Administrador inválida.' });
      }
    }
    
    if (newData.usersList) {
       newData.usersList = newData.usersList.map(newUser => {
         const oldUser = existingData.usersList.find(u => u.id === newUser.id);
         if (oldUser) {
           if (!newUser.password || newUser.password === '••••••••') {
             newUser.password = oldUser.password;
           } else {
             const salt = bcrypt.genSaltSync(10);
             newUser.password = bcrypt.hashSync(newUser.password, salt);
           }
         } else {
           const salt = bcrypt.genSaltSync(10);
           newUser.password = bcrypt.hashSync(newUser.password || 'fgv123', salt);
         }
         return newUser;
       });
    }

    fs.writeFileSync(dbFile, JSON.stringify(newData, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao salvar os dados.' });
  }
};

module.exports = { getData, saveData };
