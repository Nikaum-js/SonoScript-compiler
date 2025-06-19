import { Token, TokenType } from "./types";

export class Lexer {
  private source: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 0;
  private currentChar: string | null = null;

  constructor(source: string) {
    this.source = source;
    this.currentChar = this.source.length > 0 ? this.source[0] : null;
  }

  private advance(): void {
    this.position++;
    this.column++;
    this.currentChar =
      this.position < this.source.length ? this.source[this.position] : null;
  }

  private skipWhitespace(): void {
    while (this.currentChar && /\s/.test(this.currentChar)) {
      if (this.currentChar === "\n") {
        this.line++;
        this.column = 0;
      }
      this.advance();
    }
  }

  private skipComment(): void {
    // Pula a inicial //
    this.advance(); // Pula primeira /
    this.advance(); // Pula segunda /

    // Pula até a ultima linha
    while (this.currentChar !== null && this.currentChar !== "\n") {
      this.advance();
    }

    // Pula a newline character
    if (this.currentChar === "\n") {
      this.line++;
      this.column = 0;
      this.advance();
    }

    // Pula qualquer espaço em branco antes dos comentários
    this.skipWhitespace();
  }

  private isNoteStart(): boolean {
    const notes = ["C", "D", "E", "F", "G", "A", "B"];
    return (
      this.currentChar !== null &&
      notes.includes(this.currentChar.toUpperCase()) &&
      // Verifica se o próximo caractere é um modificador (#, b) ou um número
      this.position + 1 < this.source.length &&
      (this.source[this.position + 1] === "#" ||
        this.source[this.position + 1] === "b" ||
        /[0-9]/.test(this.source[this.position + 1]))
    );
  }

  private readNote(): Token {
    const startColumn = this.column;
    let value = "";

    // Lê a nota (C, D, etc)
    value += this.currentChar;
    this.advance();

    // Lê o modificador (#, b) se existir
    if (this.currentChar === "#" || this.currentChar === "b") {
      value += this.currentChar;
      this.advance();
    }

    // Lê a oitava
    let hasOctave = false;
    while (this.currentChar && /[0-9]/.test(this.currentChar)) {
      value += this.currentChar;
      hasOctave = true;
      this.advance();
    }

    if (!hasOctave) {
      throw new Error(
        `Nota inválida (falta oitava): ${value} na linha ${this.line}, coluna ${startColumn}`
      );
    }

    return {
      type: TokenType.NOTE,
      value,
      line: this.line,
      column: startColumn,
    };
  }

  private readNumber(): Token {
    const startColumn = this.column;
    let value = "";

    while (this.currentChar && /[0-9/.]/.test(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }

    return {
      type: TokenType.NUMBER,
      value,
      line: this.line,
      column: startColumn,
    };
  }

  private readIdentifier(): Token {
    const startColumn = this.column;
    let value = "";

    while (this.currentChar && /[a-zA-Z_]/.test(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }

    // Verifica se é uma palavra-chave
    const keywords: { [key: string]: TokenType } = {
      bpm: TokenType.BPM,
      volume: TokenType.VOLUME,
      repeat: TokenType.REPEAT,
      sequence: TokenType.SEQUENCE,
    };

    return {
      type: keywords[value.toLowerCase()] || TokenType.IDENTIFIER,
      value,
      line: this.line,
      column: startColumn,
    };
  }

  public nextToken(): Token {
    while (this.currentChar !== null) {
      // Ignora espaços em branco
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      // Lida com comentários
      if (
        this.currentChar === "/" &&
        this.position + 1 < this.source.length &&
        this.source[this.position + 1] === "/"
      ) {
        this.skipComment();
        continue;
      }

      // Notas musicais (deve vir antes dos identificadores)
      if (this.isNoteStart()) {
        return this.readNote();
      }

      // Identificadores e palavras-chave
      if (/[a-zA-Z_]/.test(this.currentChar)) {
        return this.readIdentifier();
      }

      // Números e durações
      if (/[0-9]/.test(this.currentChar)) {
        return this.readNumber();
      }

      // Símbolos
      const symbols: { [key: string]: TokenType } = {
        "(": TokenType.LPAREN,
        ")": TokenType.RPAREN,
        "{": TokenType.LBRACE,
        "}": TokenType.RBRACE,
        ",": TokenType.COMMA,
      };

      if (this.currentChar in symbols) {
        const token: Token = {
          type: symbols[this.currentChar],
          value: this.currentChar,
          line: this.line,
          column: this.column,
        };
        this.advance();
        return token;
      }

      throw new Error(
        `Caractere inválido: ${this.currentChar} na linha ${this.line}, coluna ${this.column}`
      );
    }

    return {
      type: TokenType.EOF,
      value: "",
      line: this.line,
      column: this.column,
    };
  }
}
