import { Lexer } from "../lexer/Lexer";
import { Token, TokenType } from "../lexer/types";
import {
  BpmStatement,
  NoteExpression,
  Program,
  RepeatStatement,
  SequenceDeclaration,
  Statement,
  VolumeStatement,
} from "./types";

export class Parser {
  private lexer: Lexer;
  private currentToken: Token;

  constructor(source: string) {
    this.lexer = new Lexer(source);
    this.currentToken = this.lexer.nextToken();
  }

  private eat(tokenType: TokenType): Token {
    if (this.currentToken.type === tokenType) {
      const token = this.currentToken;
      this.currentToken = this.lexer.nextToken();
      return token;
    }
    throw new Error(
      `Erro de sintaxe: esperado '${tokenType}', encontrado '${this.currentToken.type}' na linha ${this.currentToken.line}, coluna ${this.currentToken.column}`
    );
  }

  private peek(): Token {
    return this.currentToken;
  }

  // Programa principal
  public parse(): Program {
    const program: Program = {
      type: "Program",
      body: [],
      line: 1,
      column: 1,
    };

    while (this.currentToken.type !== TokenType.EOF) {
      program.body.push(this.parseStatement());
      // Opcionalmente consome uma vírgula entre statements
      if (this.currentToken.type === TokenType.COMMA) {
        this.eat(TokenType.COMMA);
      }
    }

    return program;
  }

  // Análise de declarações
  private parseStatement(): Statement {
    switch (this.currentToken.type) {
      case TokenType.BPM:
        return this.parseBpmStatement();
      case TokenType.VOLUME:
        return this.parseVolumeStatement();
      case TokenType.SEQUENCE:
        return this.parseSequenceDeclaration();
      case TokenType.REPEAT:
        return this.parseRepeatStatement();
      case TokenType.NOTE:
        return this.parseNoteExpression();
      default:
        throw new Error(
          `Erro de sintaxe: token inesperado '${this.currentToken.type}' na linha ${this.currentToken.line}, coluna ${this.currentToken.column}`
        );
    }
  }

  private parseStatementList(): Statement[] {
    const statements: Statement[] = [];

    while (
      this.currentToken.type !== TokenType.EOF &&
      this.currentToken.type !== TokenType.RBRACE
    ) {
      statements.push(this.parseStatement());
      // Opcionalmente consome uma vírgula entre statements
      if (this.currentToken.type === TokenType.COMMA) {
        this.eat(TokenType.COMMA);
      }
    }

    return statements;
  }

  private parseBpmStatement(): BpmStatement {
    const token = this.eat(TokenType.BPM);
    const valueToken = this.eat(TokenType.NUMBER);

    return {
      type: "BpmStatement",
      value: parseInt(valueToken.value),
      line: token.line,
      column: token.column,
    };
  }

  private parseVolumeStatement(): VolumeStatement {
    const token = this.eat(TokenType.VOLUME);
    const valueToken = this.eat(TokenType.NUMBER);

    return {
      type: "VolumeStatement",
      value: parseInt(valueToken.value),
      line: token.line,
      column: token.column,
    };
  }

  private parseSequenceDeclaration(): SequenceDeclaration {
    const token = this.eat(TokenType.SEQUENCE);
    const nameToken = this.eat(TokenType.IDENTIFIER);
    this.eat(TokenType.LBRACE);
    const body = this.parseStatementList();
    this.eat(TokenType.RBRACE);

    return {
      type: "SequenceDeclaration",
      name: nameToken.value,
      body,
      line: token.line,
      column: token.column,
    };
  }

  private parseRepeatStatement(): RepeatStatement {
    const token = this.eat(TokenType.REPEAT);
    this.eat(TokenType.LPAREN);
    const countToken = this.eat(TokenType.NUMBER);
    this.eat(TokenType.RPAREN);
    this.eat(TokenType.LBRACE);
    const body = this.parseStatementList();
    this.eat(TokenType.RBRACE);

    return {
      type: "RepeatStatement",
      count: parseInt(countToken.value),
      body,
      line: token.line,
      column: token.column,
    };
  }

  private parseNoteExpression(): NoteExpression {
    const token = this.currentToken;
    this.eat(TokenType.NOTE);

    // Extrair nota, modificador e oitava do valor do token
    const noteMatch = token.value.match(/^([A-G])(#|b)?(\d+)$/);
    if (!noteMatch) {
      throw new Error(
        `Nota inválida: ${token.value} na linha ${token.line}, coluna ${token.column}`
      );
    }

    const [, note, modifier, octave] = noteMatch;
    const durationToken = this.eat(TokenType.NUMBER);

    return {
      type: "NoteExpression",
      note,
      modifier,
      octave: parseInt(octave),
      duration: durationToken.value,
      line: token.line,
      column: token.column,
    };
  }
}
