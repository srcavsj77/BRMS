import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      setPosition({ x: 0, y: 0 });
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.modal-header')) {
      setIsDragging(true);
      const rect = modalRef.current.getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX =
          e.clientX - offset.x - window.innerWidth / 2 + modalRef.current.offsetWidth / 2;
        const newY =
          e.clientY - offset.y - window.innerHeight / 2 + modalRef.current.offsetHeight / 2;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 transition-opacity">
      <div
        ref={modalRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.05s ease-out',
        }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 animate-scale-in select-none overflow-hidden"
      >
        <div
          onMouseDown={handleMouseDown}
          className="modal-header flex items-center justify-between p-4 border-b bg-gray-50 cursor-move"
        >
          <h2 className="text-xl font-bold text-text-title pointer-events-none">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-secondary transition-colors p-1 rounded-full hover:bg-white/80"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 bg-white">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
