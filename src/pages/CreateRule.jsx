import React, { useState } from 'react';
import { useFormularioRegra } from '../hooks/useFormularioRegra';
import CabecalhoFormulario from '../components/CreateRule/CabecalhoFormulario';
import SecaoIdentificacao from '../components/CreateRule/SecaoIdentificacao';
import SecaoLogica from '../components/CreateRule/SecaoLogica';
import SecaoVigencia from '../components/CreateRule/SecaoVigencia';
import SecaoHistorico from '../components/CreateRule/SecaoHistorico';
import { CheckCircle, XCircle } from 'lucide-react';

/**
 * Página de Criação/Edição de Regras de Negócio.
 * Refatorada seguindo princípios de Clean Code e SOLID.
 * O componente atua como orquestrador, delegando lógica para hooks e interface para sub-componentes.
 */
const CreateRuleForm = ({
  regras = [],
  initialData,
  isEdit,
  systems = [],
  currentUser,
  onSave,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState('');
  const {
    dadosFormulario,
    categorias,
    lidarComMudanca,
    resetarFormulario,
    recarregarDados,
    setDadosFormulario,
  } = useFormularioRegra(initialData, isEdit, systems);

  const handleAtualizarComBackend = async () => {
    try {
      const token = localStorage.getItem('brms_token');
      const response = await fetch(`http://${window.location.hostname}:3333/api/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const latestRegras = data.regras || [];
        const currentRule = latestRegras.find((r) => r.id_regra === initialData.id_regra);

        if (currentRule) {
          recarregarDados(currentRule);
          // Utilizamos setTimeout para garantir que o alert não trave a renderização do React
          setTimeout(() => alert('Dados atualizados com a versão mais recente do sistema.'), 100);
        } else {
          alert('Esta regra não foi encontrada no banco de dados. Ela pode ter sido excluída.');
        }
      } else {
        alert('Não foi possível obter os dados mais recentes do servidor.');
      }
    } catch (err) {
      console.error('Erro ao buscar regra:', err);
      alert('Erro de conexão ao tentar atualizar os dados.');
    }
  };

  const handleSalvar = () => {
    const nomeNormalizado = dadosFormulario.nome.trim().toLowerCase();

    if (!nomeNormalizado) {
      setShowError('Por favor, informe um nome para a regra.');
      return;
    }

    // Verifica duplicidade ignorando a própria regra em caso de edição
    const isDuplicate = regras.some(
      (r) => r.nome.trim().toLowerCase() === nomeNormalizado && r.id_regra !== dadosFormulario.id
    );

    if (isDuplicate) {
      setShowError(
        `Já existe uma regra cadastrada com o nome "${dadosFormulario.nome}". O sistema não permite nomes duplicados.`
      );
      return;
    }

    const d = new Date();
    const dataHoraSalvamento =
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0') +
      ' ' +
      String(d.getHours()).padStart(2, '0') +
      ':' +
      String(d.getMinutes()).padStart(2, '0');

    setDadosFormulario((prev) => ({ ...prev, data_atualizacao: dataHoraSalvamento }));

    // Salvar regra no estado global do sistema (que persistirá no db.json)
    if (onSave) {
      onSave({ ...dadosFormulario, data_atualizacao: dataHoraSalvamento }, isEdit);
    }

    setShowSuccess(true);
  };

  const handleCancelar = () => {
    if (window.confirm('Tem certeza que deseja cancelar? Alterações não salvas serão perdidas.')) {
      window.history.back();
    }
  };

  return (
    <div className="bg-white rounded-card shadow-card p-8 fade-in mb-10 relative">
      <CabecalhoFormulario
        ehEdicao={isEdit}
        aoSalvar={handleSalvar}
        aoCancelar={handleCancelar}
        aoAtualizar={handleAtualizarComBackend}
        currentUser={currentUser}
      />

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <SecaoIdentificacao
          dados={dadosFormulario}
          categorias={categorias}
          sistemas={systems}
          aoMudar={lidarComMudanca}
        />

        <SecaoLogica dados={dadosFormulario} aoMudar={lidarComMudanca} />

        <SecaoVigencia dados={dadosFormulario} aoMudar={lidarComMudanca} />

        <SecaoHistorico dados={dadosFormulario} aoMudar={lidarComMudanca} />
      </form>

      {/* Modal de Sucesso Customizado */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-up text-center border border-gray-100">
            <div className="flex justify-center mb-4 text-green-500">
              <CheckCircle size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-text-title mb-2">Sucesso!</h3>
            <p className="text-gray-600 mb-8">
              Registro Salvo com sucesso no ecossistema de regras.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                if (!isEdit) resetarFormulario();
              }}
              className="w-[50%] mx-auto block h-[30px] bg-secondary text-white rounded-lg font-black hover:bg-secondary/90 transition-all shadow-md shadow-secondary/20 text-[13px] uppercase tracking-widest leading-none outline-none"
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {/* Modal de Erro/Impedimento Customizado */}
      {showError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-up text-center border border-gray-100">
            <div className="flex justify-center mb-4 text-red-500">
              <XCircle size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-text-title mb-2">Impedimento</h3>
            <p className="text-gray-600 mb-8">{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="w-[50%] mx-auto block h-[30px] bg-red-500 text-white rounded-lg font-black hover:bg-red-600 transition-all shadow-md shadow-red-500/20 text-[13px] uppercase tracking-widest leading-none outline-none"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRuleForm;
