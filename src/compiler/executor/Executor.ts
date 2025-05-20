import { NoteExpression, Program, Statement } from "../parser/types";
import {
  AudioContextState,
  BASE_DURATIONS,
  ExecutorOptions,
  NOTE_FREQUENCIES,
  NoteInfo,
} from "./types";

export class Executor {
  private state: AudioContextState;
  private currentTime: number = 0;
  private options: ExecutorOptions;

  constructor(options: ExecutorOptions = {}) {
    const context = new AudioContext();
    const mainGainNode = context.createGain();
    mainGainNode.connect(context.destination);

    this.state = {
      context,
      mainGainNode,
      tempo: 120,
      volume: 80,
    };

    this.options = options;
  }

  // Calcula a frequência de uma nota em uma oitava específica
  private getNoteFrequency(note: string, octave: number): number {
    // Garante que a nota base tenha o formato correto (ex: C0, D#0, etc.)
    const baseNote = (note + "0").replace(/\d+0$/, "0");
    const baseFreq = NOTE_FREQUENCIES[baseNote];

    if (baseFreq === undefined) {
      console.error("Invalid note:", {
        note,
        baseNote,
        availableNotes: Object.keys(NOTE_FREQUENCIES),
      });
      throw new Error(`Invalid note: ${note} (base note: ${baseNote})`);
    }

    if (!Number.isFinite(octave)) {
      console.error("Invalid octave:", octave);
      throw new Error(`Invalid octave: ${octave}`);
    }

    const calculatedFreq = baseFreq * Math.pow(2, octave);

    if (!Number.isFinite(calculatedFreq)) {
      console.error("Invalid frequency calculation:", {
        baseFreq,
        octave,
        calculatedFreq,
      });
      throw new Error(
        `Invalid frequency calculation for note ${note} octave ${octave}`
      );
    }

    console.log("Debug - getNoteFrequency:", {
      inputNote: note,
      inputOctave: octave,
      baseNote,
      baseFreq,
      calculatedFreq,
    });

    return calculatedFreq;
  }

  // Calcula a duração real de uma nota baseada no tempo
  private getNoteDuration(duration: string): number {
    const baseDuration = BASE_DURATIONS[duration];
    return (baseDuration * 60) / this.state.tempo;
  }

  // Toca uma única nota
  private async playNote(noteInfo: NoteInfo): Promise<void> {
    console.log("Debug - playNote input:", noteInfo);
    const { context, mainGainNode } = this.state;

    // Cria o oscilador
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    if (!Number.isFinite(noteInfo.frequency)) {
      console.error("Invalid frequency detected:", noteInfo.frequency);
      return;
    }
    oscillator.frequency.value = noteInfo.frequency;

    // Cria o envelope de amplitude
    const gainNode = context.createGain();
    gainNode.gain.value = 0;

    // Conecta os nós
    oscillator.connect(gainNode);
    gainNode.connect(mainGainNode);

    // Agenda o início da nota
    const startTime = noteInfo.startTime;
    const attackTime = 0.01;
    const releaseTime = 0.05;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(
      noteInfo.volume,
      startTime + attackTime
    );
    gainNode.gain.setValueAtTime(
      noteInfo.volume,
      startTime + noteInfo.duration - releaseTime
    );
    gainNode.gain.linearRampToValueAtTime(0, startTime + noteInfo.duration);

    // Inicia e para o oscilador
    oscillator.start(startTime);
    oscillator.stop(startTime + noteInfo.duration);

    // Notifica o início e fim da nota
    if (this.options.onNoteStart) {
      setTimeout(() => {
        this.options.onNoteStart!(noteInfo.frequency.toString(), startTime);
      }, startTime * 1000);
    }

    if (this.options.onNoteEnd) {
      setTimeout(() => {
        this.options.onNoteEnd!(
          noteInfo.frequency.toString(),
          startTime + noteInfo.duration
        );
      }, (startTime + noteInfo.duration) * 1000);
    }
  }

  // Executa uma expressão de nota
  private executeNoteExpression(note: NoteExpression): void {
    const frequency = this.getNoteFrequency(
      note.note + (note.modifier || ""),
      note.octave
    );
    const duration = this.getNoteDuration(note.duration);

    const noteInfo: NoteInfo = {
      frequency,
      duration,
      startTime: this.currentTime,
      volume: this.state.volume / 100,
    };

    this.playNote(noteInfo);
    this.currentTime += duration;
  }

  // Executa uma declaração
  private executeStatement(statement: Statement): void {
    switch (statement.type) {
      case "BpmStatement":
        this.state.tempo = statement.value;
        break;

      case "VolumeStatement":
        this.state.volume = statement.value;
        break;

      case "NoteExpression":
        this.executeNoteExpression(statement);
        break;

      case "RepeatStatement": {
        for (let i = 0; i < statement.count; i++) {
          statement.body.forEach((s) => this.executeStatement(s));
        }
        break;
      }

      case "SequenceDeclaration":
        if (this.options.onSequenceStart) {
          this.options.onSequenceStart(statement.name, this.currentTime);
        }

        statement.body.forEach((s) => this.executeStatement(s));

        if (this.options.onSequenceEnd) {
          this.options.onSequenceEnd(statement.name, this.currentTime);
        }
        break;
    }
  }

  // Executa o programa inteiro
  public execute(program: Program): void {
    this.currentTime = this.state.context.currentTime;
    program.body.forEach((statement) => this.executeStatement(statement));
  }

  // Para a execução e limpa os recursos
  public stop(): void {
    this.state.mainGainNode.gain.setValueAtTime(
      0,
      this.state.context.currentTime
    );
    this.state.context.close();
  }
}
