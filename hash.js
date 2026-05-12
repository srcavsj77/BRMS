const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = './db.json';
const defaultPassword = 'fgv123';

async function hashPasswords() {
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(defaultPassword, salt);

  const updatedUsers = data.usersList.map(user => {
    return {
      ...user,
      password: hashedPassword
    };
  });

  data.usersList = updatedUsers;

  // Atualizar a declaração do DEFAULT_USERS no server.js caso eu reescreva o arquivo
  // Mas como a persistência está no db.json, a fonte da verdade é o db.json
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  console.log('Todas as senhas foram atualizadas com hash Bcrypt do padrão "fgv123".');
}

hashPasswords().catch(console.error);
