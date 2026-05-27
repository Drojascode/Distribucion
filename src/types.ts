export interface Seat {
  id: string;
  row: number;
  side: 'L' | 'R';
  col: number;
}

export type Asignaciones = Record<string, string>; // student -> seatId
export type Nicknames = Record<string, string>; // student -> display name
export type Avatares = Record<string, string>;  // student -> emoji

export interface VistaEstudianteProps {
  seats: Seat[];
  asignaciones: Asignaciones;
  listaEspera: string[];
  nicknames: Nicknames;
  avatares: Avatares;
  onSeatSelect: (student: string, seatId: string) => void;
  onNicknameChange: (student: string, nickname: string) => void;
  onAvatarChange: (student: string, emoji: string) => void;
}

export interface VistaProfesorProps {
  seats: Seat[];
  asignaciones: Asignaciones;
  listaEspera: string[];
  nicknames: Nicknames;
  avatares: Avatares;
  preguntados: string[];
  estudianteDestacado: string | null;
  onRuletaResult: (student: string) => void;
  onRuletaReset: () => void;
}

export interface RuletaProps {
  candidatos: string[];           // seated students not yet asked
  nicknames: Nicknames;
  onResult: (student: string) => void;
  onReset: () => void;
  preguntados: string[];
}
