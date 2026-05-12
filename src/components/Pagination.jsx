import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 flex items-center justify-center border rounded-[5px] text-[14px] transition-all ${
            currentPage === i
              ? 'bg-secondary text-white border-secondary font-bold'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="mt-8 flex items-center justify-center space-x-2 animate-fade-in">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-[5px] text-[14px] text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed group transition-all"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {renderPageNumbers()}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-[5px] text-[14px] text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed group transition-all"
      >
        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

export default Pagination;
