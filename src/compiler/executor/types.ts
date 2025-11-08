export interface AudioContextState {
  context: AudioContext;
  mainGainNode: GainNode;
  tempo: number; // BPM
  volume: number; // 0-100
}

export interface NoteInfo {
  frequency: number; // Frequência em Hz
  duration: number; // Duração em segundos
  startTime: number; // Tempo de início em segundos
  volume: number; // Volume (0-1)
}

// Mapeamento de notas para frequências (Hz)
export const NOTE_FREQUENCIES: { [key: string]: number } = {
  C0: 16.35,
  "C#0": 17.32,
  Db0: 17.32,
  D0: 18.35,
  "D#0": 19.45,
  Eb0: 19.45,
  E0: 20.6,
  F0: 21.83,
  "F#0": 23.12,
  Gb0: 23.12,
  G0: 24.5,
  "G#0": 25.96,
  Ab0: 25.96,
  A0: 27.5,
  "A#0": 29.14,
  Bb0: 29.14,
  B0: 30.87,
  // ... outras oitavas são calculadas multiplicando por 2
};

// Mapeamento de durações para valores em segundos (em 120 BPM)
export const BASE_DURATIONS: { [key: string]: number } = {
  "1": 2, // Semibreve
  "1/2": 1, // Mínima
  "1/4": 0.5, // Semínima
  "1/8": 0.25, // Colcheia
  "1/16": 0.125, // Semicolcheia
};

export type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface SynthOptions {
  waveType?: WaveType;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  filterFrequency?: number;
  filterQ?: number;
}

export interface ExecutorOptions {
  onNoteStart?: (note: string, time: number) => void;
  onNoteEnd?: (note: string, time: number) => void;
  onSequenceStart?: (name: string, time: number) => void;
  onSequenceEnd?: (name: string, time: number) => void;
  synthOptions?: SynthOptions;
}
