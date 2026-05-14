import { useState, useEffect } from 'react';
import { User, Lock, ChevronRight, ShieldCheck, LogIn, XCircle } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

const Login = ({ onLogin }) => {
  const [publicUsers, setPublicUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/api/public/users', false) // false = no auth needed for suggestions
      .then((data) => {
        if (Array.isArray(data)) setPublicUsers(data);
      })
      .catch(console.error);
  }, []);

  const sqlInjectionPattern =
    /(['";]+|(--)+|\b(SELECT|UPDATE|DELETE|INSERT|DROP|UNION)\b|\bOR\b\s+.+)/i;

  const handleLogin = async (e) => {
    e.preventDefault();

    // Verificação de Segurança: Prevenção contra SQL Injection
    if (sqlInjectionPattern.test(searchTerm) || sqlInjectionPattern.test(password)) {
      setError('🚨 Bloqueado: Tentativa de injeção SQL ou uso de caracteres maliciosos detectada!');
      return;
    }

    if (!selectedUser && !searchTerm) {
      setError('Por favor, informe seu usuário.');
      return;
    }
    if (password.length === 0) {
      setError('Por favor, insira uma senha.');
      return;
    }

    const username = selectedUser ? selectedUser.name : searchTerm;

    try {
      const data = await apiClient.post('/api/auth/login', { username, password }, false);
      onLogin(data); // data = { user, token }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro de conexão com o servidor de autenticação.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001529] relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]"></div>

      <div className="max-w-md w-full mx-4 relative z-10 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          <div className="bg-primary p-8 text-center border-b border-white/10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/20 mb-4 animate-bounce-subtle">
              <ShieldCheck size={32} className="text-secondary" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight italic uppercase">BRMS</h1>
            <p className="text-white/60 text-sm mt-1 uppercase tracking-widest font-semibold">
              Business Rules Management System
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              Sistema de Gerenciamento de Regras de Negócios
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div className="relative group text-left">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Usuário
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Digite seu nome de usuário..."
                  autoComplete="off"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border-2 rounded-xl focus:bg-white outline-none transition-all placeholder:text-gray-300 ${
                    selectedUser
                      ? 'border-secondary/50'
                      : 'border-transparent focus:border-secondary'
                  }`}
                  value={selectedUser ? selectedUser.name : searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedUser(null);
                    setShowSuggestions(true);
                    setError('');
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {selectedUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setSearchTerm('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>

              {/* Sugestões Dropdown */}
              {showSuggestions && searchTerm.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-scale-up max-h-[200px] overflow-y-auto custom-scrollbar">
                  {publicUsers.filter((u) =>
                    u.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length > 0 ? (
                    publicUsers
                      .filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setSearchTerm(u.name);
                            setShowSuggestions(false);
                            setError('');
                          }}
                          className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-none group"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs transition-transform group-hover:scale-110 ${u.role === 'admin' ? 'bg-primary' : 'bg-gray-400'}`}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-700">{u.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                              {u.role}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-gray-300" />
                        </button>
                      ))
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-sm italic">
                      Nenhum usuário encontrado.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative group text-left">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-secondary focus:bg-white outline-none transition-all placeholder:text-gray-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-xs py-2 px-3 rounded-lg border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-[50%] mx-auto block bg-secondary hover:bg-secondary-dark text-white h-[30px] rounded-lg font-black flex items-center justify-center space-x-2 shadow-md shadow-secondary/20 transition-all hover:-translate-y-1 active:scale-95 group text-[13px] uppercase tracking-widest leading-none outline-none"
            >
              <span>Acessar Sistema</span>
              <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-[11px] text-gray-400 font-medium">
              © 2026 BRMS-FGV • Versão 0.2.0 • Protótipo Funcional
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">
            Fundação Getulio Vargas
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
