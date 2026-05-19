import { useState } from 'react';
import {
  Home,
  FilePlus,
  ShieldCheck,
  ClipboardCheck,
  Settings,
  ChevronRight,
  ChevronDown,
  Database,
  Shield,
} from 'lucide-react';
import { checkPermission } from '../utils/permissions';

const menuItems = [
  { icon: Home, label: 'Home', hasDropdown: false },
  {
    icon: FilePlus,
    label: 'Regras de Negócio',
    hasDropdown: true,
    subItems: [{ label: 'Criar regra', displayLabel: 'Nova Regra de Negócio' }, { label: 'Listar / Editar regras' }],
  },
  {
    icon: ClipboardCheck,
    label: 'Auditoria',
    hasDropdown: true,
    subItems: [{ label: 'Alterações realizadas' }, { label: 'Dashboard' }],
  },
  {
    icon: Database,
    label: 'Sistemas',
    displayLabel: 'Sistemas FGV',
    hasDropdown: true,
    subItems: [{ label: 'Cadastrar' }, { label: 'Associar Módulos' }, { label: 'Listar / Editar' }],
  },
  {
    icon: ShieldCheck,
    label: 'Conformidade',
    hasDropdown: true,
    subItems: [{ label: 'Documentos' }],
  },
  {
    icon: Settings,
    label: 'Configurações',
    hasDropdown: true,
    subItems: [
      { label: 'Monitoramento' },
      { label: 'Usuários' },
      { label: 'Manutenção de perfil' },
      { label: 'Sobre o sistema' },
    ],
  },
];

const Sidebar = ({ onNavigate, activeItem, width, currentUser, profilesList }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (label, e) => {
    if (e) e.stopPropagation();
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const renderSubItem = (sub, parentLabel) => {
    if (!checkPermission(currentUser, sub.label, profilesList)) return null;

    const isExpanded = expandedItems[sub.label];

    return (
      <li key={sub.label}>
        <button
          onClick={() => {
            if (sub.hasDropdown) {
              toggleExpand(sub.label);
            } else {
              onNavigate(sub.label);
            }
          }}
          className={`w-full text-left pl-[53px] py-[10px] text-[14px] hover:text-white hover:bg-secondary/30 transition-all flex items-center justify-between pr-4 ${activeItem === sub.label ? 'text-white font-bold bg-secondary/20' : 'text-white/60'}`}
        >
          <span>{sub.displayLabel || sub.label}</span>
          {sub.hasDropdown &&
            (isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} className="opacity-50" />
            ))}
        </button>
        {sub.hasDropdown && isExpanded && sub.subItems && (
          <ul className="bg-primary/30 py-1">
            {sub.subItems.map((nested) => {
              if (!checkPermission(currentUser, nested.label, profilesList)) return null;
              return (
                <li key={nested.label}>
                  <button
                    onClick={() => onNavigate(nested.label)}
                    className={`w-full text-left pl-[75px] py-[8px] text-[13px] hover:text-white hover:bg-white/5 transition-all ${activeItem === nested.label ? 'text-white font-semibold' : 'text-white/40'}`}
                  >
                    • {nested.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 bg-primary text-white overflow-y-auto z-40 transition-none pt-[80px]"
      style={{ width: `${width}px` }}
    >
      <nav className="py-4">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            if (!checkPermission(currentUser, item.label, profilesList)) return null;
            const isExpanded = expandedItems[item.label];

            return (
              <li key={index}>
                <button
                  onClick={() => {
                    if (item.hasDropdown) {
                      toggleExpand(item.label);
                    } else {
                      onNavigate(item.label);
                    }
                  }}
                  className={`w-full flex items-center px-[20px] py-[15px] hover:bg-secondary transition-colors duration-200 group ${activeItem === item.label ? 'bg-secondary/50 font-semibold text-white' : 'text-white/70'}`}
                >
                  <item.icon size={20} className="mr-3" />
                  <span className="flex-1 text-left text-[15px]">{item.displayLabel || item.label}</span>
                  {item.hasDropdown &&
                    (isExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} className="opacity-50" />
                    ))}
                </button>
                {item.hasDropdown && isExpanded && item.subItems && (
                  <ul className="bg-primary/50 py-2">
                    {item.subItems.map((subRes) => renderSubItem(subRes, item.label))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
