# SonoScript - Documentação Completa

## 📚 Índice
1. [Visão Geral](#visão-geral)
2. [Características](#características)
3. [Arquitetura do Projeto](#arquitetura-do-projeto)
4. [Sintaxe da Linguagem](#sintaxe-da-linguagem)
5. [Componentes Principais](#componentes-principais)
6. [Exemplos de Código](#exemplos-de-código)
7. [Como Executar](#como-executar)
8. [Tecnologias Utilizadas](#tecnologias-utilizadas)

---

## Visão Geral

**SonoScript** é uma linguagem de programação musical desenvolvida do zero, projetada para criar e executar composições musicais através de código. O projeto implementa um compilador completo com analisador léxico (Lexer), analisador sintático (Parser) e executor (Interpreter) que converte código em áudio utilizando a Web Audio API.

### O que faz?
- Permite escrever música usando uma sintaxe simples e intuitiva
- Compila código SonoScript em uma Árvore de Sintaxe Abstrata (AST)
- Executa a música em tempo real no navegador
- Fornece controle sobre tempo (BPM), volume e estrutura musical

---

## Características

- ✅ **Linguagem de Domínio Específico (DSL)** para composição musical
- ✅ **Compilador Completo** com Lexer, Parser e Executor
- ✅ **Editor de Código Integrado** com syntax highlighting usando Monaco Editor
- ✅ **Execução em Tempo Real** via Web Audio API
- ✅ **Geração de Partituras** - Converte código em notação musical tradicional usando ABC Notation
- ✅ **Visualização de Partituras** - Renderização visual com ABCjs em tema dark
- ✅ **Exportação de Partituras** - Download em imagem PNG de alta qualidade
- ✅ **Interface Dark Theme** - Design escuro consistente em toda aplicação
- ✅ **Botões com Cores Semânticas** - Sistema de cores intuitivo (verde=executar, vermelho=parar, azul=partitura, roxo=exportar)
- ✅ **Controles Musicais**: BPM, Volume, Sequências, Repetições
- ✅ **Suporte a Notas Musicais**: Todas as notas de C a B com sustenidos (#) e bemóis (b)
- ✅ **Durações Variadas**: Semibreve (1), Mínima (1/2), Semínima (1/4), Colcheia (1/8), Semicolcheia (1/16)
- ✅ **Interface Moderna** com React, TypeScript e Tailwind CSS

---

## Arquitetura do Projeto

```
SonoScript/
├── src/
│   ├── compiler/
│   │   ├── lexer/
│   │   │   ├── Lexer.ts          # Analisador Léxico
│   │   │   ├── types.ts          # Tipos de Tokens
│   │   │   └── example.ts        # Exemplos de uso
│   │   ├── parser/
│   │   │   ├── Parser.ts         # Analisador Sintático
│   │   │   ├── types.ts          # Tipos da AST
│   │   │   └── example.ts        # Exemplos de uso
│   │   └── executor/
│   │       ├── Executor.ts       # Interpretador/Runtime
│   │       ├── types.ts          # Tipos de execução
│   │       └── example.ts        # Exemplos de uso
│   ├── components/
│   │   ├── Editor/
│   │   │   └── CodeEditor.tsx    # Interface do Editor
│   │   ├── SheetMusicModal.tsx   # Modal de visualização de partituras
│   │   └── ui/                   # Componentes de UI
│   ├── utils/
│   │   └── sheetMusicConverter.ts # Conversor AST → ABC Notation
│   ├── App.tsx                   # Componente principal
│   └── main.tsx                  # Ponto de entrada
└── package.json
```

### Fluxo de Execução

```
Código SonoScript (String)
    ↓
[Lexer] → Tokenização
    ↓
Lista de Tokens
    ↓
[Parser] → Análise Sintática
    ↓
AST (Árvore de Sintaxe Abstrata)
    ↓
┌─────────────────────┴────────────────────┐
│                                          │
▼                                          ▼
[Executor] → Interpretação      [SheetMusicConverter]
    ↓                                      ↓
Áudio (Web Audio API)          ABC Notation → Partitura Visual
```

---

## Sintaxe da Linguagem

### 1. Configurações Globais

#### BPM (Batidas Por Minuto)
Define o andamento da música.

```sonoscript
bpm 120
```

#### Volume
Define o volume da execução (0-100).

```sonoscript
volume 80
```

### 2. Notas Musicais

As notas seguem o formato: `NOTA[MODIFICADOR]OITAVA DURAÇÃO`

#### Formato de Notas
- **Nota**: C, D, E, F, G, A, B
- **Modificador** (opcional): `#` (sustenido) ou `b` (bemol)
- **Oitava**: 0-8
- **Duração**: 1 (semibreve), 1/2 (mínima), 1/4 (semínima), 1/8 (colcheia), 1/16 (semicolcheia)

#### Exemplos
```sonoscript
C4 1/4      // Dó central, semínima
D#5 1/8     // Ré sustenido (oitava 5), colcheia
Eb3 1/2     // Mi bemol (oitava 3), mínima
G4 1        // Sol (oitava 4), semibreve
```

### 3. Sequências

Agrupa uma série de instruções musicais sob um nome.

```sonoscript
sequence nome_da_sequencia {
  C4 1/4,
  E4 1/4,
  G4 1/2
}
```

### 4. Repetições

Repete um bloco de código N vezes.

```sonoscript
repeat(3) {
  C4 1/4,
  E4 1/4,
  G4 1/4
}
```

### 5. Comentários

```sonoscript
// Este é um comentário de linha única
```

---

## Componentes Principais

### 1. Lexer (Analisador Léxico)

**Localização**: `src/compiler/lexer/Lexer.ts`

O Lexer é responsável por transformar o código fonte em uma sequência de tokens.

#### Principais Funcionalidades:
- Reconhece notas musicais (C4, D#5, etc.)
- Identifica palavras-chave (bpm, volume, sequence, repeat)
- Reconhece números e durações (1/4, 1/8, etc.)
- Identifica símbolos ({, }, (, ), ,)
- Suporta comentários (//)
- Rastreamento de linha e coluna para mensagens de erro

#### Tipos de Tokens:
```typescript
enum TokenType {
  NOTE,        // Notas musicais
  BPM,         // Palavra-chave bpm
  VOLUME,      // Palavra-chave volume
  REPEAT,      // Palavra-chave repeat
  SEQUENCE,    // Palavra-chave sequence
  NUMBER,      // Números
  IDENTIFIER,  // Identificadores
  LPAREN,      // (
  RPAREN,      // )
  LBRACE,      // {
  RBRACE,      // }
  COMMA,       // ,
  EOF          // Fim do arquivo
}
```

#### Exemplo de Uso:
```typescript
const lexer = new Lexer("C4 1/4");
let token = lexer.nextToken(); // { type: NOTE, value: "C4" }
token = lexer.nextToken();      // { type: NUMBER, value: "1/4" }
```

---

### 2. Parser (Analisador Sintático)

**Localização**: `src/compiler/parser/Parser.ts`

O Parser transforma a lista de tokens em uma Árvore de Sintaxe Abstrata (AST).

#### Nós da AST:

1. **Program**: Nó raiz que contém todo o programa
2. **BpmStatement**: Define o BPM
3. **VolumeStatement**: Define o volume
4. **SequenceDeclaration**: Declara uma sequência nomeada
5. **RepeatStatement**: Repete um bloco de código
6. **NoteExpression**: Representa uma nota musical

#### Estrutura da AST:
```typescript
interface Program {
  type: "Program";
  body: Statement[];
}

interface NoteExpression {
  type: "NoteExpression";
  note: string;        // C, D, E, etc.
  modifier?: string;   // # ou b
  octave: number;      // 0-8
  duration: string;    // 1/4, 1/8, etc.
}
```

#### Exemplo de Uso:
```typescript
const parser = new Parser("bpm 120\nC4 1/4");
const ast = parser.parse();
// Retorna uma AST com BpmStatement e NoteExpression
```

---

### 3. Executor (Interpretador)

**Localização**: `src/compiler/executor/Executor.ts`

O Executor interpreta a AST e gera áudio usando a Web Audio API.

#### Principais Funcionalidades:
- Converte notas em frequências (Hz)
- Calcula durações baseadas no BPM
- Gerencia o AudioContext do navegador
- Cria osciladores e envelopes de amplitude (ADSR simplificado)
- Suporta callbacks para eventos de execução

#### Mapeamento de Frequências:
O executor usa a frequência de C0 (16.35 Hz) como base e calcula outras oitavas usando a fórmula:
```
frequência = frequência_base × 2^oitava
```

#### Durações Base (120 BPM):
- Semibreve (1): 2 segundos
- Mínima (1/2): 1 segundo
- Semínima (1/4): 0.5 segundos
- Colcheia (1/8): 0.25 segundos
- Semicolcheia (1/16): 0.125 segundos

As durações são ajustadas de acordo com o BPM configurado.

#### Exemplo de Uso:
```typescript
const executor = new Executor({
  onNoteStart: (note, time) => console.log(`Nota iniciada: ${note}`),
  onNoteEnd: (note, time) => console.log(`Nota finalizada: ${note}`)
});

const parser = new Parser(code);
const ast = parser.parse();
executor.execute(ast);
```

---

### 4. Interface de Usuário (CodeEditor)

**Localização**: `src/components/Editor/CodeEditor.tsx`

Editor de código integrado com Monaco Editor (mesmo editor do VS Code).

#### Funcionalidades:
- Syntax highlighting personalizado para SonoScript
- Tema escuro customizado (`bg-[#0f1419]`)
- **Botões de controle com cores semânticas:**
  - **Executar** (Verde): Compila e toca o código
  - **Parar** (Vermelho): Interrompe a execução
  - **Partitura** (Azul): Abre modal de visualização
- Sistema de opacidade: `bg-{color}-500/10` com hover em `/20`
- Painel de saída mostrando logs de execução em tempo real
- Painel de referência rápida com sintaxe e exemplos
- Código de exemplo (Ode à Alegria de Beethoven)

#### Configuração do Monaco:
- Linguagem customizada: `sonoscript`
- Tema personalizado: `sonoTheme`
- Tokenização para highlighting de:
  - Comentários
  - Palavras-chave (sequence, repeat, bpm, volume)
  - Notas musicais (C4, D#5, etc.)
  - Durações (1/4, 1/8, etc.)
  - Delimitadores ({, }, (, ), ,)

---

### 5. Visualização de Partituras (SheetMusicModal)

**Localização**: `src/components/SheetMusicModal.tsx`

Modal para visualização e exportação de partituras musicais geradas a partir do código SonoScript.

#### Funcionalidades:
- **Tema Dark Consistente**: Modal escuro (`bg-[#0f1419]`) integrado ao design
- **Renderização Visual**: Exibe partitura tradicional usando biblioteca ABCjs
- **Fundo Branco para Partitura**: Contraste perfeito para leitura musical
- **Visualização de Código ABC**: Expansível via details/summary
- **Exportação PNG**: Download de imagem em alta qualidade (scale 3x)
- **Botão Exportar** (Roxo): Cor semântica para ação de exportação de mídia
- **Interface Responsiva**: Design moderno com Tailwind CSS

#### Especificações Técnicas:
- **ABCjs Config**:
  - `staffwidth`: 750px (espaçamento otimizado)
  - `scale`: 1.15
  - `foregroundColor`: #000000 (preto puro)
- **Exportação**:
  - Formato: PNG
  - Qualidade: Alta (scale 3x)
  - Nome arquivo: `partitura.png`
  - Método: `html2canvas` → `blob` → download

#### Fluxo de Uso:
1. Usuário escreve código SonoScript no editor
2. Clica em "Partitura" (botão azul)
3. AST é convertido para ABC Notation
4. Modal dark abre exibindo a partitura visual em fundo branco
5. Usuário pode:
   - Visualizar a partitura renderizada
   - Expandir para ver código ABC
   - Clicar em "Exportar" (botão roxo) para baixar PNG

---

### 6. Conversor de Partituras (SheetMusicConverter)

**Localização**: `src/utils/sheetMusicConverter.ts`

Utilitário que converte a AST (Árvore de Sintaxe Abstrata) em ABC Notation, um formato de texto padrão para representação de música.

#### Funcionalidades Principais:
- **Conversão de Notas**: Traduz notação SonoScript para ABC
  - `C4` → `C`
  - `D#5` → `^d` (sustenido)
  - `Eb3` → `_E` (bemol)
- **Mapeamento de Oitavas**: Ajusta oitavas usando vírgulas e apóstrofos
  - Oitavas baixas (0-2): Adiciona vírgulas (`,`)
  - Oitavas altas (5-8): Adiciona apóstrofos (`'`)
  - Oitava central (3-4): Maiúsculas/minúsculas
- **Conversão de Durações**: Traduz durações de SonoScript para ABC
  - `1` → `4` (semibreve)
  - `1/2` → `2` (mínima)
  - `1/4` → `1` (semínima)
  - `1/8` → `/2` (colcheia)
  - `1/16` → `/4` (semicolcheia)
- **Metadados**: Adiciona cabeçalho ABC com informações:
  - Índice de referência (X:)
  - Título (T:)
  - Compasso (M:)
  - Comprimento de nota padrão (L:)
  - Tempo/BPM (Q:)
  - Tonalidade (K:)

#### Exemplo de Conversão:

**Input (SonoScript AST)**:
```typescript
{
  type: "Program",
  body: [
    { type: "BpmStatement", value: 120 },
    { type: "NoteExpression", note: "C", octave: 4, duration: "1/4" },
    { type: "NoteExpression", note: "D", modifier: "#", octave: 5, duration: "1/8" }
  ]
}
```

**Output (ABC Notation)**:
```abc
X:1
T:Partitura
M:4/4
L:1/4
Q:1/4=120
K:C
C ^d/2
```

---

## Exemplos de Código

### Exemplo 1: Escala de Dó Maior
```sonoscript
bpm 120
volume 80

sequence escala_do {
  C4 1/4,
  D4 1/4,
  E4 1/4,
  F4 1/4,
  G4 1/4,
  A4 1/4,
  B4 1/4,
  C5 1/2
}
```

### Exemplo 2: Acorde com Repetição
```sonoscript
bpm 90
volume 70

repeat(4) {
  C4 1/4,
  E4 1/4,
  G4 1/4,
  C5 1/4
}
```

### Exemplo 3: Ode à Alegria (Beethoven)
```sonoscript
// Ode à Alegria - Ludwig van Beethoven
bpm 80
volume 80

sequence ode_alegria {
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
    D4 1/4, C4 1/8, C4 1/2
  }
}
```

### Exemplo 4: Padrão Rítmico
```sonoscript
bpm 140
volume 90

sequence bateria {
  repeat(8) {
    C3 1/8,
    C3 1/8,
    C3 1/4,
    C3 1/8,
    C3 1/8
  }
}
```

---

## Casos de Uso Práticos

### Caso 1: Compor e Tocar Música

1. **Escrever código SonoScript no editor**
   ```sonoscript
   bpm 120
   volume 80

   sequence melodia {
     C4 1/4, E4 1/4, G4 1/4, C5 1/2
   }
   ```

2. **Clicar em "Executar"**
   - O código é compilado (Lexer → Parser → AST)
   - O áudio é sintetizado e tocado
   - O console mostra eventos em tempo real:
     ```
     ▶ Executando código...
     ▶ Iniciando sequência: melodia
     ♪ Nota iniciada: C4 (261.63 Hz) em 0.000s
     ♪ Nota finalizada: C4 em 0.500s
     ...
     ```

3. **Resultado**: Música tocando no navegador com Web Audio API

### Caso 2: Gerar Partitura Visual

1. **Escrever composição**
   ```sonoscript
   bpm 90
   sequence escala {
     C4 1/4, D4 1/4, E4 1/4, F4 1/4,
     G4 1/4, A4 1/4, B4 1/4, C5 1/2
   }
   ```

2. **Clicar em "Partitura" (botão azul)**
   - AST é convertido para ABC Notation
   - Modal dark abre mostrando:
     - Partitura visual renderizada com pentagrama em fundo branco
     - Código ABC Notation correspondente (expansível)

3. **Visualizar ou Exportar**
   - Ver partitura tradicional no navegador
   - Clicar em "Exportar" (botão roxo) para baixar imagem PNG de alta qualidade
   - Usar código ABC em outros softwares (MuseScore, EasyABC)

### Caso 3: Aprender Teoria Musical

Usar SonoScript como ferramenta educacional:

```sonoscript
// Aprender intervalos musicais
bpm 100

sequence tercas {
  // Terça maior: C-E (4 semitons)
  C4 1/4, E4 1/4,

  // Terça menor: E-G (3 semitons)
  E4 1/4, G4 1/4
}

sequence escalas {
  // Escala maior de C
  C4 1/8, D4 1/8, E4 1/8, F4 1/8,
  G4 1/8, A4 1/8, B4 1/8, C5 1/4
}
```

### Caso 4: Prototipar Melodias Rapidamente

Testar ideias musicais sem instrumentos físicos:

```sonoscript
bpm 140
volume 90

// Testar diferentes versões da melodia
sequence versao1 {
  E4 1/8, D4 1/8, C4 1/4, E4 1/4
}

sequence versao2 {
  E4 1/8, D#4 1/8, C4 1/4, E4 1/4
}

// Adicionar repetições para ouvir melhor
repeat(4) {
  E4 1/8, D4 1/8, C4 1/4, E4 1/4
}
```

---

## Como Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd SonoScript
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

### Executar em Modo de Desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

O projeto estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
# ou
yarn build
```

Os arquivos otimizados serão gerados no diretório `dist/`

### Visualizar Build de Produção

```bash
npm run preview
# ou
yarn preview
```

---

## Tecnologias Utilizadas

### Frontend
- **React 18.2** - Biblioteca de UI
- **TypeScript 5.3** - Superset tipado de JavaScript
- **Vite 5.0** - Build tool e dev server
- **Tailwind CSS 3.3** - Framework CSS utility-first
- **Monaco Editor 4.7** - Editor de código (VS Code)

### Bibliotecas de UI
- **@monaco-editor/react** - Integração do Monaco com React
- **Radix UI** - Componentes primitivos acessíveis
- **Lucide React** - Ícones
- **clsx** & **tailwind-merge** - Gerenciamento de classes CSS

### Bibliotecas de Áudio e Música
- **Web Audio API** - Síntese e reprodução de áudio (nativa do navegador)
- **ABCjs 6.5.2** - Renderização de notação musical ABC em partituras visuais
- **html2canvas 1.4.1** - Captura de elementos DOM como imagens PNG de alta qualidade

### Ferramentas de Desenvolvimento
- **ESLint 8.54** - Linter para JavaScript/TypeScript
- **PostCSS 8.4** - Processamento de CSS
- **Autoprefixer 10.4** - Prefixos CSS automáticos
- **TypeScript ESLint 8.30** - Linting específico para TypeScript

---

## Dependências Detalhadas

### Dependências de Produção

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **react** | 18.2.0 | Framework de UI principal |
| **react-dom** | 18.2.0 | Renderização React no DOM |
| **@monaco-editor/react** | 4.7.0 | Wrapper React para Monaco Editor |
| **monaco-editor** | 0.45.0 | Editor de código (VS Code) |
| **abcjs** | 6.5.2 | Renderização de notação musical ABC |
| **html2canvas** | 1.4.1 | Captura de DOM para exportação PNG |
| **@radix-ui/react-label** | 2.0.0 | Componente de label acessível |
| **@radix-ui/react-slot** | 1.0.0 | Composição de componentes Radix |
| **lucide-react** | 0.292.0 | Biblioteca de ícones |
| **clsx** | 2.0.0 | Utilitário para classes CSS condicionais |
| **tailwind-merge** | 2.0.0 | Merge inteligente de classes Tailwind |
| **class-variance-authority** | 0.7.0 | Gerenciamento de variantes de componentes |
| **tailwindcss-animate** | 1.0.7 | Animações para Tailwind CSS |

### Dependências de Desenvolvimento

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **vite** | 5.0.0 | Build tool e dev server |
| **typescript** | 5.3.2 | Compilador TypeScript |
| **@vitejs/plugin-react** | 4.2.0 | Plugin Vite para React |
| **tailwindcss** | 3.3.5 | Framework CSS utility-first |
| **@tailwindcss/forms** | 0.5.10 | Estilos para formulários |
| **@tailwindcss/typography** | 0.5.16 | Estilos tipográficos |
| **eslint** | 8.54.0 | Linter JavaScript/TypeScript |
| **typescript-eslint** | 8.30.1 | Parser ESLint para TypeScript |
| **@types/node** | 20.10.0 | Tipos TypeScript para Node.js |
| **@types/react** | 18.2.0 | Tipos TypeScript para React |
| **@types/react-dom** | 18.2.0 | Tipos TypeScript para React DOM |
| **autoprefixer** | 10.4.16 | PostCSS plugin para prefixos CSS |
| **postcss** | 8.4.31 | Processador de CSS |

### Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (Vite)
npm run build    # Build de produção (TypeScript + Vite)
npm run lint     # Verificação de código (ESLint)
npm run preview  # Preview do build de produção
```

---

## Arquitetura Técnica Detalhada

### Pipeline de Compilação

#### 1. Lexer (Tokenização)
O Lexer percorre o código caractere por caractere e agrupa-os em tokens significativos.

**Processo:**
1. Lê caractere atual
2. Identifica tipo de token baseado em padrões
3. Avança posição e atualiza linha/coluna
4. Retorna token com metadados

**Tratamento de Erros:**
- Caracteres inválidos geram erro com posição exata
- Notas sem oitava geram erro específico

#### 2. Parser (Análise Sintática)
O Parser consome tokens e constrói uma estrutura hierárquica (AST).

**Processo:**
1. Consome token esperado (método `eat()`)
2. Valida sintaxe
3. Constrói nós da AST recursivamente
4. Lida com aninhamento de estruturas

**Tratamento de Erros:**
- Tokens inesperados geram erro com tipo esperado vs encontrado
- Validação de formato de notas

#### 3. Executor (Interpretação)
O Executor percorre a AST e gera áudio.

**Processo:**
1. Inicializa AudioContext
2. Percorre AST executando cada statement
3. Para cada nota:
   - Calcula frequência baseada em nota/oitava
   - Calcula duração baseada em tempo e BPM
   - Cria oscilador com envelope ADSR
   - Agenda reprodução no timeline do AudioContext
4. Gerencia tempo global para sincronização

**Web Audio API:**
- `AudioContext`: Contexto de áudio principal
- `OscillatorNode`: Gerador de onda senoidal
- `GainNode`: Controle de volume e envelope
- Envelope simplificado:
  - Attack: 0.01s (fade in rápido)
  - Release: 0.05s (fade out suave)

---

## Limitações Atuais

1. **Apenas notas simples**: Não suporta acordes simultâneos (polifonia)
2. **Sem pausas explícitas**: Não há notação para silêncios/pausas
3. **Tipo de onda fixo**: Sempre usa onda senoidal (sine wave)
4. **Sem polifonia**: Uma nota por vez
5. **Sem exportação de áudio**: Não salva áudio em arquivo WAV/MP3 (disponível apenas exportação de partitura em PNG)

---

## Possíveis Melhorias Futuras

### Funcionalidades da Linguagem
- [ ] Suporte a acordes (múltiplas notas simultâneas)
- [ ] Pausas/silêncios explícitos
- [ ] Variáveis e constantes
- [ ] Funções/macros
- [ ] Importação de arquivos

### Áudio
- [ ] Tipos de ondas (senoidal, quadrada, triangular, etc.)
- [ ] Efeitos (reverb, delay, chorus)
- [ ] Múltiplos instrumentos
- [ ] Exportação para MIDI ou WAV

### Interface
- [x] **Geração de partituras** (ABC Notation + visualização)
- [x] **Modal de partitura** com renderização visual em tema dark
- [x] **Exportação de partituras** em formato PNG de alta qualidade
- [x] **Sistema de cores semânticas** para botões com opacidade
- [ ] Visualizador de forma de onda em tempo real
- [ ] Piano roll visual interativo
- [ ] Autocomplete inteligente no editor
- [ ] Detecção de erros em tempo real (linting)
- [ ] Temas de cores adicionais

### Ferramentas
- [ ] Compilador CLI
- [ ] Playground online
- [ ] Biblioteca de exemplos
- [ ] Sistema de plugins

---

## Conceitos de Ciência da Computação Aplicados

### 1. Teoria de Linguagens Formais
- **Gramática Livre de Contexto**: Define a sintaxe do SonoScript
- **Autômatos Finitos**: Usados no Lexer para reconhecer padrões

### 2. Compiladores
- **Análise Léxica**: Tokenização
- **Análise Sintática**: Parsing (descendente recursivo)
- **Análise Semântica**: Validação de tipos (implícita)
- **Geração de Código**: Instruções para Web Audio API

### 3. Estruturas de Dados
- **Árvore de Sintaxe Abstrata (AST)**: Representação hierárquica do programa
- **Filas de Prioridade**: Usado pelo AudioContext para scheduling

### 4. Padrões de Projeto
- **Visitor Pattern**: Percorrimento da AST no Executor
- **State Pattern**: Gerenciamento de estado do AudioContext
- **Observer Pattern**: Callbacks de eventos de execução

---

## ABC Notation - Formato de Partituras

### O que é ABC Notation?

ABC Notation é um formato de texto simples para representar música, amplamente usado para partituras tradicionais. É legível por humanos e facilmente processável por computadores.

### Estrutura de um Arquivo ABC

Um arquivo ABC típico possui:

```abc
X:1                    % Número de referência
T:Nome da Música       % Título
M:4/4                  % Compasso (4/4, 3/4, etc.)
L:1/4                  % Duração padrão de nota
Q:1/4=120             % Tempo (120 BPM para semínimas)
K:C                    % Tonalidade (C major)
C D E F | G A B c |   % Notas da música
```

### Conversão SonoScript → ABC

| SonoScript | ABC | Descrição |
|------------|-----|-----------|
| `C4 1/4` | `C` | Dó na 4ª oitava, semínima |
| `D#5 1/8` | `^d/2` | Ré sustenido na 5ª oitava, colcheia |
| `Eb3 1/2` | `_E2` | Mi bemol na 3ª oitava, mínima |
| `G2 1` | `G,4` | Sol na 2ª oitava, semibreve |
| `A6 1/16` | `a'/4` | Lá na 6ª oitava, semicolcheia |

### Modificadores em ABC

- **Sustenidos**: `^` antes da nota (`^C`, `^D`)
- **Bemóis**: `_` antes da nota (`_E`, `_B`)
- **Oitavas baixas**: `,` após a nota (`C,`, `D,`)
- **Oitavas altas**: `'` após a nota (`c'`, `d'`)
- **Maiúsculas**: Oitavas 3-4
- **Minúsculas**: Oitavas 5-6

### Software Compatível com ABC

A notação ABC gerada pode ser usada em:
- **EasyABC** - Editor ABC gratuito
- **ABCjs** - Renderizador web (usado no SonoScript)
- **MuseScore** - Importação de arquivos ABC
- **Finale/Sibelius** - Através de plugins

---

## Referências

### Documentação Oficial
- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [ABCjs Documentation](https://github.com/paulrosen/abcjs) - Biblioteca de renderização de partituras
- [ABC Notation Standard](https://abcnotation.com/) - Especificação oficial do formato ABC

### Teoria Musical
- Notas baseadas no sistema de afinação temperada ocidental
- Frequências calculadas usando A4 = 440 Hz como referência
- Sistema de notação anglo-saxônico (C, D, E, F, G, A, B)

### Compiladores
- "Compilers: Principles, Techniques, and Tools" (Dragon Book)
- "Crafting Interpreters" por Robert Nystrom

---

## Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

## Autor

Desenvolvido como projeto educacional para demonstrar conceitos de:
- Desenvolvimento de linguagens de programação
- Compiladores e interpretadores
- Síntese de áudio no navegador
- Desenvolvimento web moderno com React e TypeScript

---

**SonoScript** - Transformando código em música! 🎵
