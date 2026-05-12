import { Folder, Search, ChevronRight } from 'lucide-react';
import Card from './Card';

const treeData = [
  { name: 'Blended', children: [] },
  { name: 'Bolsista Parcial (50%)', children: [] },
  { name: 'Central de Qualidade', children: [] },
];

const DocumentCard = () => {
  return (
    <Card title="Consulta a documentos" icon={Folder}>
      <div className="relative mb-6 group">
        <input
          type="text"
          placeholder="Pesquisar documentos..."
          className="w-full bg-white border border-gray-300 rounded-[20px] py-2 pl-4 pr-10 text-[14px] focus:outline-none focus:border-secondary transition-all duration-300"
        />
        <Search
          size={18}
          className="absolute right-3 top-2.5 text-gray-400 group-focus-within:text-secondary transition-colors"
        />
      </div>

      <div className="space-y-2">
        {treeData.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 py-1 pl-1 cursor-pointer hover:bg-gray-50 rounded transition-colors group"
          >
            <ChevronRight size={16} className="text-gray-400 group-hover:text-secondary" />
            <Folder size={18} className="text-accent fill-accent" />
            <span className="text-[16px] text-text-title group-hover:text-secondary transition-colors">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DocumentCard;
