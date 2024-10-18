import Editor, { Monaco } from "@monaco-editor/react";
import * as monacoEditor from 'monaco-editor';
import { useEffect, useState } from 'react';
import { Executor } from '../../compiler/executor/Executor';
import { Parser } from '../../compiler/parser/Parser';
import { SheetMusicConverter } from '../../utils/sheetMusicConverter';
import { SheetMusicModal } from '../SheetMusicModal';

const defaultCode = `// Ode à Alegria - Ludwig van Beethoven
// Configurações iniciais
bpm 80
volume 80

sequence ode_alegria {
  // Toca a melodia duas vezes
  repeat(2) {
    // Primeira frase
    E4 1/4, E4 1/4, F4 1/4, G4 1/4,
    G4 1/4, F4 1/4, E4 1/4, D4 1/4,
    C4 1/4, C4 1/4, D4 1/4, E4 1/4,
    E4 1/4, D4 1/8, D4 1/2,

    // Segunda frase
    E4 1/4, E4 1/4, F4 1/4, G4 1/4,
    G4 1/4, F4 1/4, E4 1/4, D4 1/4,
    C4 1/4, C4 1/4, D4 1/4, E4 1/4,
    D4 1/4, C4 1/8, C4 1/2,

    // Terceira frase
    D4 1/4, D4 1/4, E4 1/4, C4 1/4,
    D4 1/4, E4 1/8, F4 1/8, E4 1/4, C4 1/4,
    D4 1/4, E4 1/8, F4 1/8, E4 1/4, D4 1/4,
    C4 1/4, D4 1/4, G3 1/2,

    // Quarta frase (repete a primeira com final diferente)
    E4 1/4, E4 1/4, F4 1/4, G4 1/4,
    G4 1/4, F4 1/4, E4 1/4, D4 1/4,
    C4 1/4, C4 1/4, D4 1/4, E4 1/4,
    D4 1/4, C4 1/8, C4 1/2
  }
}`;

// Define o tema personalizado do Monaco (paleta profissional)
const monacoTheme: monacoEditor.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6b7280' },
    { token: 'keyword', foreground: '60a5fa' },
    { token: 'number', foreground: '34d399' },
    { token: 'string', foreground: 'fbbf24' },
    { token: 'identifier', foreground: '10b981' },
  ],
  colors: {
    'editor.background': '#0f1419',
    'editor.foreground': '#e5e7eb',
    'editor.lineHighlightBackground': '#1f2937',
    'editorLineNumber.foreground': '#4b5563',
    'editorLineNumber.activeForeground': '#9ca3af',
    'editor.selectionBackground': '#374151',
    'editor.inactiveSelectionBackground': '#37415180',
  },
};

// Exemplos de músicas
const musicExamples = {
  twinkle: `// Twinkle Twinkle Little Star
// Melodia clássica infantil
bpm 100
volume 80

sequence twinkle {
  // Twinkle, twinkle, little star
  C4 1/4, C4 1/4, G4 1/4, G4 1/4,
  A4 1/4, A4 1/4, G4 1/2,

  // How I wonder what you are
  F4 1/4, F4 1/4, E4 1/4, E4 1/4,
  D4 1/4, D4 1/4, C4 1/2,

  // Up above the world so high
  G4 1/4, G4 1/4, F4 1/4, F4 1/4,
  E4 1/4, E4 1/4, D4 1/2,

  // Like a diamond in the sky
  G4 1/4, G4 1/4, F4 1/4, F4 1/4,
  E4 1/4, E4 1/4, D4 1/2,

  // Twinkle, twinkle, little star (repete)
  C4 1/4, C4 1/4, G4 1/4, G4 1/4,
  A4 1/4, A4 1/4, G4 1/2,

  // How I wonder what you are
  F4 1/4, F4 1/4, E4 1/4, E4 1/4,
  D4 1/4, D4 1/4, C4 1/2
}`,

  mary: `// Mary Had a Little Lamb
// Canção infantil tradicional
bpm 110
volume 80

sequence mary {
  // Mary had a little lamb
  E4 1/4, D4 1/4, C4 1/4, D4 1/4,
  E4 1/4, E4 1/4, E4 1/2,

  // Little lamb, little lamb
  D4 1/4, D4 1/4, D4 1/2,
  E4 1/4, G4 1/4, G4 1/2,

  // Mary had a little lamb
  E4 1/4, D4 1/4, C4 1/4, D4 1/4,
  E4 1/4, E4 1/4, E4 1/4, E4 1/4,

  // Its fleece was white as snow
  D4 1/4, D4 1/4, E4 1/4, D4 1/4,
  C4 1/2
}`,

  birthday: `// Parabéns a Você
// Melodia de aniversário
bpm 90
volume 80

sequence parabens {
  // Parabéns a você
  C4 1/8, C4 1/8, D4 1/4, C4 1/4,
  F4 1/4, E4 1/2,

  // Nesta data querida
  C4 1/8, C4 1/8, D4 1/4, C4 1/4,
  G4 1/4, F4 1/2,

  // Muitas felicidades
  C4 1/8, C4 1/8, C5 1/4, A4 1/4,
  F4 1/4, E4 1/4, D4 1/4,

  // Muitos anos de vida
  A#4 1/8, A#4 1/8, A4 1/4, F4 1/4,
  G4 1/4, F4 1/2
}`
};

