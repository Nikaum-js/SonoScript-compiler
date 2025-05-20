import { Parser } from "./parser/Parser";

// Exemplos de código SonoScript para testar
const testCases = [
  // Caso 1: Apenas notas simples
  {
    name: "Notas Simples",
    code: `
      C4 1/4, D4 1/4, E4 1/4
    `,
  },

  // Caso 2: Controles de tempo e volume
  {
    name: "Controles",
    code: `
      tempo 120
      volume 80
    `,
  },

  // Caso 3: Sequência simples
  {
    name: "Sequência",
    code: `
      sequence melody {
        C4 1/4, D4 1/4, E4 1/4
      }
    `,
  },

  // Caso 4: Repetição
  {
    name: "Repetição",
    code: `
      repeat(4) {
        C4 1/8, D4 1/8
      }
    `,
  },

  // Caso 5: Programa completo
  {
    name: "Programa Completo",
    code: `
      tempo 120
      volume 80
      
      sequence main {
        C4 1/4, D4 1/4,
        repeat(2) {
          E4 1/8, F4 1/8
        }
      }
    `,
  },
];

// Função para testar o parser
function testParser(testCase: { name: string; code: string }) {
  console.log(`\nTestando: ${testCase.name}`);
  console.log("Código:");
  console.log(testCase.code);

  try {
    const parser = new Parser(testCase.code);
    const ast = parser.parse();
    console.log("\nAST gerada:");
    console.log(JSON.stringify(ast, null, 2));
    console.log("\nResultado: ✅ Sucesso");
  } catch (error) {
    console.error("\nResultado: ❌ Erro");
    console.error(error);
  }

  console.log("-".repeat(50));
}

// Executar todos os testes
console.log("🎵 Iniciando testes do Parser SonoScript 🎵\n");
testCases.forEach(testParser);
