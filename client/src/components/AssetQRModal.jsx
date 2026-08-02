import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiPrinter, FiX, FiExternalLink } from 'react-icons/fi';



function AssetQRModal({ isOpen, onClose, asset }) {
  const printRef = useRef(null);

  if (!isOpen || !asset) return null;

  // Encoded QR URL: links directly to dedicated View Asset page
  const qrValue = `${window.location.origin}/assets/view/${asset._id}`;

  const handlePrint = () => {
    window.print();
  };

  const assetTagDisplay = `${asset.id || 'AST-000'} - AFH4`;
  const serialDisplay = asset.serialNumber && asset.serialNumber !== '-' ? asset.serialNumber : 'N/A';
  const modelDisplay = `${asset.brand !== '-' ? asset.brand : ''} ${asset.name}`.trim();

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      {/* Embedded Print CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-qr-sticker, #printable-qr-sticker * {
            visibility: visible !important;
          }
          #printable-qr-sticker {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100% !important;
            max-width: 500px !important;
            border: 2px solid #000 !important;
            background: #fff !important;
            padding: 24px !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full mx-4 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Asset QR Code Label</h2>
            <p className="text-xs text-slate-500 mt-1">Scan QR code to view asset image link or print physical sticker label.</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body & Printable Label */}
        <div className="p-6 space-y-6">
          {/* Printable Sticker Frame matching exact reference layout */}
          <div 
            ref={printRef}
            id="printable-qr-sticker"
            className="bg-white border-2 border-black rounded-xl p-5 shadow-sm flex flex-row items-center gap-6"
          >
            {/* Left Column: QR Code + Asset Tag */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="bg-white p-1 rounded-lg">
                <QRCodeSVG 
                  value={qrValue} 
                  size={140} 
                  level="H" 
                  includeMargin={false}
                />
              </div>
              <span className="font-mono text-xs font-bold text-black mt-2 tracking-wider uppercase">
                {assetTagDisplay}
              </span>
            </div>

            {/* Right Column: Company, Serial, Model */}
            <div className="flex flex-col justify-center gap-2 flex-1 font-mono text-black">
              {/* Company Name */}
              <div>
                <span className="block text-[10px] font-normal text-slate-600 tracking-tight">company name</span>
                <span className="block text-base font-bold tracking-tight uppercase leading-tight text-black">
                  AFH4
                </span>
              </div>

              {/* Serial */}
              <div>
                <span className="block text-[10px] font-normal text-slate-600 tracking-tight">serial</span>
                <span className="block text-sm font-bold tracking-tight text-black break-all leading-tight">
                  {serialDisplay}
                </span>
              </div>

              {/* Model */}
              <div>
                <span className="block text-[10px] font-normal text-slate-600 tracking-tight">model</span>
                <span className="block text-sm font-bold tracking-tight text-black break-words leading-tight">
                  {modelDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* QR Scanned Destination Link Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-2">
            <div className="overflow-hidden">
              <span className="font-semibold text-slate-700 block">Scanned Target Link:</span>
              <span className="font-mono text-slate-500 truncate block text-[11px] mt-0.5">{qrValue}</span>
            </div>
            <a
              href={qrValue}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold flex items-center gap-1 shrink-0 transition-colors"
            >
              <FiExternalLink size={12} />
              <span>Test Link</span>
            </a>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-blue-900/10 flex justify-center items-center gap-2 cursor-pointer"
            >
              <FiPrinter size={16} />
              <span>Print QR Label</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AssetQRModal;