export function CodeEditor() {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [executor, setExecutor] = useState<Executor | null>(null);
  const [showSheetMusic, setShowSheetMusic] = useState(false);
  const [abcNotation, setAbcNotation] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const handlePlay = () => {
    try {
      if (executor) {
        executor.stop();
      }

      const newExecutor = new Executor({
        onNoteStart: (note, time) => {
          setOutput(prev => prev + `\nNota iniciada: ${note} em ${time.toFixed(2)}s`);
        },
        onNoteEnd: (note, time) => {
          setOutput(prev => prev + `\nNota finalizada: ${note} em ${time.toFixed(2)}s`);
        },
        onSequenceStart: (name, time) => {
          setOutput(prev => prev + `\n\nSequência iniciada: ${name} em ${time.toFixed(2)}s`);
        },
        onSequenceEnd: (name, time) => {
          setOutput(prev => prev + `\n\nSequência finalizada: ${name} em ${time.toFixed(2)}s`);
        }
      });

      const parser = new Parser(code);
      const ast = parser.parse();
      newExecutor.execute(ast);

      setExecutor(newExecutor);
      setIsPlaying(true);
      setOutput('Iniciando execução...\n');
    } catch (error) {
      setOutput(`Erro: ${error}`);
    }
  };

  const handleStop = () => {
    if (executor) {
      executor.stop();
      setExecutor(null);
      setIsPlaying(false);
      setOutput(prev => prev + '\n\nExecução interrompida.');
    }
  };

  const handleGenerateSheet = () => {
    try {
      const parser = new Parser(code);
      const ast = parser.parse();
      const converter = new SheetMusicConverter();
      const abc = converter.formatABC(converter.convertToABC(ast));
      setAbcNotation(abc);
      setShowSheetMusic(true);
      setOutput(prev => prev + '\n\nPartitura gerada com sucesso!');
    } catch (error) {
      setOutput(prev => prev + `\n\nErro ao gerar partitura: ${error}`);
    }
  };

  const handleLoadExample = (exampleKey: keyof typeof musicExamples) => {
    setCode(musicExamples[exampleKey]);
    setShowExamples(false);
    setOutput('Exemplo carregado! Clique em "Executar" para ouvir.');
  };

  // Fecha o dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExamples && !target.closest('.relative')) {
        setShowExamples(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExamples]);

  // Configuração do Monaco Editor antes de carregar
  const handleEditorWillMount = (monaco: Monaco) => {
    // Registra o tema personalizado
    monaco.editor.defineTheme('sonoTheme', monacoTheme);

    // Registra a linguagem SonoScript
    monaco.languages.register({ id: 'sonoscript' });
    monaco.languages.setMonarchTokensProvider('sonoscript', {
      tokenizer: {
        root: [
          [/\/\/.*$/, 'comment'],
          [/\b(sequence|repeat|bpm|volume)\b/, 'keyword'],
          [/[A-G][#b]?[0-8]/, 'identifier'],  // Notas musicais
          [/\d+\/\d+/, 'number'],             // Durações
          [/[{}()]/, 'delimiter'],
          [/,/, 'delimiter'],
        ],
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0f1419]">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">SonoScript</h1>
              <p className="text-xs text-gray-400">Musical Programming Language</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-6">
          {/* Editor Panel */}
          <div className="h-[calc(100vh-120px)]">
            <div className="bg-[#0f1419] rounded-xl border border-gray-800 overflow-hidden h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0a0e14] flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40"></div>
                  </div>
                  <span className="text-sm text-gray-500 ml-3">music.sono</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="px-3 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1.5 text-sm border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>Executar</span>
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={!isPlaying}
                    className="px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1.5 text-sm border border-red-500/30 hover:border-red-500/50 text-red-400"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12"/>
                    </svg>
                    <span>Parar</span>
                  </button>
                  <button
                    onClick={handleGenerateSheet}
                    className="px-3 py-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition-colors flex items-center space-x-1.5 text-sm border border-blue-500/30 hover:border-blue-500/50 text-blue-400"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Partitura</span>
                  </button>

                  {/* Botão de Exemplos com Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowExamples(!showExamples)}
                      className="px-3 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 transition-colors flex items-center space-x-1.5 text-sm border border-amber-500/30 hover:border-amber-500/50 text-amber-400"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <span>Exemplos</span>
                      <svg className={`w-3 h-3 transition-transform ${showExamples ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showExamples && (
                      <div className="absolute right-0 mt-2 w-64 bg-[#0f1419] rounded-lg border border-gray-700 shadow-xl z-50 overflow-hidden">
                        <div className="py-1">
                          <button
                            onClick={() => handleLoadExample('twinkle')}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-800/50 transition-colors border-b border-gray-800/50"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">⭐</span>
                              <div>
                                <div className="text-sm font-medium text-gray-200">Twinkle Twinkle Little Star</div>
                                <div className="text-xs text-gray-500">Canção infantil clássica</div>
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => handleLoadExample('mary')}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-800/50 transition-colors border-b border-gray-800/50"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">🐑</span>
                              <div>
                                <div className="text-sm font-medium text-gray-200">Mary Had a Little Lamb</div>
                                <div className="text-xs text-gray-500">Melodia tradicional simples</div>
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => handleLoadExample('birthday')}
                            className="w-full px-4 py-2.5 text-left hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">🎂</span>
                              <div>
                                <div className="text-sm font-medium text-gray-200">Parabéns a Você</div>
                                <div className="text-xs text-gray-500">Música de aniversário</div>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <Editor
                  defaultLanguage="sonoscript"
                  theme="sonoTheme"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  beforeMount={handleEditorWillMount}
                  options={{
                    fontSize: 14,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    renderLineHighlight: 'all',
                    lineNumbers: 'on',
                    lineNumbersMinChars: 3,
                    padding: { top: 16, bottom: 16 },
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                    tabSize: 2,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Output & Docs */}
          <div className="flex flex-col gap-4 h-[calc(100vh-120px)]">
            {/* Output Console */}
            <div className="bg-[#0f1419] rounded-xl border border-gray-800 overflow-hidden flex-shrink-0">
              <div className="px-4 py-3 border-b border-gray-800 bg-[#0a0e14]">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-sm font-medium text-gray-400">Console</h2>
                </div>
              </div>
              <pre className="h-[300px] p-4 font-mono text-xs bg-[#0a0e14] text-gray-400 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {output || '// Aguardando execução...'}
              </pre>
            </div>

            {/* Documentation Panel */}
            <div className="bg-[#0f1419] rounded-xl border border-gray-800 overflow-hidden flex-1 flex flex-col">
              <div className="px-4 py-3 border-b border-gray-800 bg-[#0a0e14] flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h2 className="text-sm font-medium text-gray-400">Referência Rápida</h2>
                </div>
              </div>

              <div className="p-4 space-y-4 overflow-auto flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {/* Comandos */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Comandos</h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2 text-sm">
                      <code className="text-blue-400 font-mono text-xs px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">bpm</code>
                      <span className="text-gray-500 text-xs">Andamento (60-200)</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm">
                      <code className="text-blue-400 font-mono text-xs px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">volume</code>
                      <span className="text-gray-500 text-xs">Volume (0-100)</span>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div className="pt-2 border-t border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notas Musicais</h3>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(note => (
                        <span key={note} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs font-mono border border-emerald-500/20">
                          {note}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-emerald-400 font-mono">#</span> sustenido ·
                      <span className="text-emerald-400 font-mono ml-1">b</span> bemol
                    </div>
                    <div className="text-xs text-gray-500">
                      Oitavas: <span className="text-emerald-400 font-mono">0-8</span>
                    </div>
                  </div>
                </div>

                {/* Durações */}
                <div className="pt-2 border-t border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Durações</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {['1', '1/2', '1/4', '1/8', '1/16'].map(dur => (
                      <span key={dur} className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-xs font-mono border border-yellow-500/20">
                        {dur}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Estruturas */}
                <div className="pt-2 border-t border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estruturas</h3>
                  <div className="space-y-2">
                    <div className="bg-gray-800/30 rounded p-2 border border-gray-700/50">
                      <code className="text-xs text-gray-300 font-mono">
                        <span className="text-blue-400">sequence</span> nome {'{ '}
                        <span className="text-gray-500">...</span>
                        {' }'}
                      </code>
                    </div>
                    <div className="bg-gray-800/30 rounded p-2 border border-gray-700/50">
                      <code className="text-xs text-gray-300 font-mono">
                        <span className="text-blue-400">repeat</span>(n) {'{ '}
                        <span className="text-gray-500">...</span>
                        {' }'}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Exemplo */}
                <div className="pt-2 border-t border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Exemplo</h3>
                  <div className="bg-gray-800/30 rounded p-3 border border-gray-700/50">
                    <code className="text-xs text-gray-300 font-mono leading-relaxed">
                      <span className="text-blue-400">bpm</span> <span className="text-yellow-400">120</span><br/>
                      <span className="text-emerald-400">C4</span> <span className="text-yellow-400">1/4</span>,{' '}
                      <span className="text-emerald-400">E4</span> <span className="text-yellow-400">1/4</span>
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Partitura */}
      <SheetMusicModal
        abcNotation={abcNotation}
        isOpen={showSheetMusic}
        onClose={() => setShowSheetMusic(false)}
      />
    </div>
  );
} 