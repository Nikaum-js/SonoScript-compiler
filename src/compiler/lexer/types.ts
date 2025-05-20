export enum TokenType {
  // Notas musicais
  NOTE = "NOTE", // Exemplo: C4, D#4, etc
  DURATION = "DURATION", // Exemplo: 1/4, 1/8, etc
  OCTAVE = "OCTAVE", // Exemplo: 4, 5, etc

  // Controles musicais
  BPM = "BPM", // Define o BPM
  VOLUME = "VOLUME", // Define o volume (0-100)

  // Estruturas de controle
  REPEAT = "REPEAT", // Repetir trecho
  SEQUENCE = "SEQUENCE", // Definir sequência

  // Símbolos
  LPAREN = "(",
  RPAREN = ")",
  LBRACE = "{",
  RBRACE = "}",
  COMMA = ",",

  // Outros
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  EOF = "EOF",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
