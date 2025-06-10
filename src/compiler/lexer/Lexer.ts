import { Token, TokenType } from "./types";

const SYMBOLS: Record<string, TokenType> = {
  "(": TokenType.LPAREN,
  ")": TokenType.RPAREN,
  "{": TokenType.LBRACE,
  "}": TokenType.RBRACE,
  ",": TokenType.COMMA,
};

const KEYWORDS: Record<string, TokenType> = {
  bpm: TokenType.BPM,
  volume: TokenType.VOLUME,
  repeat: TokenType.REPEAT,
  sequence: TokenType.SEQUENCE,
};

const NOTES = new Set(["C", "D", "E", "F", "G", "A", "B"]);

export class Lexer {
  private position = 0;
  private line = 1;
  private column = 0;
  private currentChar: string | null;

  constructor(private source: string) {
    this.currentChar = source.length > 0 ? source[0] : null;
  }

  private advance(): void {
    this.position++;
    this.column++;
    this.currentChar = this.position < this.source.length ? this.source[this.position] : null;
  }

  private skipWhile(condition: (char: string) => boolean): void {
    while (this.currentChar && condition(this.currentChar)) {
      if (this.currentChar === "\n") {
        this.line++;
        this.column = 0;
      }
      this.advance();
    }
  }

  private skipWhitespace(): void {
    this.skipWhile(char => /\s/.test(char));
  }

  private skipComment(): void {
    // Assume já detectado "//"
    this.advance(); // skip first /
    this.advance(); // skip second /
    this.skipWhile(char => char !== "\n");

    if (this.currentChar === "\n") {
      this.line++;
      this.column = 0;
      this.advance();
    }

    this.skipWhitespace();
  }

  private isNoteStart(): boolean {
    if (!this.currentChar || !NOTES.has(this.currentChar.toUpperCase())) return false;
    const nextChar = this.source[this.position + 1];
    return nextChar === "#" || nextChar === "b" || /[0-9]/.test(nextChar);
  }

  private readWhile(condition: (char: string) => boolean): string {
    let value = "";
    while (this.currentChar && condition(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }
    return value;
  }

  private readNote(): Token {
    const startColumn = this.column;
    let value = this.currentChar!;
    this.advance();

    if (this.currentChar === "#" || this.currentChar === "b") {
      value += this.currentChar;
      this.advance();
    }

    const octave = this.readWhile(char => /[0-9]/.test(char));
    if (!octave) {
      throw new Error(`Nota inválida (falta oitava): ${value} na linha ${this.line}, coluna ${startColumn}`);
    }

    value += octave;

    return this.createToken(TokenType.NOTE, value, startColumn);
  }

  private readNumber(): Token {
    const startColumn = this.column;
    const value = this.readWhile(char => /[0-9/.]/.test(char));
    return this.createToken(TokenType.NUMBER, value, startColumn);
  }

  private readIdentifier(): Token {
    const startColumn = this.column;
    const value = this.readWhile(char => /[a-zA-Z_]/.test(char));
    const type = KEYWORDS[value.toLowerCase()] || TokenType.IDENTIFIER;
    return this.createToken(type, value, startColumn);
  }

  private createToken(type: TokenType, value: string, column: number): Token {
    return { type, value, line: this.line, column };
  }

  public nextToken(): Token {
    while (this.currentChar !== null) {
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      if (this.currentChar === "/" && this.source[this.position + 1] === "/") {
        this.skipComment();
        continue;
      }

      if (this.isNoteStart()) return this.readNote();
      if (/[a-zA-Z_]/.test(this.currentChar)) return this.readIdentifier();
      if (/[0-9]/.test(this.currentChar)) return this.readNumber();

      const type = SYMBOLS[this.currentChar];
      if (type !== undefined) {
        const token = this.createToken(type, this.currentChar, this.column);
        this.advance();
        return token;
      }

      throw new Error(`Caractere inválido: ${this.currentChar} na linha ${this.line}, coluna ${this.column}`);
    }

    return this.createToken(TokenType.EOF, "", this.column);
  }
}