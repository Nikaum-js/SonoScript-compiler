import { NoteExpression, Program, Statement } from "../parser/types";
import {
  AudioContextState,
  BASE_DURATIONS,
  ExecutorOptions,
  NOTE_FREQUENCIES,
  NoteInfo,
  SynthOptions,
} from "./types";

export class Executor {
  private state: AudioContextState;
  private currentTime: number = 0;
  private options: ExecutorOptions;
  private synthOptions: Required<SynthOptions>;
  private activeNodes: Set<AudioNode> = new Set();

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

    // Configurações padrão de síntese com valores otimizados
    this.synthOptions = {
      waveType: options.synthOptions?.waveType || 'triangle',
      attack: options.synthOptions?.attack || 0.02,
      decay: options.synthOptions?.decay || 0.1,
      sustain: options.synthOptions?.sustain || 0.7,
      release: options.synthOptions?.release || 0.15,
      filterFrequency: options.synthOptions?.filterFrequency || 2000,
      filterQ: options.synthOptions?.filterQ || 1,
    };
  }

  // Calcula a frequência de uma nota em uma oitava específica
  private getNoteFrequency(note: string, octave: number): number {
    const baseNote = (note + "0").replace(/\d+0$/, "0");
    const baseFreq = NOTE_FREQUENCIES[baseNote];

    if (baseFreq === undefined) {
      throw new Error(`Invalid note: ${note} (base note: ${baseNote})`);
    }

    if (!Number.isFinite(octave)) {
      throw new Error(`Invalid octave: ${octave}`);
    }

    const calculatedFreq = baseFreq * Math.pow(2, octave);

    if (!Number.isFinite(calculatedFreq)) {
      throw new Error(
        `Invalid frequency calculation for note ${note} octave ${octave}`
      );
    }

    return calculatedFreq;
  }

  // Calcula a duração real de uma nota baseada no tempo
  private getNoteDuration(duration: string): number {
    const baseDuration = BASE_DURATIONS[duration];
    return (baseDuration * 60) / this.state.tempo;
  }

  // Toca uma única nota com síntese melhorada
  private async playNote(noteInfo: NoteInfo): Promise<void> {
    const { context, mainGainNode } = this.state;

    if (!Number.isFinite(noteInfo.frequency)) {
      return;
    }

    // Cria o oscilador principal
    const oscillator = context.createOscillator();
    oscillator.type = this.synthOptions.waveType;
    oscillator.frequency.value = noteInfo.frequency;

    // Cria filtro low-pass para som mais natural
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = this.synthOptions.filterFrequency;
    filter.Q.value = this.synthOptions.filterQ;

    // Cria o envelope ADSR completo
    const gainNode = context.createGain();
    gainNode.gain.value = 0;

    // Conecta os nós: Oscillator -> Filter -> Gain -> Main
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(mainGainNode);

    // Registra nós ativos para limpeza posterior
    this.activeNodes.add(oscillator);
    this.activeNodes.add(filter);
    this.activeNodes.add(gainNode);

    // Parâmetros do envelope ADSR
    const startTime = noteInfo.startTime;
    const { attack, decay, sustain, release } = this.synthOptions;

    const peakVolume = noteInfo.volume;
    const sustainVolume = peakVolume * sustain;

    // ADSR Envelope completo
    const attackEndTime = startTime + attack;
    const decayEndTime = attackEndTime + decay;
    const noteEndTime = startTime + noteInfo.duration - release;
    const releaseEndTime = startTime + noteInfo.duration;

    // Attack: 0 -> peak
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(peakVolume, attackEndTime);

    // Decay: peak -> sustain
    gainNode.gain.linearRampToValueAtTime(sustainVolume, decayEndTime);

    // Sustain: mantém o nível
    gainNode.gain.setValueAtTime(sustainVolume, noteEndTime);

    // Release: sustain -> 0
    gainNode.gain.linearRampToValueAtTime(0, releaseEndTime);

    // Variação sutil no filtro durante a nota para mais naturalidade
    filter.frequency.setValueAtTime(this.synthOptions.filterFrequency, startTime);
    filter.frequency.linearRampToValueAtTime(
      this.synthOptions.filterFrequency * 0.8,
      releaseEndTime
    );

    // Inicia e para o oscilador
    oscillator.start(startTime);
    oscillator.stop(releaseEndTime);

    // Limpa os nós após a nota terminar
    oscillator.onended = () => {
      this.activeNodes.delete(oscillator);
      this.activeNodes.delete(filter);
      this.activeNodes.delete(gainNode);

      try {
        oscillator.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      } catch (e) {
        // Nós já podem estar desconectados
      }
    };

    // Notifica callbacks
    if (this.options.onNoteStart) {
      const noteString = `${noteInfo.frequency.toFixed(2)} Hz`;
      setTimeout(() => {
        this.options.onNoteStart!(noteString, startTime);
      }, (startTime - context.currentTime) * 1000);
    }

    if (this.options.onNoteEnd) {
      const noteString = `${noteInfo.frequency.toFixed(2)} Hz`;
      setTimeout(() => {
        this.options.onNoteEnd!(noteString, releaseEndTime);
      }, (releaseEndTime - context.currentTime) * 1000);
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

  // Para a execução e limpa os recursos de forma adequada
  public stop(): void {
    // Fade out suave do volume principal
    const fadeTime = 0.05;
    this.state.mainGainNode.gain.setValueAtTime(
      this.state.mainGainNode.gain.value,
      this.state.context.currentTime
    );
    this.state.mainGainNode.gain.linearRampToValueAtTime(
      0,
      this.state.context.currentTime + fadeTime
    );

    // Limpa todos os nós ativos
    setTimeout(() => {
      this.activeNodes.forEach(node => {
        try {
          node.disconnect();
        } catch (e) {
          // Nó já pode estar desconectado
        }
      });
      this.activeNodes.clear();

      // Restaura o volume para próxima execução
      this.state.mainGainNode.gain.setValueAtTime(
        1,
        this.state.context.currentTime
      );
    }, fadeTime * 1000);
  }

  // Permite atualizar opções de síntese em tempo real
  public updateSynthOptions(options: Partial<SynthOptions>): void {
    this.synthOptions = {
      ...this.synthOptions,
      ...options,
    };
  }

  // Retorna as opções atuais de síntese
  public getSynthOptions(): SynthOptions {
    return { ...this.synthOptions };
  }
}
