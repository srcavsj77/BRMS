import AvisosCard from '../components/AvisosCard';
import NoticiasCard from '../components/NoticiasCard';
import SystemCard from '../components/SystemCard';

const Dashboard = ({ auditData = [], onAddAuditEvent }) => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-[28px] font-bold text-text-title mb-[30px]">Home</h1>

      <div className="cards-dimming-container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[25px] items-start">
        <AvisosCard auditData={auditData} />
        <NoticiasCard onAddEvent={onAddAuditEvent} />
        <SystemCard onAddEvent={onAddAuditEvent} />
      </div>
    </div>
  );
};

export default Dashboard;
