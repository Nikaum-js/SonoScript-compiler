import { useState } from 'react';
import { Parser } from '../../compiler/parser/Parser';
import { Executor } from '../../compiler/executor/Executor';
import Editor, { Monaco } from "@monaco-editor/react";
import * as monacoEditor from 'monaco-editor';

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

// Define o tema personalizado do Monaco
const monacoTheme: monacoEditor.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6272a4' },
    { token: 'keyword', foreground: 'ff79c6' },
    { token: 'number', foreground: 'bd93f9' },
    { token: 'string', foreground: 'f1fa8c' },
    { token: 'identifier', foreground: '50fa7b' },
  ],
  colors: {
    'editor.background': '#1a1b26',
    'editor.foreground': '#f8f8f2',
    'editor.lineHighlightBackground': '#2f3344',
    'editorLineNumber.foreground': '#565f89',
    'editorLineNumber.activeForeground': '#7982a9',
    'editor.selectionBackground': '#2d3f76',
    'editor.inactiveSelectionBackground': '#2d3f7680',
  },
};

export function CodeEditor() {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [executor, setExecutor] = useState<Executor | null>(null);

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
    <div className="min-h-screen bg-[#1a1b26] text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          SonoScript Editor
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-4">
            <div className="bg-[#24283b] rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-purple-400">Editor</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span className="text-lg">▶</span>
                    <span>Tocar</span>
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={!isPlaying}
                    className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span className="text-lg">⬛</span>
                    <span>Parar</span>
                  </button>
                </div>
              </div>
              
              <div className="h-[500px] rounded-md overflow-hidden border border-[#414868]">
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

          {/* Output Panel */}
          <div className="space-y-4">
            <div className="bg-[#24283b] rounded-lg p-4 shadow-lg">
              <h2 className="text-lg font-semibold text-purple-400 mb-4">Saída</h2>
              <pre className="w-full h-[500px] p-4 font-mono text-sm bg-[#1a1b26] text-gray-100 rounded-md 
                            border border-[#414868] overflow-auto whitespace-pre-wrap"
              >
                {output}
              </pre>
            </div>
          </div>
        </div>

        {/* Documentation Panel */}
        <div className="mt-8 bg-[#24283b] rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">Documentação Rápida</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-pink-400">Controles</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li><code className="text-yellow-400">bpm</code> - Define o andamento (60-200)</li>
                <li><code className="text-yellow-400">volume</code> - Define o volume (0-100)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-pink-400">Notas</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>Notas: <code className="text-yellow-400">C D E F G A B</code></li>
                <li>Modificadores: <code className="text-yellow-400"># b</code></li>
                <li>Oitavas: <code className="text-yellow-400">0-8</code></li>
                <li>Durações: <code className="text-yellow-400">1/1 1/2 1/4 1/8 1/16</code></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-pink-400">Estruturas</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li><code className="text-yellow-400">sequence nome { "{...}" }</code></li>
                <li><code className="text-yellow-400">repeat(n) { "{...}" }</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 