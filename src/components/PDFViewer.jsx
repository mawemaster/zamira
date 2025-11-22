import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PDFViewer({ pdf, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  if (!pdf) return null;

  // Múltiplas opções de visualização para garantir compatibilidade
  const viewerOptions = [
    `https://docs.google.com/viewer?url=${encodeURIComponent(pdf.pdf_url)}&embedded=true`,
    `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdf.pdf_url)}`,
    pdf.pdf_url
  ];

  const [viewerIndex, setViewerIndex] = useState(0);

  const handleIframeError = () => {
    if (viewerIndex < viewerOptions.length - 1) {
      setViewerIndex(viewerIndex + 1);
      setLoading(true);
      setError(false);
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 border-b border-purple-500/30 p-3 md:p-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm md:text-lg truncate">
                {pdf.title}
              </h3>
              {pdf.description && (
                <p className="text-slate-400 text-xs md:text-sm truncate">
                  {pdf.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Download */}
              <a
                href={pdf.pdf_url}
                download
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                >
                  <Download className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Baixar</span>
                </Button>
              </a>

              {/* Abrir em nova aba */}
              <a
                href={pdf.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-400 hover:bg-green-500/20"
                >
                  <ExternalLink className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Abrir</span>
                </Button>
              </a>

              {/* Fechar */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-hidden bg-slate-950 relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950/90">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-purple-300 text-sm">Carregando PDF...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950">
              <FileText className="w-16 h-16 text-red-500 mb-4" />
              <p className="text-red-300 text-lg mb-4">Não foi possível carregar o PDF</p>
              <div className="flex gap-3">
                <a
                  href={pdf.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir em Nova Aba
                  </Button>
                </a>
                <a
                  href={pdf.pdf_url}
                  download
                >
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                </a>
              </div>
            </div>
          )}
          
          <iframe
            src={viewerOptions[viewerIndex]}
            className="w-full h-full"
            style={{ border: 'none' }}
            onLoad={() => setLoading(false)}
            onError={handleIframeError}
            title={pdf.title}
            allow="fullscreen"
          />
        </div>
      </div>
    </motion.div>
  );
}