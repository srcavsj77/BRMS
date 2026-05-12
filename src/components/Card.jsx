const Card = ({ title, icon: Icon, children, className = '', action }) => {
  return (
    <div
      className={`bg-white rounded-card shadow-card p-[20px] h-full flex flex-col fade-in ${className}`}
    >
      <div className="flex items-center justify-between mb-[15px] pb-[10px] border-b border-gray-100">
        <div className="flex items-center">
          {Icon && <Icon size={22} className="text-secondary mr-[10px]" />}
          <h2 className="text-[18px] lg:text-[20px] font-bold text-text-title">{title}</h2>
        </div>
        {action && <div className="flex items-center">{action}</div>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default Card;
