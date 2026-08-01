import React, { useEffect } from 'react';
import { FiX, FiExternalLink } from 'react-icons/fi';

const ImageLightboxModal = ({ isOpen, onClose, src, title }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300 animate-in fade-in duration-200">
      <div className="relative max-w-5xl w-full flex flex-col items-center justify-center max-h-[95vh]">
        {/* Header bar */}
        <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/80 rounded-t-2xl border-b border-slate-800 text-white shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-200">{title || 'Device Photo Preview'}</h3>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1 font-semibold"
              title="Open full resolution in new tab"
            >
              <FiExternalLink size={14} />
              <span>Full Size</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="w-full bg-slate-900/50 p-4 flex items-center justify-center overflow-auto rounded-b-2xl max-h-[85vh]">
          <img
            src={src}
            alt={title || 'Device Image Preview'}
            className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageLightboxModal;
