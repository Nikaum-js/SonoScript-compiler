import { Parser } from "./Parser";

const sourceCode = `
// Define o andamento e volume
bpm 120
volume 80

// Define uma sequência principal
sequence main {
  // Melodia principal
  C4 1/4, D4 1/4, E4 1/4, F4 1/4,
  
  // Repete um padrão 4 vezes
  repeat(4) {
    G4 1/8, A4 1/8, B4 1/4
  }
}

// Define uma sequência de acompanhamento
sequence accompaniment {
  C3 1/2, G3 1/2,
  repeat(2) {
    E3 1/4, G3 1/4
  }
}
`;

try {
  const parser = new Parser(sourceCode);
  const ast = parser.parse();
  console.log("AST gerada com sucesso:");
  console.log(JSON.stringify(ast, null, 2));
} catch (error) {
  console.error("Erro ao fazer o parse do código:");
  console.error(error);
}
