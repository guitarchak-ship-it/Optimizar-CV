import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Copy, 
  ChevronLeft,
  Briefcase,
  PlusCircle,
  Wand2,
  Target,
  Camera,
  Image as ImageIcon,
  Upload,
  FileUp,
  Printer,
  Download,
  Eye,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { optimizeCV, CVInput, CVResult } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';
import { AdBanner } from './components/AdBanner';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { About } from './components/About';

// Set up PDF.js worker using the local package worker
const pdfWorker = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Step = 'input' | 'details' | 'processing' | 'result';
type Template = 'minimal' | 'elegant' | 'bold';
type Page = 'home' | 'privacy' | 'terms' | 'about';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [step, setStep] = useState<Step>('input');
  const [template, setTemplate] = useState<Template>('minimal');
  const [input, setInput] = useState<CVInput>({
    name: '',
    cvText: '',
    targetRole: '',
    recentUpdates: '',
    keySkills: '',
    tone: 'Corporativo',
    photoBase64: ''
  });
  const [result, setResult] = useState<CVResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const mainCvRef = useRef<HTMLDivElement>(null);
  const modalCvRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    if (step === 'input') {
      if (!input.cvText.trim()) return;
      setStep('details');
    } else if (step === 'details') {
      if (!input.targetRole.trim()) return;
      processCV();
    }
  };

  const processCV = async () => {
    setLoading(true);
    setStep('processing');
    setError(null);
    try {
      const res = await optimizeCV(input);
      // Ensure newlines are correctly interpreted if they come escaped
      if (res.finalDocument) {
        res.finalDocument = res.finalDocument.replace(/\\n/g, '\n');
      }
      setResult(res);
      setStep('result');
    } catch (err) {
      setError('Ocurrió un error al procesar tu CV. Por favor, intenta de nuevo.');
      setStep('details');
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const extractTextFromDocx = async (arrayBuffer: ArrayBuffer) => {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleCVFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = '';

      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(arrayBuffer);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        extractedText = await extractTextFromDocx(arrayBuffer);
      } else {
        throw new Error('Formato de archivo no soportado. Por favor sube un PDF o DOCX.');
      }

      if (extractedText.trim()) {
        setInput({ ...input, cvText: extractedText });
      } else {
        throw new Error('No se pudo extraer texto del archivo.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo.');
    } finally {
      setExtracting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInput({ ...input, photoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setInput({ ...input, photoBase64: '' });
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = async () => {
    const element = showPreview ? modalCvRef.current : mainCvRef.current;
    if (!element) return;

    // Open a new window immediately to avoid popup blockers
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Preparando impresión...</title>
            <style>
              body { 
                font-family: sans-serif; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                margin: 0;
                background: #f4f4f5;
                color: #71717a;
              }
              .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #18181b; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div style="text-align: center;">
              <div class="spinner"></div>
              <p>Optimizando colores y preparando tu currículum...</p>
            </div>
          </body>
        </html>
      `);
    }

    try {
      const opt = {
        margin: 0,
        filename: `CV_${input.targetRole.replace(/\s+/g, '_') || 'Optimizado'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff',
          scrollY: 0,
          windowWidth: 816,
          onclone: (clonedDoc: Document) => {
            const el = clonedDoc.querySelector('.printable-cv') as HTMLElement;
            if (el) {
              // Ensure the element and its parents are visible in the clone
              let current: HTMLElement | null = el;
              while (current && current !== clonedDoc.body) {
                current.style.setProperty('display', 'block', 'important');
                current.style.setProperty('visibility', 'visible', 'important');
                current.style.setProperty('opacity', '1', 'important');
                current = current.parentElement;
              }
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // @ts-ignore
      const pdf = await html2pdf().set(opt).from(element).toPdf().get('pdf');
      const blobUrl = pdf.output('bloburl');
      
      if (printWindow) {
        printWindow.location.href = blobUrl;
      } else {
        window.open(blobUrl, '_blank');
      }
    } catch (err) {
      console.error("Error generating print view:", err);
      if (printWindow) printWindow.close();
      setError("Error al generar la vista de impresión. Por favor intenta descargar el PDF directamente.");
    }
  };
  const handleDownloadPDF = async () => {
    const element = showPreview ? modalCvRef.current : mainCvRef.current;
    if (!element) return;

    try {
      const opt = {
        margin: 0,
        filename: `CV_${input.targetRole.replace(/\s+/g, '_') || 'Optimizado'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff',
          scrollY: 0,
          windowWidth: 816,
          onclone: (clonedDoc: Document) => {
            const el = clonedDoc.querySelector('.printable-cv') as HTMLElement;
            if (el) {
              // Ensure the element and its parents are visible in the clone
              let current: HTMLElement | null = el;
              while (current && current !== clonedDoc.body) {
                current.style.setProperty('display', 'block', 'important');
                current.style.setProperty('visibility', 'visible', 'important');
                current.style.setProperty('opacity', '1', 'important');
                current = current.parentElement;
              }
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setError("Error al descargar el PDF. Por favor intenta de nuevo.");
    }
  };



  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 no-print">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => {
              setPage('home');
              setStep('input');
            }}
          >
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Optimiza tu CV</span>
          </div>
          {page === 'home' && step !== 'input' && step !== 'processing' && (
            <button 
              onClick={() => setStep('input')}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Reiniciar
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        {page === 'privacy' && <PrivacyPolicy />}
        {page === 'terms' && <TermsOfService />}
        {page === 'about' && <About />}
        
        {page === 'home' && (
          <>
            <AnimatePresence mode="wait">
              {step === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
                  Transforma tu CV para el mercado de 2026
                </h1>
                <p className="text-lg text-zinc-600">
                  Sube tu archivo (PDF/DOCX) o pega el contenido de tu currículum actual.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex-1 bg-white border-2 border-dashed border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer transition-all group">
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                      {extracting ? (
                        <Loader2 className="w-6 h-6 text-zinc-900 animate-spin" />
                      ) : (
                        <FileUp className="w-6 h-6 text-zinc-900" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-zinc-900">Subir CV</p>
                      <p className="text-xs text-zinc-500">PDF o DOCX</p>
                    </div>
                    <input 
                      type="file" 
                      accept=".pdf,.docx" 
                      className="hidden" 
                      onChange={handleCVFileUpload} 
                      disabled={extracting}
                    />
                  </label>

                  <div className="flex-1 bg-white border-2 border-dashed border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer transition-all group relative">
                    {input.photoBase64 ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-100 shadow-sm">
                          <img src={input.photoBase64} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button 
                          onClick={(e) => { e.preventDefault(); removePhoto(); }}
                          className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> ELIMINAR FOTO
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer">
                        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
                          <Camera className="w-6 h-6 text-zinc-900" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-zinc-900">Añadir Foto</p>
                          <p className="text-xs text-zinc-500">Opcional</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Contenido del CV</span>
                  </div>
                  <textarea
                    className="w-full h-80 p-6 focus:outline-none resize-none text-zinc-800 font-sans leading-relaxed"
                    placeholder="Pega aquí el contenido de tu CV actual o sube un archivo arriba..."
                    value={input.cvText}
                    onChange={(e) => setInput({ ...input, cvText: e.target.value })}
                  />
                  <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center">
                    <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                      {input.cvText.length} caracteres
                    </span>
                    <button
                      disabled={!input.cvText.trim() || extracting}
                      onClick={handleNext}
                      className="bg-zinc-900 text-white px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Siguiente
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-zinc-900">Detalles Críticos</h2>
                <p className="text-zinc-600">Ayúdanos a enfocar la optimización hacia tus objetivos específicos.</p>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Nombre Completo (Opcional)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
                    placeholder="Tu nombre completo..."
                    value={input.name}
                    onChange={(e) => setInput({ ...input, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Foto Profesional (Opcional)
                  </label>
                  <div className="flex items-center gap-4">
                    {input.photoBase64 ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 group">
                        <img src={input.photoBase64} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={removePhoto}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 cursor-pointer transition-all">
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-[10px] font-bold mt-1">SUBIR</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    )}
                    <div className="text-xs text-zinc-500">
                      <p className="font-semibold text-zinc-700">Imagen de perfil</p>
                      <p>La IA analizará tu foto para darte consejos de imagen profesional.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Rol Objetivo
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
                    placeholder="Ej: Senior Project Manager, Desarrollador Fullstack..."
                    value={input.targetRole}
                    onChange={(e) => setInput({ ...input, targetRole: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Actualizaciones Recientes
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all h-24 resize-none"
                    placeholder="Nuevos logros, cursos o cambios no incluidos en el CV..."
                    value={input.recentUpdates}
                    onChange={(e) => setInput({ ...input, recentUpdates: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                      <Wand2 className="w-4 h-4" /> Habilidades Clave
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all"
                      placeholder="Ej: IA, Liderazgo, Python"
                      value={input.keySkills}
                      onChange={(e) => setInput({ ...input, keySkills: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Preferencia de Tono
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all appearance-none bg-white"
                      value={input.tone}
                      onChange={(e) => setInput({ ...input, tone: e.target.value })}
                    >
                      <option>Corporativo</option>
                      <option>Creativo</option>
                      <option>Académico</option>
                      <option>Moderno</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 px-6 py-3 rounded-xl font-medium border border-zinc-200 hover:bg-zinc-50 transition-all"
                >
                  Atrás
                </button>
                <button
                  disabled={!input.targetRole.trim()}
                  onClick={handleNext}
                  className="flex-[2] bg-zinc-900 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-lg shadow-zinc-200"
                >
                  Optimizar Currículum
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center space-y-8 py-12"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-zinc-900" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-zinc-900">Analizando el mercado...</h3>
                <div className="space-y-2 text-zinc-500 text-sm">
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Investigando requisitos de {input.targetRole} en 2026
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Identificando palabras clave ATS
                  </p>
                  {input.photoBase64 && (
                    <p className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Analizando imagen profesional
                    </p>
                  )}
                  <p className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Redactando logros cuantificables
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Template Selection */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm no-print">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-900">Estilo Visual</h3>
                    <p className="text-sm text-zinc-500">Elige cómo quieres que se vea tu currículum.</p>
                  </div>
                  <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
                    {[
                      { id: 'minimal', name: 'Básico', icon: FileText },
                      { id: 'elegant', name: 'Elegante', icon: Wand2 },
                      { id: 'bold', name: 'Recargado', icon: Sparkles }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id as Template)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                          template === t.id 
                            ? "bg-white text-zinc-900 shadow-sm" 
                            : "text-zinc-500 hover:text-zinc-700"
                        )}
                      >
                        <t.icon className="w-4 h-4" />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Document */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between no-print">
                    <h2 className="text-2xl font-bold text-zinc-900">Currículum Optimizado</h2>
                    <div className="flex gap-2">
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(result.finalDocument)}
                        className={cn(
                          "p-2 rounded-lg border transition-all flex items-center gap-2 px-4",
                          copied 
                            ? "bg-green-50 border-green-200 text-green-600" 
                            : "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                        )}
                        title="Copiar Markdown"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {copied ? "Copiado!" : "Copiar Texto"}
                        </span>
                      </motion.button>
                      <button 
                        onClick={() => setShowPreview(true)}
                        className="p-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-all flex items-center gap-2 px-4 shadow-sm"
                        title="Vista Previa"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Vista Previa</span>
                      </button>
                    </div>
                  </div>
                  <div 
                    ref={mainCvRef}
                    className={cn(
                      "bg-white rounded-2xl border border-zinc-200 shadow-sm min-h-[600px] relative print:shadow-none print:border-none printable-cv",
                      template === 'minimal' && "p-0",
                      template === 'elegant' && "p-0 template-elegant",
                      template === 'bold' && "p-0 template-bold"
                    )}
                  >
                    {template === 'minimal' ? (
                      <div className="flex flex-col">
                        <div className="p-10 flex justify-between items-start border-b-2 border-black mb-4">
                          <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-black">{result.name}</h1>
                            <p className="text-zinc-600 font-medium text-lg uppercase tracking-wider">{input.targetRole}</p>
                          </div>
                          {input.photoBase64 && (
                            <div 
                              className="w-32 h-32 rounded-xl border-2 border-zinc-200 shrink-0"
                              style={{ 
                                backgroundImage: `url(${input.photoBase64})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                              }}
                              aria-label="Profile"
                            />
                          )}
                        </div>
                        <div className="px-10 pb-10 markdown-body minimal-content">
                          <ReactMarkdown>{result.finalDocument}</ReactMarkdown>
                        </div>
                      </div>
                    ) : template === 'elegant' ? (
                      <div className="flex flex-col">
                        <div className="bg-slate-950 text-white p-10 flex justify-between items-center template-banner">
                          <div className="space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight">{result.name}</h1>
                            <p className="text-blue-400 font-medium tracking-wide uppercase text-sm">{input.targetRole}</p>
                            <div className="h-1 w-20 bg-blue-400" />
                          </div>
                          {input.photoBase64 && (
                            <div 
                              className="w-24 h-24 rounded-full border-4 shrink-0" 
                              style={{ 
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                backgroundImage: `url(${input.photoBase64})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                              }}
                              aria-label="Profile"
                            />
                          )}
                        </div>
                        <div className="p-10 markdown-body elegant-content">
                          <ReactMarkdown>{result.finalDocument}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="bg-emerald-500 text-white p-10 relative overflow-hidden template-banner">
                          <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                          <div className="relative z-10 flex justify-between items-end">
                            <div className="space-y-4">
                              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>Currículum Optimizado</span>
                              <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">{result.name}</h1>
                              <p className="text-emerald-100 font-bold uppercase tracking-widest text-sm">{input.targetRole}</p>
                            </div>
                            {input.photoBase64 && (
                              <div 
                                className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl rotate-3 shrink-0"
                                style={{ 
                                  backgroundImage: `url(${input.photoBase64})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat'
                                }}
                                aria-label="Profile"
                              />
                            )}
                          </div>
                        </div>
                        <div className="p-10 markdown-body bold-content">
                          <ReactMarkdown>{result.finalDocument}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Notes */}
                <div className="space-y-6 no-print">
                  <h2 className="text-2xl font-bold text-zinc-900">Notas de Mejora</h2>
                  <div className="bg-zinc-900 text-zinc-300 rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <Sparkles className="w-5 h-5" />
                      <span>Cambios Estratégicos</span>
                    </div>
                    <div className="text-sm leading-relaxed markdown-body markdown-body-dark">
                      <ReactMarkdown>{result.improvementNotes}</ReactMarkdown>
                    </div>
                    <div className="pt-4 border-t border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Sugerencia</p>
                      <p className="text-sm italic">"Este perfil ha sido optimizado para superar filtros ATS y destacar logros medibles."</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                    <h3 className="font-bold text-zinc-900">Próximos Pasos</h3>
                    <ul className="space-y-3 text-sm text-zinc-600">
                      <li className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-900 shrink-0">1</div>
                        Copia el texto optimizado.
                      </li>
                      <li className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-900 shrink-0">2</div>
                        Elige una de las plantillas de Canva a continuación.
                      </li>
                      <li className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-900 shrink-0">3</div>
                        Pega el contenido y descarga tu PDF profesional.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Canva Templates Section */}
              <div className="space-y-6 pt-12 border-t border-zinc-200 no-print">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-zinc-900">Plantillas de Canva Recomendadas</h2>
                    <p className="text-zinc-500">Seleccionadas para tu tono: <span className="font-semibold text-zinc-900">{input.tone}</span></p>
                  </div>
                  <a 
                    href="https://www.canva.com/resumes/templates/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                  >
                    Ver todas en Canva
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      name: "Ejecutivo Moderno",
                      desc: "Limpio, profesional y directo.",
                      url: "https://www.canva.com/resumes/templates/modern/",
                      img: "https://picsum.photos/seed/resume1/400/560",
                      tag: "Corporativo"
                    },
                    {
                      name: "Creativo Minimalista",
                      desc: "Ideal para roles en diseño y tech.",
                      url: "https://www.canva.com/resumes/templates/creative/",
                      img: "https://picsum.photos/seed/resume2/400/560",
                      tag: "Creativo"
                    },
                    {
                      name: "Académico Estructurado",
                      desc: "Enfoque en educación y publicaciones.",
                      url: "https://www.canva.com/resumes/templates/academic/",
                      img: "https://picsum.photos/seed/resume3/400/560",
                      tag: "Académico"
                    },
                    {
                      name: "Tech Senior",
                      desc: "Resalta habilidades técnicas y logros.",
                      url: "https://www.canva.com/resumes/templates/professional/",
                      img: "https://picsum.photos/seed/resume4/400/560",
                      tag: "Moderno"
                    }
                  ].map((template, i) => (
                    <motion.a
                      key={i}
                      href={template.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -5 }}
                      className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-zinc-100 relative">
                        <img 
                          src={template.img} 
                          alt={template.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                            template.tag === input.tone ? "bg-zinc-900 text-white" : "bg-white/90 text-zinc-600"
                          )}>
                            {template.tag}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white text-zinc-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                            Usar Plantilla
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-1">
                        <h4 className="font-bold text-zinc-900">{template.name}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-1">{template.desc}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AdSense Banner */}
        <div className="mt-12">
          <AdBanner dataAdSlot="1234567890" />
        </div>
          </>
        )}
      </main>

      <footer className="py-8 border-t border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-400 text-sm">
          <p>© 2026 Optimiza tu CV. Potenciado por Gemini.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <button onClick={() => setPage('about')} className="hover:text-zinc-600 transition-colors">Acerca de</button>
            <button onClick={() => setPage('privacy')} className="hover:text-zinc-600 transition-colors">Privacidad</button>
            <button onClick={() => setPage('terms')} className="hover:text-zinc-600 transition-colors">Términos</button>
          </div>
        </div>
      </footer>
      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm no-print"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0 no-print">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-900">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">Vista Previa de Impresión</h3>
                    <p className="text-xs text-zinc-500">Revisa el diseño antes de imprimir</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-all font-medium"
                    title="Descargar como PDF"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all font-medium shadow-lg shadow-zinc-900/20"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir Ahora
                  </button>
                  <button 
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content - Scrollable area */}
              <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/50">
                <div 
                  ref={modalCvRef}
                  className={cn(
                    "max-w-[215.9mm] mx-auto bg-white shadow-sm border border-zinc-200 min-h-[279.4mm] print:min-h-0 relative printable-cv",
                    template === 'minimal' && "p-0",
                    template === 'elegant' && "p-0 template-elegant",
                    template === 'bold' && "p-0 template-bold"
                  )}
                >
                  {template === 'minimal' ? (
                    <div className="flex flex-col">
                      <div className="p-[10mm] flex justify-between items-start border-b-2 border-black mb-4">
                        <div className="space-y-2">
                          <h1 className="text-4xl font-bold text-black">{result.name}</h1>
                          <p className="text-zinc-600 font-medium text-lg uppercase tracking-wider">{input.targetRole}</p>
                        </div>
                        {input.photoBase64 && (
                          <div 
                            className="w-32 h-32 rounded-xl border-2 border-zinc-200 shrink-0"
                            style={{ 
                              backgroundImage: `url(${input.photoBase64})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                            aria-label="Profile"
                          />
                        )}
                      </div>
                      <div className="px-[10mm] pb-[10mm] markdown-body minimal-content">
                        <ReactMarkdown>{result.finalDocument}</ReactMarkdown>
                      </div>
                    </div>
                  ) : template === 'elegant' ? (
                    <div className="flex flex-col">
                      <div className="bg-slate-900 text-white p-8 flex justify-between items-center template-banner">
                        <div className="space-y-4">
                          <h1 className="text-4xl font-bold tracking-tight">{result.name}</h1>
                          <p className="text-blue-400 font-medium tracking-widest uppercase text-lg">{input.targetRole}</p>
                          <div className="h-2 w-32 bg-blue-400" />
                        </div>
                        {input.photoBase64 && (
                          <div 
                            className="w-32 h-32 rounded-full border-4 shrink-0" 
                            style={{ 
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              backgroundImage: `url(${input.photoBase64})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                            aria-label="Profile"
                          />
                        )}
                      </div>
                      <div className="p-8 markdown-body elegant-content">
                        <ReactMarkdown>{result.finalDocument}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="bg-emerald-500 text-white p-8 relative template-banner">
                        <div className="relative z-10 flex justify-between items-end">
                          <div className="space-y-4">
                            <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>Currículum Optimizado</span>
                            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">{result.name}</h1>
                            <p className="text-emerald-100 font-bold uppercase tracking-widest text-lg">{input.targetRole}</p>
                          </div>
                          {input.photoBase64 && (
                            <div 
                              className="w-32 h-32 rounded-2xl border-4 border-white shadow-2xl rotate-3 shrink-0"
                              style={{ 
                                backgroundImage: `url(${input.photoBase64})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                              }}
                              aria-label="Profile"
                            />
                          )}
                        </div>
                      </div>
                      <div className="p-8 markdown-body bold-content">
                        <ReactMarkdown>{result.finalDocument}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-zinc-100 bg-white flex justify-center shrink-0 no-print">
                <p className="text-xs text-zinc-400">El diseño se ajustará automáticamente al tamaño de papel A4/Carta al imprimir.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
