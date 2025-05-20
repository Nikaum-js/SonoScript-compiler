import { Parser } from "../parser/Parser";
import { Executor } from "./Executor";

const sourceCode = `
// Define uma melodia simples
bpm 120
volume 80

sequence melody {
  // Escala de Dó maior
  C4 1/4, D4 1/4, E4 1/4, F4 1/4,
  G4 1/4, A4 1/4, B4 1/4, C5 1/4,
  
  // Repete a escala descendente
  repeat(1) {
    C5 1/4, B4 1/4, A4 1/4, G4 1/4,
    F4 1/4, E4 1/4, D4 1/4, C4 1/4
  }
}
`;

// Cria o parser e o executor
const parser = new Parser(sourceCode);
const executor = new Executor({
  onNoteStart: (note, time) => {
    console.log(`Nota iniciada: ${note} em ${time.toFixed(2)}s`);
  },
  onNoteEnd: (note, time) => {
    console.log(`Nota finalizada: ${note} em ${time.toFixed(2)}s`);
  },
  onSequenceStart: (name, time) => {
    console.log(`\nSequência iniciada: ${name} em ${time.toFixed(2)}s`);
  },
  onSequenceEnd: (name, time) => {
    console.log(`\nSequência finalizada: ${name} em ${time.toFixed(2)}s`);
  },
});

try {
  // Faz o parse do código
  const ast = parser.parse();
  console.log("AST gerada:");
  console.log(JSON.stringify(ast, null, 2));

  // Executa o programa
  console.log("\nIniciando execução...\n");
  executor.execute(ast);

  // Para a execução após 10 segundos
  setTimeout(() => {
    executor.stop();
    console.log("\nExecução finalizada.");
  }, 10000);
} catch (error) {
  console.error("Erro:", error);
}
