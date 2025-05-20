import { Lexer } from "./Lexer";

const sourceCode = `
bpm 120
volume 80

sequence main {
  C4 1/4, D4 1/4, E4 1/4, F4 1/4
  repeat(4) {
    G4 1/8, A4 1/8, B4 1/4
  }
}
`;

const lexer = new Lexer(sourceCode);
let token = lexer.nextToken();

while (token.type !== "EOF") {
  console.log(token);
  token = lexer.nextToken();
}
