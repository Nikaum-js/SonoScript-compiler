import { ASTNode, BpmStatement, NoteExpression, Program, RepeatStatement, SequenceDeclaration } from '../compiler/parser/types';

/**
 * Converte uma AST do SonoScript para o formato ABC Notation
 * ABC Notation é um formato de texto simples para notação musical
 */
export class SheetMusicConverter {
  private bpm: number = 120;

  /**
   * Converte a AST completa para ABC notation
   */
  public convertToABC(ast: Program): string {
    // Primeiro, processa todos os statements para extrair o BPM
    let musicBody = '';
    for (const statement of ast.body) {
      if (statement.type === 'BpmStatement') {
        this.bpm = (statement as BpmStatement).value;
      }
    }

    // Agora gera o cabeçalho com o BPM correto
    const abcNotation = `X:1
T:Partitura
M:4/4
L:1/4
Q:1/4=${this.bpm}
K:C
`;

    // Processa cada statement da AST para gerar o corpo musical
    for (const statement of ast.body) {
      musicBody += this.processStatement(statement);
    }

    return abcNotation + musicBody;
  }

  /**
   * Processa um statement individual da AST
   */
  private processStatement(statement: ASTNode): string {
    switch (statement.type) {
      case 'BpmStatement':
        this.bpm = (statement as BpmStatement).value;
        return ''; // BPM é definido no cabeçalho

      case 'VolumeStatement':
        return ''; // Volume não afeta a  visual

      case 'NoteExpression':
        return this.convertNote(statement as NoteExpression);

      case 'SequenceDeclaration':
        return this.processSequence(statement as SequenceDeclaration);

      case 'RepeatStatement':
        return this.processRepeat(statement as RepeatStatement);

      default:
        return '';
    }
  }

  /**
   * Processa uma sequência musical
   */
  private processSequence(sequence: SequenceDeclaration): string {
    let result = '';
    for (const statement of sequence.body) {
      result += this.processStatement(statement);
    }
    return result;
  }

  /**
   * Processa uma repetição
   */
  private processRepeat(repeat: RepeatStatement): string {
    let pattern = '';
    for (const statement of repeat.body) {
      pattern += this.processStatement(statement);
    }

    // Repete o padrão N vezes
    let result = '';
    for (let i = 0; i < repeat.count; i++) {
      result += pattern;
    }

    return result;
  }

  /**
   * Converte uma nota do SonoScript para ABC notation
   *
   * SonoScript: C4 1/4, D#5 1/8, Eb3 1/2
   * ABC: C D' _E,
   *
   * Oitavas em ABC:
   * - C,, (oitava 2)
   * - C, (oitava 3)
   * - C (oitava 4) - padrão
   * - c (oitava 5)
   * - c' (oitava 6)
   * - c'' (oitava 7)
   */
  private convertNote(note: NoteExpression): string {
    let abcNote = note.note;

    // Processa modificadores (# = sustenido, b = bemol)
    if (note.modifier === '#') {
      abcNote = '^' + abcNote; // ^ = sustenido em ABC
    } else if (note.modifier === 'b') {
      abcNote = '_' + abcNote; // _ = bemol em ABC
    }

    // Processa oitavas
    const octave = note.octave;
    if (octave < 4) {
      // Oitavas baixas usam vírgulas
      abcNote = abcNote.toUpperCase();
      const commas = 4 - octave;
      abcNote += ','.repeat(commas);
    } else if (octave === 4) {
      // Oitava padrão (C4 = C em ABC)
      abcNote = abcNote.toUpperCase();
    } else {
      // Oitavas altas usam letras minúsculas e apóstrofes
      abcNote = abcNote.toLowerCase();
      if (octave > 5) {
        const apostrophes = octave - 5;
        abcNote += "'".repeat(apostrophes);
      }
    }

    // Processa duração
    const duration = this.convertDuration(note.duration);
    abcNote += duration;

    return abcNote + ' ';
  }

  /**
   * Converte durações do SonoScript para ABC notation
   *
   * SonoScript: 1, 1/2, 1/4, 1/8, 1/16
   * ABC: 4, 2, (vazio = 1/4), /2, /4
   */
  private convertDuration(duration: string): string {
    switch (duration) {
      case '1':
        return '4'; // Semibreve
      case '1/2':
        return '2'; // Mínima
      case '1/4':
        return ''; // Semínima (padrão em ABC quando L:1/4)
      case '1/8':
        return '/2'; // Colcheia
      case '1/16':
        return '/4'; // Semicolcheia
      default:
        return '';
    }
  }

  /**
   * Adiciona quebras de linha para melhor visualização
   */
  public formatABC(abc: string): string {
    const lines = abc.split('\n');
    const header = lines.slice(0, 6).join('\n') + '\n';
    const notes = lines.slice(6).join('').trim();

    const noteArray = notes.split(' ').filter(n => n.length > 0);
    let formatted = header;

    for (let i = 0; i < noteArray.length; i++) {
      formatted += noteArray[i] + ' ';
      // Adiciona barra de compasso a cada 8 notas, mas não na última nota
      if ((i + 1) % 8 === 0 && (i + 1) < noteArray.length) {
        formatted += '|\n';
      }
    }

    formatted += '|]'; // Fim da música

    return formatted;
  }
}
