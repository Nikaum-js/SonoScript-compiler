import abcjs from 'abcjs';
import html2canvas from 'html2canvas';
import { useEffect, useRef } from 'react';

interface SheetMusicModalProps {
  abcNotation: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SheetMusicModal({ abcNotation, isOpen, onClose }: SheetMusicModalProps) {
  const sheetMusicRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && sheetMusicRef.current && abcNotation) {
      // Limpa o conteúdo anterior
      sheetMusicRef.current.innerHTML = '';

      // Renderiza a partitura usando abcjs
      abcjs.renderAbc(sheetMusicRef.current, abcNotation, {
        responsive: 'resize',
        staffwidth: 750,
        scale: 1.15,
        paddingleft: 0,
        paddingright: 0,
        paddingtop: 0,
        paddingbottom: 0,
        foregroundColor: '#000000',
        add_classes: true,
      });

      // Força a cor do título para preto
      const titleElements = sheetMusicRef.current.querySelectorAll('.abcjs-title, .abcjs-text');
      titleElements.forEach((el) => {
        (el as SVGElement).style.fill = '#000000';
        (el as SVGElement).style.fontWeight = '600';
      });
    }
  }, [abcNotation, isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!sheetMusicRef.current) return;

    try {
      // Captura o elemento da partitura como canvas em alta qualidade
      const canvas = await html2canvas(sheetMusicRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Converte canvas para blob
      canvas.toBlob((blob) => {
        if (!blob) return;

        // Cria URL do blob
        const url = URL.createObjectURL(blob);

        // Cria link de download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'partitura.png';
        document.body.appendChild(a);
        a.click();

        // Limpa
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f1419] rounded-xl border border-gray-800 max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0a0e14]">
          <div>
            <h2 className="text-lg font-semibold text-white">Partitura</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors flex items-center space-x-1.5 text-sm border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Exportar</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center border border-gray-700 hover:border-gray-600"
              aria-label="Fechar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conteúdo - Partitura */}
        <div className="p-10 overflow-auto max-h-[calc(90vh-120px)] bg-[#0a0e14]">
          <div className="bg-white rounded-lg p-8">
            <div ref={sheetMusicRef} className="w-full [&_svg_text]:fill-black [&_svg_.abcjs-title]:fill-black [&_svg_.abcjs-title]:font-semibold" />
          </div>
        </div>

        {/* Footer com ABC Notation */}
        <div className="border-t border-gray-800 bg-[#0a0e14]">
          <details className="group">
            <summary className="cursor-pointer px-6 py-3 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 transition-colors flex items-center space-x-2">
              <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
              <span>Código ABC</span>
            </summary>
            <div className="px-6 pb-4">
              <pre className="mt-2 p-4 bg-[#0f1419] rounded-md border border-gray-700 text-xs font-mono text-gray-300 overflow-x-auto">
{abcNotation}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
