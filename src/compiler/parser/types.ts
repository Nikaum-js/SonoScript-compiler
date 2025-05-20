// Tipos base para todos os nós da AST
export interface ASTNode {
  type: string;
  line: number;
  column: number;
}

// Programa completo
export interface Program extends ASTNode {
  type: "Program";
  body: Statement[];
}

// Declarações
export type Statement =
  | BpmStatement
  | VolumeStatement
  | SequenceDeclaration
  | RepeatStatement
  | NoteExpression;

export interface BpmStatement extends ASTNode {
  type: "BpmStatement";
  value: number;
}

export interface VolumeStatement extends ASTNode {
  type: "VolumeStatement";
  value: number;
}

export interface SequenceDeclaration extends ASTNode {
  type: "SequenceDeclaration";
  name: string;
  body: Statement[];
}

export interface RepeatStatement extends ASTNode {
  type: "RepeatStatement";
  count: number;
  body: Statement[];
}

// Expressões musicais
export interface NoteExpression extends ASTNode {
  type: "NoteExpression";
  note: string; // C, D, E, etc.
  modifier?: string; // # ou b
  octave: number; // 4, 5, etc.
  duration: string; // 1/4, 1/8, etc.
}
