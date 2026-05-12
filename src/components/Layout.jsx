import { useState, useCallback, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({
  children,
  onNavigate,
  currentPage,
  currentUser,
  onLogout,
  profilesList,
  onChangePassword,
  onShowProfile,
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const startResizing = useCallback(
    (e) => {
      e.preventDefault();
      if (!isSidebarVisible) return;
      setIsResizing(true);
    },
    [isSidebarVisible]
  );

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e) => {
      if (isResizing && isSidebarVisible) {
        // Limites: mínimo 200px, máximo 450px
        const newWidth = Math.min(Math.max(200, e.clientX), 450);
        setSidebarWidth(newWidth);
      }
    },
    [isResizing, isSidebarVisible]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <div
      className={`min-h-screen bg-gray-50 transition-all duration-300 ${isResizing ? 'cursor-col-resize select-none' : ''}`}
    >
      <Header
        onNavigate={onNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
        onChangePassword={onChangePassword}
        onShowProfile={onShowProfile}
        onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
      />
      <div className="flex pt-[80px] overflow-hidden">
        {/* Sidebar com transição de deslizamento - começa do topo para evitar frestas */}
        <div
          className="fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ease-in-out bg-primary"
          style={{
            width: `${sidebarWidth}px`,
            transform: isSidebarVisible ? 'translateX(0)' : `translateX(-${sidebarWidth}px)`,
            opacity: isSidebarVisible ? 1 : 0,
            visibility: isSidebarVisible ? 'visible' : 'hidden',
          }}
        >
          <Sidebar
            onNavigate={onNavigate}
            activeItem={currentPage}
            width={sidebarWidth}
            currentUser={currentUser}
            profilesList={profilesList}
          />
        </div>

        {/* Ponto de Redimensionamento (apenas visível quando sidebar está aberta) */}
        {isSidebarVisible && (
          <div
            onMouseDown={startResizing}
            className={`fixed top-[80px] bottom-0 z-50 transition-all duration-150 ease-in-out cursor-col-resize ${
              isResizing
                ? 'w-1 bg-secondary shadow-[0_0_8px_rgba(255,102,0,0.5)]'
                : 'w-1 hover:w-1.5 hover:bg-secondary/30'
            }`}
            style={{ left: `${sidebarWidth - 2}px` }}
          />
        )}

        {/* Conteúdo Principal dinâmico com alinhamento total à esquerda */}
        <main
          className="p-[30px] min-h-[calc(100vh-80px)] transition-all duration-300 ease-in-out"
          style={{
            marginLeft: isSidebarVisible ? `${sidebarWidth}px` : '0px',
            width: isSidebarVisible ? `calc(100% - ${sidebarWidth}px)` : '100%',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
