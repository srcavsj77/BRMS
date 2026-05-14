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
