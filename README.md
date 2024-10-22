# 🎵 SonoScript

Uma linguagem de programação musical criada do zero para compor e executar música através de código.

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 O que é SonoScript?

SonoScript é uma DSL (Domain-Specific Language) para composição musical que compila código em áudio executável no navegador. O projeto implementa um compilador completo com:

- **Lexer** (Analisador Léxico) - Tokenização do código fonte
- **Parser** (Analisador Sintático) - Construção de AST
- **Executor** (Interpretador) - Geração de áudio via Web Audio API

## ✨ Características

- 🎹 Sintaxe simples e intuitiva para composição musical
- 🎼 Suporte completo a notas musicais (C-B) com sustenidos/bemóis
- ⏱️ Controle de tempo (BPM) e volume
- 🔁 Estruturas de repetição e sequências nomeadas
- 🎨 Editor de código integrado com syntax highlighting
- 🔊 Execução em tempo real no navegador
- 📝 TypeScript para type safety

## 🚀 Quick Start

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd SonoScript

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no seu navegador.

### Exemplo Básico

```sonoscript
// Configure o andamento e volume
bpm 120
volume 80

// Crie uma sequência musical
sequence escala {
  C4 1/4,   // Dó, semínima
  D4 1/4,   // Ré, semínima
  E4 1/4,   // Mi, semínima
  F4 1/4,   // Fá, semínima
  G4 1/4,   // Sol, semínima
  A4 1/4,   // Lá, semínima
  B4 1/4,   // Si, semínima
  C5 1/2    // Dó (oitava acima), mínima
}
```

## 📖 Sintaxe

### Configurações

```sonoscript
bpm 120        // Define batidas por minuto (60-200)
volume 80      // Define volume (0-100)
```

### Notas Musicais

Formato: `NOTA[MODIFICADOR]OITAVA DURAÇÃO`

- **Nota**: C, D, E, F, G, A, B
- **Modificador**: `#` (sustenido) ou `b` (bemol)
- **Oitava**: 0-8
- **Duração**: `1` (semibreve), `1/2` (mínima), `1/4` (semínima), `1/8` (colcheia), `1/16` (semicolcheia)

```sonoscript
C4 1/4      // Dó central, semínima
D#5 1/8     // Ré sustenido (5ª oitava), colcheia
Eb3 1/2     // Mi bemol (3ª oitava), mínima
```

### Sequências

```sonoscript
sequence minha_melodia {
  C4 1/4,
  E4 1/4,
  G4 1/2
}
```

### Repetições

```sonoscript
repeat(4) {
  C4 1/4,
  E4 1/4,
  G4 1/4
}
```

### Comentários

```sonoscript
// Comentários de linha única
```

## 🏗️ Arquitetura

```
Código SonoScript
    ↓
[Lexer] → Tokens
    ↓
[Parser] → AST
    ↓
[Executor] → Áudio (Web Audio API)
```

### Estrutura do Projeto

```
src/
├── compiler/
│   ├── lexer/          # Análise léxica
│   ├── parser/         # Análise sintática
│   └── executor/       # Interpretação e execução
├── components/
│   └── Editor/         # Interface do editor
└── App.tsx             # Aplicação principal
```

## 🛠️ Tecnologias

- **React** - Interface de usuário
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Monaco Editor** - Editor de código (VS Code)
- **Tailwind CSS** - Estilização
- **Web Audio API** - Síntese de áudio

## 📚 Documentação Completa

Para documentação detalhada sobre a arquitetura, API e exemplos avançados, consulte:

👉 [DOCUMENTATION.md](./DOCUMENTATION.md)

A documentação inclui:
- Arquitetura detalhada de cada componente
- Explicação do pipeline de compilação
- Exemplos avançados de código
- Referências teóricas
- Guia de contribuição

## 🎼 Exemplos

### Ode à Alegria (Beethoven)

```sonoscript
bpm 80
volume 80

sequence ode_alegria {
  E4 1/4, E4 1/4, F4 1/4, G4 1/4,
  G4 1/4, F4 1/4, E4 1/4, D4 1/4,
  C4 1/4, C4 1/4, D4 1/4, E4 1/4,
  E4 1/4, D4 1/8, D4 1/2
}
```

### Acorde Arpejado

```sonoscript
bpm 140
volume 70

repeat(8) {
  C4 1/8,
  E4 1/8,
  G4 1/8,
  C5 1/8
}
```

## 🧪 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Executar linter
```

## 🎯 Roadmap

- [ ] Suporte a acordes (polifonia)
- [ ] Pausas/silêncios explícitos
- [ ] Variáveis e funções
- [ ] Tipos de onda variados
- [ ] Efeitos de áudio (reverb, delay)
- [ ] Exportação para MIDI/WAV
- [ ] Visualizador de forma de onda
- [ ] Piano roll visual

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido como projeto educacional para demonstrar:
- Desenvolvimento de linguagens de programação
- Compiladores e interpretadores
- Síntese de áudio no navegador
- Desenvolvimento web moderno

---

**Transformando código em música!** 🎵✨

Se você gostou do projeto, considere dar uma ⭐!
